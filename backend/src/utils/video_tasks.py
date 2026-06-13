import asyncio
import time
import cv2
from typing import List
from src.utils import state
from src.database.supabase.supabaseClient import supabase

async def process_video_streams(urls: List[str], intersection_id: str, user_id: str):
    """
    Background task that reads frames from URLs every 5 seconds 
    and updates the global traffic state.
    """
    print(f"\n🚀 Starting background processing. Received {len(urls)} URLs.")
    
    lane_map = ["north", "east", "south", "west"]
    caps = [cv2.VideoCapture(url) for url in urls]
    
    for i, cap in enumerate(caps):
        if not cap.isOpened():
            print(f"❌ ERROR: OpenCV failed to open URL {i}: {urls[i]}")

    try:
        # Read the flag from the shared state module
        while state.processing_active:
            start_time = time.time()
            
            # Process Entry Feeds (Lanes 0-3)
            for i in range(4):
                if i >= len(caps): break
                
                ret, frame = caps[i].read()
                if not ret:
                    caps[i].set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue 
                
                lane_id = lane_map[i]
                
                try:
                    junction_data = state.coordinator.registry.get(intersection_id, {}).get(lane_id, {})
                    multiplier = junction_data.get("flow_multiplier", 1.0)

                    #Ask the manager for the wait time ---
                    current_wait_time = state.manager.get_lane_waiting_time(lane_id)
    
                    # Pass the wait time to the agent ---
                    results = await asyncio.to_thread(state.agent.process_lane, lane_id, frame, current_wait_time, multiplier)
    
                    # Update Timings via shared manager
                    state.manager.ai_timings[lane_id] = results["recommended_time"]
                    
                    is_active = (lane_id == state.manager.lanes[state.manager.current_idx])
                    if results["is_emergency"] and not is_active:
                        state.manager.current_idx = state.manager.lanes.index(lane_id)
                        state.manager.target_end_time = time.time() + 60 
                        is_active = True

                    state.coordinator.update_lane_state(intersection_id, lane_id, {**results, "is_active": is_active})
                    print(f"✅ AI Processed {lane_id}: Vehicles = {sum(results['stats'].values())}, Priority Time = {results['recommended_time']}")

                    try:
                        # Grab the counts from your AI's results dictionary
                        stats = results.get("stats", {})
                        
                        data_package = {
                            "user_id": user_id,
                            "Truck": stats.get("trucks", 0),
                            "Bike": stats.get("bikes", 0),
                            "Car": stats.get("cars", 0),
                            "Bus": stats.get("buses", 0),
                            "EmergencyVehicle": stats.get("emergency_vehicles", 0)
                        }
                        
                        # Use the walkie-talkie!
                        supabase.table('traffic_logs').insert(data_package).execute()
                        print("📡 Successfully beamed live data to Supabase!")
                    except Exception as db_error:
                        print(f"🚨 Failed to push to Supabase: {db_error}")
                    
                except Exception as lane_error:
                    print(f"🚨 AI PROCESSING ERROR on {lane_id} lane: {lane_error}")

            # Process Exit Feeds (Lanes 4-7)
            for i in range(4, 8):
                if i >= len(caps): break
                ret, frame = caps[i].read()
                if ret:
                    try:
                        lane_id = lane_map[i-4]
                        sensor = state.exit_sensors.get(lane_id)
                        exit_results = await asyncio.to_thread(sensor.process_frame, frame)
                        state.coordinator.update_exit_flow(intersection_id, lane_id, exit_results["status"])
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