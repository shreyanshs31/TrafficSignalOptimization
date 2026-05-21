import logging
import datetime

# Setting up professional logging for final year project
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TrafficCoordinator")

class NetworkCoordinator:
    def __init__(self):
        """
        The Registry stores the real-time state of every lane.
        Structure: { "junction_id": { "lane_id": { status_data } } }
        """
        self.registry = {}
        
        # Cumulative stats for Dashboard Pie Chart
        self.cumulative_counts = {
            "cars": 0, 
            "motorcycles": 0, 
            "buses": 0, 
            "trucks": 0
        }
        
        # Hourly history for Dashboard Bar Chart
        # Format: { "14:00": total_vehicles, "15:00": total_vehicles }
        self.hourly_history = {}

        # The Adjacency Map defines the physical connections for 'Green Wave' logic
        self.adjacency_map = {
            "junction_01": {"north": "junction_02", "south": None, "east": None, "west": None},
            "junction_02": {"north": None, "south": "junction_01", "east": None, "west": None}
        }

    def update_lane_state(self, junction_id, lane_id, data):
        """
        Updates the local state with AI results and triggers network coordination.
        """
        if junction_id not in self.registry:
            self.registry[junction_id] = {}
        
        # Merge new AI detection data with current state (preserving exit flow data)
        current_lane_data = self.registry[junction_id].get(lane_id, {})
        current_lane_data.update(data)
        self.registry[junction_id][lane_id] = current_lane_data

        # 1. Update Dashboard Stats only when the light is active (Green)
        # This prevents counting the same stationary cars repeatedly in the total history
        if data.get("is_active") and "stats" in data:
            stats = data["stats"]
            for v_type, count in stats.items():
                self.cumulative_counts[v_type] += count
            
            # Update the hourly bar chart data
            current_hour = datetime.datetime.now().strftime("%H:00")
            total_in_frame = sum(stats.values())
            self.hourly_history[current_hour] = self.hourly_history.get(current_hour, 0) + total_in_frame

        # 2. Handle Emergency Propagation (Green Wave)
        if data.get("is_emergency"):
            self._propagate_green_wave(junction_id, lane_id)

        # 3. Handle Accident Alerts
        if data.get("accident_alert"):
            logger.warning(f"⚠️ NETWORK ALERT: Accident at {junction_id} on {lane_id} lane.")

    def update_exit_flow(self, junction_id, lane_id, status):
        """
        Receives data from direction.py (the extra 4 feeds) to verify exit clearance.
        """
        if junction_id not in self.registry:
            self.registry[junction_id] = {}
        if lane_id not in self.registry[junction_id]:
            self.registry[junction_id][lane_id] = {}
        
        self.registry[junction_id][lane_id]["exit_status"] = status
        
        # Priority Multiplier: If road ahead is 'flowing', we can boost green time
        # If 'clear', it keeps the standard multiplier
        self.registry[junction_id][lane_id]["flow_multiplier"] = 1.2 if status == "flowing" else 1.0

    def _propagate_green_wave(self, source_id, direction):
        """
        Alerts the next intersection to clear traffic for an arriving ambulance.
        """
        neighbor_id = self.adjacency_map.get(source_id, {}).get(direction)
        if neighbor_id:
            logger.info(f"🚨 AMBULANCE PATH: Notifying {neighbor_id} to prepare for incoming {direction} traffic.")

    def get_global_status(self):
        """Returns data for the primary admin dashboard."""
        return self.registry

# Global instance for main.py to import
coordinator = NetworkCoordinator()