import asyncio
import uuid
import os
from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from simulation.engine import SimulationEngine
from simulation.analyst import get_final_summary
from typing import Dict
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# --- DATABASE CONNECTION ---
MONGO_URI = os.environ.get("MONGO_CONNECTION_STRING")
client = MongoClient(MONGO_URI)
db = client.chainreact_db
simulations_collection = db.simulations

app = FastAPI()

# --- CORS CONFIGURATION ---
# This list explicitly allows your frontend (both local and deployed) to connect.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ash4sylfxs.us-east-1.awsapprunner.com", # Your public frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

active_simulations: Dict[str, SimulationEngine] = {}

class DisruptionEvent(BaseModel):
    type: str
    value: int
    duration: int

@app.get("/")
def read_root():
    return {"message": "ChainReact Backend is running"}

@app.post("/simulation/{simulation_id}/disrupt")
def disrupt_simulation(simulation_id: str, event: DisruptionEvent):
    simulation_engine = active_simulations.get(simulation_id)
    if not simulation_engine:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    simulation_engine.inject_disruption(event.model_dump())
    return {"message": f"Disruption '{event.type}' injected into simulation {simulation_id}"}

@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    simulation_id = str(uuid.uuid4())
    
    try:
        start_data = await websocket.receive_json()
        if start_data.get("type") != "start_simulation":
            return

        agent_config = start_data.get("config", {})
        num_weeks = start_data.get("weeks", 50)
        
        engine = SimulationEngine(agent_config=agent_config, enable_analyst=True)
        active_simulations[simulation_id] = engine
        
        await websocket.send_json({"type": "simulation_id", "id": simulation_id})
        
        customer_demand = 20
        for week in range(1, num_weeks + 1):
            if week == 10:
                customer_demand = 25

            engine.run_step(week, customer_demand)

            current_state = {"week": week, "agents": {}}
            for agent in engine.agents:
                current_state["agents"][agent.name] = {
                    "inventory": agent.history["inventory"][-1],
                    "placed_order_amount": agent.history["placed_order_amount"][-1],
                    "backlog": agent.backlog,
                    "cost": agent.history["cost"][-1]
                }
            
            if engine.events_this_step:
                current_state["events"] = engine.events_this_step

            await websocket.send_json(current_state)
            await asyncio.sleep(0.3)
        
        total_costs = {agent.name: int(sum(agent.history['cost'])) for agent in engine.agents}
        
        summary_input = {
            "agent_config": engine.agent_config,
            "total_costs": total_costs
        }
        summary_text = get_final_summary(summary_input)

        retailer_inv_history = engine.retailer.history['inventory']
        retailer_total_cost = total_costs.get("Retailer", 0)
        retailer_holding_cost = int(sum(inv * engine.retailer.holding_cost for inv in retailer_inv_history))
        retailer_stockout_cost = retailer_total_cost - retailer_holding_cost
        
        final_summary_payload = {
            "type": "final_summary",
            "title": "Simulation Complete: AI-Generated Performance Dashboard",
            "summary_text": summary_text,
            "total_cost_data": [{"name": name, "cost": cost} for name, cost in total_costs.items()],
            "inventory_stability_data": [{"week": i, "inventory": inv} for i, inv in enumerate(retailer_inv_history)],
            "cost_breakdown_data": [
                {"name": "Holding Cost", "value": retailer_holding_cost},
                {"name": "Stockout Cost", "value": retailer_stockout_cost}
            ]
        }
        await websocket.send_json(final_summary_payload)

        db_payload = {
            "simulation_id": simulation_id,
            "agent_config": engine.agent_config,
            "summary": final_summary_payload,
            "full_history": {agent.name: agent.history for agent in engine.agents}
        }
        simulations_collection.insert_one(db_payload)
        print(f"Simulation {simulation_id} results saved to MongoDB.")
            
    except WebSocketDisconnect:
        print(f"Client disconnected. Simulation {simulation_id} closing.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if simulation_id in active_simulations:
            del active_simulations[simulation_id]
            print(f"Simulation {simulation_id} removed.")