class Agent:
    def __init__(self, name: str, target_inventory: int = 100):
        self.name = name
        self.upstream_agent: 'Agent' | None = None
        self.downstream_agent: 'Agent' | None = None
        
        self.holding_cost = 1
        self.stockout_cost = 5

        self.inventory: int = target_inventory
        self.target_inventory: int = target_inventory
        self.backlog: int = 0
        self.incoming_shipment: int = 0
        self.placed_order_amount: int = 0
        self.shipped_this_week: int = 0

        self.history = {
            "inventory": [self.inventory],
            "placed_order_amount": [0],
            "cost": [0]
        }

    def __repr__(self):
        cost_this_week = self.history["cost"][-1] if self.history["cost"] else 0
        return f"Agent({self.name}, Inv: {self.inventory}, Backlog: {self.backlog}, Order: {self.placed_order_amount}, Cost: {cost_this_week})"
    
    def receive_shipment(self):
        self.inventory += self.incoming_shipment
        self.incoming_shipment = 0

    def fulfill_downstream_orders(self, customer_demand: int = 0):
        if self.name == "Retailer":
            total_demand = self.backlog + customer_demand
        else:
            total_demand = self.backlog
        units_to_ship = min(self.inventory, total_demand)
        self.shipped_this_week = units_to_ship
        if self.downstream_agent:
            self.downstream_agent.incoming_shipment = units_to_ship
        self.inventory -= units_to_ship
        self.backlog = total_demand - units_to_ship
    
    def place_upstream_order(self):
        if self.name == "Factory":
            units_to_produce = self.shipped_this_week
            self.inventory += units_to_produce
            self.placed_order_amount = units_to_produce
        else:
            inventory_discrepancy = self.target_inventory - self.inventory
            order_amount = self.shipped_this_week + inventory_discrepancy
            self.placed_order_amount = max(0, int(order_amount))
            if self.upstream_agent:
                self.upstream_agent.backlog += self.placed_order_amount
        self.shipped_this_week = 0
    
    def record_state(self):
        self.history['inventory'].append(self.inventory)
        self.history['placed_order_amount'].append(self.placed_order_amount)
        
        cost_this_week = (self.inventory * self.holding_cost) + (self.backlog * self.stockout_cost)
        self.history['cost'].append(cost_this_week)