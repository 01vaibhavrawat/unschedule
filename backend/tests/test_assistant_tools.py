import asyncio
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_core.runnables.config import RunnableConfig
from assistant.tools import (
    create_task, get_tasks, update_task, delete_task,
    create_habit, get_habits, update_habit, delete_habit,
    create_goal, get_goals, update_goal, delete_goal,
    create_note, get_notes, update_note, delete_note,
    create_journal_entry, get_journal_entries, update_journal_entry, delete_journal_entry
)
from database import get_db

async def run_tests():
    print("Starting assistant tools tests...")
    
    # Setup test user ID
    test_user_id = "test_user_for_assistant_tools"
    config = RunnableConfig(configurable={"user_id": test_user_id})
    db = get_db()
    
    # Clean up old test data if any
    await db.tasks.delete_many({"user_id": test_user_id})
    await db.mini_habits.delete_many({"user_id": test_user_id})
    await db.goals.delete_many({"user_id": test_user_id})
    await db.notes.delete_many({"user_id": test_user_id})
    await db.journal_entries.delete_many({"user_id": test_user_id})
    
    # --- TASKS ---
    print("Testing tasks...")
    res = await create_task.ainvoke({"title": "Test Task", "start_time": "2024-01-01T10:00:00Z", "end_time": "2024-01-01T11:00:00Z"}, config=config)
    assert "created successfully" in res
    
    tasks_res = await get_tasks.ainvoke({}, config=config)
    tasks = json.loads(tasks_res)
    assert len(tasks) == 1
    task_id = tasks[0]["_id"]
    
    res = await update_task.ainvoke({"task_id": task_id, "title": "Updated Task"}, config=config)
    assert "updated successfully" in res
    
    res = await delete_task.ainvoke({"task_id": task_id}, config=config)
    assert "deleted successfully" in res
    
    # --- HABITS ---
    print("Testing habits...")
    res = await create_habit.ainvoke({"title": "Test Habit"}, config=config)
    assert "created successfully" in res
    
    habits = json.loads(await get_habits.ainvoke({}, config=config))
    habit_id = habits[0]["_id"]
    
    res = await update_habit.ainvoke({"habit_id": habit_id, "title": "Updated Habit"}, config=config)
    assert "updated successfully" in res
    
    res = await delete_habit.ainvoke({"habit_id": habit_id}, config=config)
    assert "deleted successfully" in res

    # --- GOALS ---
    print("Testing goals...")
    res = await create_goal.ainvoke({"title": "Test Goal"}, config=config)
    assert "created successfully" in res
    
    goals = json.loads(await get_goals.ainvoke({}, config=config))
    goal_id = goals[0]["_id"]
    
    res = await update_goal.ainvoke({"goal_id": goal_id, "title": "Updated Goal"}, config=config)
    assert "updated successfully" in res
    
    res = await delete_goal.ainvoke({"goal_id": goal_id}, config=config)
    assert "deleted successfully" in res

    # --- NOTES ---
    print("Testing notes...")
    res = await create_note.ainvoke({"title": "Test Note", "content": "Content"}, config=config)
    assert "created successfully" in res
    
    notes = json.loads(await get_notes.ainvoke({}, config=config))
    note_id = notes[0]["_id"]
    
    res = await update_note.ainvoke({"note_id": note_id, "title": "Updated Note"}, config=config)
    assert "updated successfully" in res
    
    res = await delete_note.ainvoke({"note_id": note_id}, config=config)
    assert "deleted successfully" in res

    # --- JOURNALS ---
    print("Testing journals...")
    res = await create_journal_entry.ainvoke({"content": "Journal Entry"}, config=config)
    assert "created successfully" in res
    
    journals = json.loads(await get_journal_entries.ainvoke({}, config=config))
    journal_id = journals[0]["_id"]
    
    res = await update_journal_entry.ainvoke({"journal_id": journal_id, "content": "Updated Entry"}, config=config)
    assert "updated successfully" in res
    
    res = await delete_journal_entry.ainvoke({"journal_id": journal_id}, config=config)
    assert "deleted successfully" in res

    print("All basic CRUD operations passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
