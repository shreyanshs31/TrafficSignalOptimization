import asyncio
import time
import numpy as np
import cv2
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from fuzzylogic2 import setup_fuzzy_controller
from optimizer import IntersectionAgent
from direction import DirectionSensor
from coordinator import NetworkCoordinator

app = FastAPI(title="AI Traffic Optimizer - Video Processing Node")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Global System Initialization
fuzzy_sim = setup_fuzzy_controller()
agent = IntersectionAgent(fuzzy_sim)
coordinator = NetworkCoordinator()
exit_sensors = {l: DirectionSensor(l) for l in ["north", "east", "south", "west"]}

class PredictRequest(BaseModel):
    intersection_id: str
    urls: List[str]

class TrafficCycleManager:
    def __init__(self):
        self.lanes = ["north", "east", "south", "west"]
        self.current_idx = 0
        self.timer = 30
        self.target_end_time = time.time() + 30
        self.ai_timings = {l: 30 for l in self.lanes}

    def run_cycle(self):
        now = time.time()
        self.timer = max(0, int(self.target_end_time - now))
        if self.timer <= 0:
            self.current_idx = (self.current_idx + 1) % len(self.lanes)
            active_lane = self.lanes[self.current_idx]
            new_duration = self.ai_timings.get(active_lane, 30)
            self.target_end_time = time.time() + new_duration
            self.timer = new_duration

manager = TrafficCycleManager()

# 2. Background Processing Logic
processing_active = False

async def process_video_streams(urls: List[str]):
    """
    Background task that reads frames from URLs every 5 seconds 
    and updates the global traffic state.
    """
    global processing_active
    processing_active = True
    
    print(f"\n🚀 Starting background processing. Received {len(urls)} URLs.")
    
    lane_map = ["north", "east", "south", "west"]
    caps = [cv2.VideoCapture(url) for url in urls]
    
    # 1. Validate if OpenCV successfully connected to the video sources
    for i, cap in enumerate(caps):
        if not cap.isOpened():
            print(f"❌ ERROR: OpenCV failed to open URL {i}: {urls[i]}")
            print("   (Note: If this is a YouTube link, OpenCV cannot read it natively. You need direct .mp4 links or yt-dlp)")

    try:
        while processing_active:
            start_time = time.time()
            
            # Process Entry Feeds (Lanes 0-3)
            for i in range(4):
                if i >= len(caps): break
                
                ret, frame = caps[i].read()
                if not ret:
                    # If ret is False, OpenCV couldn't grab a frame. 
                    caps[i].set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue # <--- THIS IS WHERE YOUR CODE WAS SILENTLY SKIPPING
                
                lane_id = lane_map[i]
                
                # 2. Add an inner Try-Except to catch silent YOLO/Fuzzy Logic crashes
                try:
                    junction_data = coordinator.registry.get("junction_01", {}).get(lane_id, {})
                    multiplier = junction_data.get("flow_multiplier", 1.0)
                    
                    # Run AI Analysis
                    results = await asyncio.to_thread(agent.process_lane, lane_id, frame, multiplier)
                    
                    # Update Timings
                    manager.ai_timings[lane_id] = results["recommended_time"]
                    
                    is_active = (lane_id == manager.lanes[manager.current_idx])
                    if results["is_emergency"] and not is_active:
                        manager.current_idx = manager.lanes.index(lane_id)
                        manager.target_end_time = time.time() + 60 
                        is_active = True

                    coordinator.update_lane_state("junction_01", lane_id, {**results, "is_active": is_active})
                    
                    # Log success so you know it's working
                    print(f"✅ AI Processed {lane_id}: Vehicles = {sum(results['stats'].values())}, Priority Time = {results['recommended_time']}s")
                    
                except Exception as lane_error:
                    print(f"🚨 AI PROCESSING ERROR on {lane_id} lane: {lane_error}")

            # Process Exit Feeds (Lanes 4-7)
            for i in range(4, 8):
                if i >= len(caps): break
                ret, frame = caps[i].read()
                if ret:
                    try:
                        lane_id = lane_map[i-4]
                        sensor = exit_sensors.get(lane_id)
                        exit_results = await asyncio.to_thread(sensor.process_frame, frame)
                        coordinator.update_exit_flow("junction_01", lane_id, exit_results["status"])
                    except Exception as exit_error:
                        print(f"🚨 EXIT SENSOR ERROR on {lane_id} lane: {exit_error}")

            elapsed = time.time() - start_time
            await asyncio.sleep(max(0.1, 5.0 - elapsed))
            
    except Exception as fatal_error:
        print(f"💥 CRITICAL BACKGROUND TASK CRASH: {fatal_error}")
    finally:
        for cap in caps:
            cap.release()
        print("🛑 Video streams released. Loop ended.")

# 3. API Endpoints
@app.post("/predict")
async def predict_traffic(request: PredictRequest, background_tasks: BackgroundTasks):
    """
    Triggers the video processing loop and returns the initial lane states.
    """
    global processing_active
    processing_active = False # Stop any existing loop
    await asyncio.sleep(1) # Brief pause to allow release
    
    background_tasks.add_task(process_video_streams, request.urls)
    
    # Construct initial response for the frontend table
    signal_timing = []
    for lane in ["north", "east", "south", "west"]:
        lane_data = coordinator.registry.get("junction_01", {}).get(lane, {})
        signal_timing.append({
            "lane": lane.capitalize(),
            "green_time": manager.ai_timings.get(lane, 30),
            "density": lane_data.get("density", 0),
            "priority": round(lane_data.get("priority", 0), 2) if "priority" in lane_data else 0,
            "accident": lane_data.get("accident_alert", False)
        })
    
    return {"signal_timing": signal_timing}

@app.get("/api/state")
async def get_state():
    """Polled by frontend every 1 second for the active timer."""
    return {
        "active_lane": manager.lanes[manager.current_idx],
        "timer": manager.timer
    }

@app.get("/api/dashboard")
async def get_dashboard():
    """Returns the full registry including accident alerts and PCE stats."""
    # We transform the registry into the 'signal_timing' format for the frontend
    junction_data = coordinator.registry.get("junction_01", {})
    signal_timing = []
    for lane in ["north", "east", "south", "west"]:
        data = junction_data.get(lane, {})
        signal_timing.append({
            "lane": lane.capitalize(),
            "green_time": manager.ai_timings.get(lane, 30),
            "density": data.get("stats", {}).get("cars", 0) * 5, # Example density calc
            "priority": data.get("recommended_time", 30),
            "is_emergency": data.get("is_emergency", False),
            "accident": data.get("accident_alert", False)
        })
    return {"signal_timing": signal_timing, "active_lane": manager.lanes[manager.current_idx]}

async def update_timer_loop():
    while True:
        manager.run_cycle()
        await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_timer_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)