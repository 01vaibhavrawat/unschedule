import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import tasks, habits, habit_logs, goals, auth, notifications, notes, journals, assistant, boards

from starlette.middleware.base import BaseHTTPMiddleware

from contextlib import asynccontextmanager
from database import init_db_indexes

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_indexes()
    yield

app = FastAPI(title="Unschedule MVP API", lifespan=lifespan)

class ProxyRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        location = response.headers.get("location")
        if location and ("backend:8000" in location or "127.0.0.1:8000" in location or "localhost:8000" in location):
            for target in ["http://backend:8000", "http://127.0.0.1:8000", "http://localhost:8000"]:
                location = location.replace(target, "/api/backend")
            response.headers["location"] = location
        return response

app.add_middleware(ProxyRedirectMiddleware)

# Read CORS_ORIGINS from environment, default to localhost for development
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://mvp1.d1304gy8kwnblp.amplifyapp.com")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # explicit origin required for cookie auth
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(habits.router, prefix="/habits", tags=["Mini Habits"])
app.include_router(habit_logs.router, prefix="/habit-log", tags=["Habit Logs"])
app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(journals.router, prefix="/journals", tags=["Journals"])
app.include_router(assistant.router, prefix="/assistant", tags=["Assistant"])
app.include_router(boards.router, prefix="/boards", tags=["Boards"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Unschedule MVP API"}
