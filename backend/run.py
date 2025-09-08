# In backend/run.py

from simulation.engine import SimulationEngine
import json

def main():
    """
    Initializes and runs the simulation, then prints the results.
    """
    print("Initializing ChainReact simulation...")
    engine = SimulationEngine()
    
    num_weeks = 50
    customer_demand = 20
    
    print(f"Running simulation for {num_weeks} weeks...")
    print(f"Initial stable customer demand: {customer_demand} units/week.")

    for week in range(1, num_weeks + 1):
        # Introduce a sudden, small increase in demand at week 10
        if week == 10:
            customer_demand = 25
            print(f"!!! Week {week}: Customer demand permanently increases to {customer_demand} units/week. !!!")
            
        engine.run_step(week, customer_demand)

    print("\n--- Simulation Complete ---")
    print("--- Final Historical Order Data ---")

    # Print the results in a structured way
    all_history = {}
    for agent in engine.agents:
        print(f"\nAgent: {agent.name}")
        print(f"  Orders Placed: {agent.history['placed_order_amount']}")
        all_history[agent.name] = agent.history

    # Optionally, save to a file to inspect the data
    with open("simulation_results.json", "w") as f:
        json.dump(all_history, f, indent=2)
    print("\nFull results saved to simulation_results.json")


if __name__ == "__main__":
    main()