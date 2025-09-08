import joblib
import numpy as np
import pandas as pd
from .agent import Agent

class AIAgent(Agent):
    def __init__(self, name: str, target_inventory: int = 100):
        super().__init__(name, target_inventory)
        self.demand_history = []
        try:
            self.model = joblib.load('agent_model.joblib')
            print(f"AIAgent '{self.name}' initialized and model loaded successfully.")
        except FileNotFoundError:
            print(f"ERROR: Could not find 'agent_model.joblib'. Please train the model first.")
            self.model = None

    def fulfill_downstream_orders(self, customer_demand: int = 0):
        if self.name == "Retailer":
            demand_this_week = self.backlog + customer_demand
        else:
            demand_this_week = self.backlog
        
        self.demand_history.append(demand_this_week)
        if len(self.demand_history) > 4:
            self.demand_history.pop(0)

        super().fulfill_downstream_orders(customer_demand)

    def place_upstream_order(self):
        if self.name == "Factory" or not self.model:
            super().place_upstream_order()
            return

        demand_trend = sum(self.demand_history) / len(self.demand_history) if self.demand_history else 0
            
        feature_names = ['inventory', 'backlog', 'demand_trend']
        current_state_df = pd.DataFrame([[self.inventory, self.backlog, demand_trend]], columns=feature_names)
        
        predicted_order = self.model.predict(current_state_df)[0]
        self.placed_order_amount = max(0, int(predicted_order))

        if self.upstream_agent:
            self.upstream_agent.backlog += self.placed_order_amount
        
        self.shipped_this_week = 0