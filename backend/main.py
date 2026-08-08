from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import tasks, habits, habit_logs, goals, auth, notifications, notes, journals, assistant

app = FastAPI(title="Unschedule MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mvp1.d1304gy8kwnblp.amplifyapp.com", "https://mvp1.d1304gy8kwnblp.amplifyapp.com/"],   # explicit origin required for cookie auth
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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Unschedule MVP API"}
