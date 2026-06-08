import time

from src.utils.coordinator import NetworkCoordinator
coordinator = NetworkCoordinator()
from src.utils.fuzzylogic import setup_fuzzy_controller
fuzzy_sim = setup_fuzzy_controller()
from src.utils.optimizer import IntersectionAgent
agent = IntersectionAgent(fuzzy_sim)
from src.utils.exitLaneTask import ExitSensor
exit_sensors = {l: ExitSensor(l) for l in ["north", "east", "south", "west"]}

class TrafficCycleManager:
    def __init__(self):
        self.lanes = ["north", "east", "south", "west"]
        self.current_idx = 0
        self.timer = 30
        self.target_end_time = time.time() + 30
        self.ai_timings = {l: 30 for l in self.lanes}
        self.waiting_times = {l: 0 for l in self.lanes}
        self.last_tick = time.time()

    def run_cycle(self):
        now = time.time()
        #Calculate how much time passed since last tick
        elapsed = now - self.last_tick
        self.last_tick = now
        active_lane = self.lanes[self.current_idx]

        # Update the stopwatches!
        for lane in self.lanes:
            if lane == active_lane:
                self.waiting_times[lane] = 0  # Green light! Wait is over.
            else:
                self.waiting_times[lane] += elapsed # Red light! Keep adding time.
        
        self.timer = max(0, int(self.target_end_time - now))
        if self.timer <= 0:
            self.current_idx = (self.current_idx + 1) % len(self.lanes)
            active_lane = self.lanes[self.current_idx]
            new_duration = self.ai_timings.get(active_lane, 30)
            self.target_end_time = time.time() + new_duration
            self.timer = new_duration
    
    def get_lane_waiting_time(self, lane_id):
        return int(self.waiting_times.get(lane_id, 0))

manager = TrafficCycleManager()
processing_active = False