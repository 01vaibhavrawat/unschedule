import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.unschedule

tasks_collection = database.get_collection("tasks")
habits_collection = database.get_collection("mini_habits")
habit_logs_collection = database.get_collection("habit_logs")
goals_collection = database.get_collection("goals")
