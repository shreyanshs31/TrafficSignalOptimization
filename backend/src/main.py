import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router as traffic_router
from src.utils import state

app = FastAPI(title="AI Traffic Optimizer - Video Processing Node")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach our modular routes to the core app
app.include_router(traffic_router)

async def update_timer_loop():
    """The heartbeat clock keeping track of green light countdowns."""
    while True:
        state.manager.run_cycle()
        await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    # Run our central clock loop right when the server starts up
    asyncio.create_task(update_timer_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)