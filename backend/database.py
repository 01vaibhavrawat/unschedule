import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://smartwire:smartwire@etd-shard-00-00.nvgep.mongodb.net:27017,etd-shard-00-01.nvgep.mongodb.net:27017,etd-shard-00-02.nvgep.mongodb.net:27017/?replicaSet=atlas-rciogd-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ETD")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.unschedule

tasks_collection = database.get_collection("tasks")
habits_collection = database.get_collection("mini_habits")
habit_logs_collection = database.get_collection("habit_logs")
goals_collection = database.get_collection("goals")
