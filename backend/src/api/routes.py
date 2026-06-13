import asyncio
from fastapi import APIRouter, BackgroundTasks
from src.schemas.schemas import PredictRequest
from src.utils import state
from src.utils.video_tasks import process_video_streams

# Create our router object
router = APIRouter()

@router.post("/predict")
async def predict_traffic(request: PredictRequest, background_tasks: BackgroundTasks):
    """Triggers the video processing loop and returns initial lane states."""
    state.processing_active = False # Stop any existing loop
    await asyncio.sleep(1)            # Brief pause to allow release
    
    state.processing_active = True  # Enable processing flag
    background_tasks.add_task(process_video_streams, request.urls, request.intersection_id, request.user_id)
    
    signal_timing = []
    for lane in ["north", "east", "south", "west"]:
        lane_data = state.coordinator.registry.get(request.intersection_id, {}).get(lane, {})
        signal_timing.append({
            "lane": lane.capitalize(),
            "green_time": state.manager.ai_timings.get(lane, 30),
            "density": lane_data.get("density", 0),
            "priority": round(lane_data.get("priority", 0), 2) if "priority" in lane_data else 0,
            "accident": lane_data.get("accident_alert", False)
        })
    return {"signal_timing": signal_timing}

@router.get("/api/state")
async def get_state():
    """Polled by frontend every 1 second for the active timer."""
    return {
        "active_lane": state.manager.lanes[state.manager.current_idx],
        "timer": state.manager.timer
    }

@router.get("/api/dashboard")
async def get_dashboard(intersection_id: str):
    """Returns the full registry including accident alerts and PCE stats."""
    junction_data = state.coordinator.registry.get(intersection_id, {})
    signal_timing = []
    for lane in ["north", "east", "south", "west"]:
        data = junction_data.get(lane, {})
        signal_timing.append({
            "lane": lane.capitalize(),
            "green_time": state.manager.ai_timings.get(lane, 30),
            "density": data.get("stats", {}).get("cars", 0) * 5, 
            "priority": data.get("recommended_time", 30),
            "is_emergency": data.get("is_emergency", False),
            "accident": data.get("accident_alert", False)
        })
    return {"signal_timing": signal_timing, "active_lane": state.manager.lanes[state.manager.current_idx]}

@router.post("/stop")
async def stop_processing():
    """Acts as a kill switch to stop the video processing loop."""
    state.processing_active = False
    return {"message": "Processing stopped"}