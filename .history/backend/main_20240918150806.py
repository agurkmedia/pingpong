from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/feeder-status")
async def feeder_status():
    return {"status": "ready", "balls_remaining": 50}

@app.post("/api/feed-ball")
async def feed_ball():
    # Simulate ball feeding
    return {"success": True, "message": "Ball fed successfully"}