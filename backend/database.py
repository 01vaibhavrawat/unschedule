import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv(
    "MONGO_URI",
    "mongodb://smartwire:smartwire@etd-shard-00-00.nvgep.mongodb.net:27017,etd-shard-00-01.nvgep.mongodb.net:27017,etd-shard-00-02.nvgep.mongodb.net:27017/?replicaSet=atlas-rciogd-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=ETD"
)
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.unschedule

tasks_collection = database.get_collection("tasks")
habits_collection = database.get_collection("mini_habits")
habit_logs_collection = database.get_collection("habit_logs")
goals_collection = database.get_collection("goals")
users_collection = database.get_collection("users")

visibility_collection = database.get_collection("visibility_settings")
follows_collection = database.get_collection("follows")
posts_collection = database.get_collection("posts")
conversations_collection = database.get_collection("conversations")
messages_collection = database.get_collection("messages")

communities_collection = database.get_collection("communities")
community_memberships_collection = database.get_collection("community_memberships")
reactions_collection = database.get_collection("reactions")
comments_collection = database.get_collection("comments")
notifications_collection = database.get_collection("notifications")
