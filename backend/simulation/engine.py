from typing import List, Dict
from .agent import Agent
from .ai_agent import AIAgent
from .analyst import get_dynamic_commentary

class SimulationEngine:
    # ADD enable_analyst PARAMETER
    def __init__(self, agent_config: Dict[str, str], enable_analyst: bool = True):
        print(f"Initializing simulation with config: {agent_config}")
        self.enable_analyst = enable_analyst # STORE THE SWITCH
        
        agent_classes = {'RULE': Agent, 'AI': AIAgent}
        agent_names = ["Factory", "Distributor", "Wholesaler", "Retailer"]
        
        self.agents: List[Agent] = []
        for name in agent_names:
            agent_type = agent_config.get(name, 'RULE')
            agent_class = agent_classes.get(agent_type, Agent)
            self.agents.append(agent_class(name=name))
            
        self.factory, self.distributor, self.wholesaler, self.retailer = self.agents[0], self.agents[1], self.agents[2], self.agents[3]

        self._link_agents()
        self.agent_config = agent_config
        self.events_this_step: List[Dict] = []

        self.disruption_active = False
        self.disruption_value = 0
        self.disruption_duration = 0

    def _link_agents(self):
        self.retailer.upstream_agent = self.wholesaler
        self.wholesaler.downstream_agent = self.retailer
        self.wholesaler.upstream_agent = self.distributor
        self.distributor.downstream_agent = self.wholesaler
        self.distributor.upstream_agent = self.factory
        self.factory.downstream_agent = self.distributor

    def inject_disruption(self, event: Dict):
        print(f"--- DISRUPTION INJECTED: {event} ---")
        self.disruption_active = True
        self.disruption_type = event.get("type")
        self.disruption_value = event.get("value", 0)
        self.disruption_duration = event.get("duration", 0)
        
        # CHECK THE SWITCH
        if self.enable_analyst:
            commentary = get_dynamic_commentary("DISRUPTION", {"value": self.disruption_value, "duration": self.disruption_duration, "week": -1})
            self.events_this_step.append({ "week": -1, "type": "CRITICAL", "text": commentary })

    def run_step(self, week: int, customer_demand: int):
        self.events_this_step = []
        
        for event in self.events_this_step:
            if event["week"] == -1:
                event["text"] = event["text"].replace("at week -1", f"at week {week}")

        original_demand = customer_demand
        if week == 10 and customer_demand == 20:
            customer_demand = 25
            # CHECK THE SWITCH
            if self.enable_analyst:
                commentary = get_dynamic_commentary("DEMAND_SHIFT", {"week": week})
                self.events_this_step.append({"week": week, "type": "INFO", "text": commentary})

        if self.disruption_active and self.disruption_duration > 0:
            if self.disruption_type == "DEMAND_SPIKE":
                customer_demand = self.disruption_value
            self.disruption_duration -= 1
        else:
            self.disruption_active = False

        for agent in reversed(self.agents):
            agent.receive_shipment()

        self.retailer.fulfill_downstream_orders(customer_demand)
        for agent in self.agents:
            if agent != self.retailer:
                agent.fulfill_downstream_orders()

        for agent in self.agents:
            agent.place_upstream_order()

        for agent in self.agents:
            agent.record_state()
        
        retailer_order = self.retailer.history['placed_order_amount'][-1]
        distributor_order = self.distributor.history['placed_order_amount'][-1]
        if week > 15 and distributor_order > original_demand * 3 and distributor_order > 50:
             if not any(e['type'] == 'WARNING' for e in self.events_this_step):
                # CHECK THE SWITCH
                if self.enable_analyst:
                    commentary = get_dynamic_commentary("BULLWHIP", {"week": week, "retailer_order": retailer_order, "distributor_order": distributor_order})
                    self.events_this_step.append({"week": week, "type": "WARNING", "text": commentary})