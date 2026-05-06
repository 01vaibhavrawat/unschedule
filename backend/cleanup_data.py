import asyncio
from database import tasks_collection, habits_collection, habit_logs_collection, goals_collection

async def cleanup():
    # Filter for documents where 'user_id' does not exist
    query = {"user_id": {"$exists": False}}
    
    # Delete tasks
    tasks_res = await tasks_collection.delete_many(query)
    print(f"Deleted {tasks_res.deleted_count} orphaned tasks.")
    
    # Delete habits
    habits_res = await habits_collection.delete_many(query)
    print(f"Deleted {habits_res.deleted_count} orphaned habits.")
    
    # Delete habit logs
    habit_logs_res = await habit_logs_collection.delete_many(query)
    print(f"Deleted {habit_logs_res.deleted_count} orphaned habit logs.")
    
    # Delete goals
    goals_res = await goals_collection.delete_many(query)
    print(f"Deleted {goals_res.deleted_count} orphaned goals.")
    
    print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(cleanup())
