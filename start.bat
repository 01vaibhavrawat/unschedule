@echo off
echo Starting Unschedule App...

start cmd /k "cd backend && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"
start cmd /k "cd frontend && npm run dev"

echo Both processes started!
