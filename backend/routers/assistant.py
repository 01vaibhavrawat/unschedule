import os
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional
from datetime import datetime
from database import get_db
from models import AssistantMessage, Task, MiniHabit, JournalEntry, Note, User
from routers.auth import get_current_user
from google import genai
from google.genai import types

router = APIRouter()

# Initialize Gemini Client
# Assumes GEMINI_API_KEY is in the environment
try:
    client = genai.Client()
except Exception as e:
    client = None
    print(f"Failed to initialize Gemini Client: {e}")

@router.get("/history", response_model=List[AssistantMessage])
async def get_chat_history(user: User = Depends(get_current_user)):
    db = get_db()
    cursor = db.assistant_messages.find({"user_id": str(user.id)}).sort("created_at", 1)
    messages = await cursor.to_list(length=100)
    return messages

@router.post("/chat", response_model=AssistantMessage)
async def chat_with_assistant(
    message: str = Body(..., embed=True),
    user: User = Depends(get_current_user)
):
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    
    # Save user message
    user_msg = AssistantMessage(
        user_id=str(user.id),
        role="user",
        content=message,
        created_at=now_str
    )
    await db.assistant_messages.insert_one(user_msg.model_dump(by_alias=True, exclude={"id"}))
    
    if not client:
        # Fallback if AI is not configured
        fallback_msg = AssistantMessage(
            user_id=str(user.id),
            role="assistant",
            content="I am currently offline as the AI provider is not configured.",
            created_at=datetime.utcnow().isoformat()
        )
        result = await db.assistant_messages.insert_one(fallback_msg.model_dump(by_alias=True, exclude={"id"}))
        fallback_msg.id = result.inserted_id
        return fallback_msg

    # Build history for context
    cursor = db.assistant_messages.find({"user_id": str(user.id)}).sort("created_at", -1).limit(20)
    recent_messages = await cursor.to_list(length=20)
    recent_messages.reverse()
    
    contents = []
    for m in recent_messages[:-1]: # exclude the one we just added
        role = "user" if m["role"] == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=m["content"])]))
        
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))
    
    system_instruction = f"""
    You are Unschedule, a highly capable productivity assistant. 
    You help users manage their calendar, tasks, habits, notes, and journal.
    Current time: {now_str}
    User name: {user.name}
    
    You have tools to perform actions like creating tasks. If you use a tool, explain what you did briefly.
    """
    
    # Define simple tool schemas for MVP
    prompt = f"""
    {system_instruction}
    
    If the user asks you to create a task, event, habit, or note, output a JSON block with the structure:
    ```json
    {{
      "action": "create_task",
      "data": {{ "title": "...", "start_time": "...", "end_time": "..." }}
    }}
    ```
    Along with your natural language response.
    
    Otherwise, just respond normally.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=prompt,
                temperature=0.7,
            )
        )
        response_text = response.text
        
        # Super simple JSON parsing for MVP actions
        action_data = None
        import json
        import re
        
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(1))
                action = parsed.get("action")
                data = parsed.get("data", {})
                
                if action == "create_task":
                    new_task = Task(
                        user_id=str(user.id),
                        title=data.get("title", "New Task"),
                        start_time=data.get("start_time", now_str),
                        end_time=data.get("end_time", now_str),
                        type="task"
                    )
                    await db.tasks.insert_one(new_task.model_dump(by_alias=True, exclude={"id"}))
                    action_data = parsed
                    
                # Strip JSON from response text for UI
                response_text = response_text.replace(json_match.group(0), "").strip()
                
            except Exception as e:
                print("Failed to parse tool action:", e)

        asst_msg = AssistantMessage(
            user_id=str(user.id),
            role="assistant",
            content=response_text,
            action_data=action_data,
            created_at=datetime.utcnow().isoformat()
        )
        
        result = await db.assistant_messages.insert_one(asst_msg.model_dump(by_alias=True, exclude={"id"}))
        asst_msg.id = result.inserted_id
        
        return asst_msg
        
    except Exception as e:
        print(f"Gemini generation failed: {e}")
        raise HTTPException(status_code=500, detail="Assistant failed to respond")
