import pandas as pd
import random
from simulation.engine import SimulationEngine

def generate_data():
    """
    Runs multiple simulations with random demand to generate an ENHANCED dataset
    for training a smarter ML model.
    """
    num_simulations = 100
    num_weeks = 100
    all_data = []

    print(f"Running {num_simulations} simulations to generate enhanced training data...")

    for i in range(num_simulations):
        # PASS enable_analyst=False TO TURN OFF API CALLS
        engine = SimulationEngine(agent_config={}, enable_analyst=False)
        demand_history = []

        for week in range(1, num_weeks + 1):
            if random.random() < 0.05:
                customer_demand = random.randint(50, 80)
            else:
                customer_demand = random.randint(15, 35)
            
            demand_history.append(customer_demand)
            if len(demand_history) > 4:
                demand_history.pop(0)
            
            demand_trend = sum(demand_history) / len(demand_history)

            prior_states = {
                agent.name: {'inventory': agent.inventory, 'backlog': agent.backlog}
                for agent in engine.agents
            }
            
            engine.run_step(week, customer_demand)

            for agent in engine.agents:
                if agent.name == "Factory":
                    continue
                
                features = prior_states[agent.name]
                action = agent.history["placed_order_amount"][-1]
                result_cost = agent.history["cost"][-1]
                
                all_data.append({
                    'agent_name': agent.name,
                    'inventory': features['inventory'],
                    'backlog': features['backlog'],
                    'demand_trend': demand_trend,
                    'placed_order': action,
                    'weekly_cost': result_cost
                })
        
        if (i + 1) % 10 == 0:
            print(f"  ...completed {i + 1}/{num_simulations} simulations.")

    df = pd.DataFrame(all_data)
    df.to_csv('training_data_v2.csv', index=False)
    print("\nSuccessfully generated and saved 'training_data_v2.csv'.")
    print(f"Dataset contains {len(df)} records.")

if __name__ == "__main__":
    generate_data()