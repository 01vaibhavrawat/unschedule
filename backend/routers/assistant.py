import os
import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
from database import get_db
from models import AssistantMessage, User
from routers.auth import get_current_user
from redis_client import get_recent_messages, push_message

from langchain_core.messages import HumanMessage, AIMessage
from assistant.graph import assistant_graph

router = APIRouter()

@router.get("/history", response_model=List[AssistantMessage])
async def get_chat_history(user: User = Depends(get_current_user)):
    # Read from Redis (with Mongo fallback)
    messages_data = await get_recent_messages(str(user.id), 100)
    # Filter or convert to AssistantMessage models
    # Note: get_recent_messages limits to what's in cache, for full history we could hit mongo
    # For now, let's keep it simple and just hit mongo for full history if requested
    db = get_db()
    cursor = db.assistant_messages.find({"user_id": str(user.id)}).sort("created_at", 1)
    messages = await cursor.to_list(length=100)
    return messages

@router.post("/chat/stream")
async def chat_with_assistant_stream(
    message: str = Body(..., embed=True),
    user: User = Depends(get_current_user)
):
    now_str = datetime.utcnow().isoformat()
    
    user_msg_data = {
        "user_id": str(user.id),
        "role": "user",
        "content": message,
        "created_at": now_str
    }
    
    # Fetch recent history from Redis (BEFORE pushing new message to avoid cache miss overwrite or race condition)
    recent_messages_data = await get_recent_messages(str(user.id), 19)
    
    # Save user message to Redis + async Mongo sync
    user_msg_data = await push_message(str(user.id), user_msg_data)
    
    # Append the new message to our local list
    recent_messages_data.append(user_msg_data)
    
    lc_messages = []
    for m in recent_messages_data:
        if m["role"] == "user":
            lc_messages.append(HumanMessage(content=m["content"]))
        else:
            lc_messages.append(AIMessage(content=m["content"]))
            
    async def event_generator():
        try:
            action_data = None
            final_content = ""
            
            # Using langgraph streaming
            async for event in assistant_graph.astream_events(
                {"messages": lc_messages, "user_id": str(user.id)},
                config={"configurable": {"user_id": str(user.id)}},
                version="v2"
            ):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if chunk.content and isinstance(chunk.content, str):
                        final_content += chunk.content
                        yield f"data: {json.dumps({'type': 'token', 'content': chunk.content})}\n\n"
                        
                elif kind == "on_tool_start":
                    tool_name = event["name"]
                    tool_args = event["data"].get("input", {})
                    action_data = {"action": tool_name, "data": tool_args}
                    yield f"data: {json.dumps({'type': 'tool_start', 'action': tool_name, 'data': tool_args})}\n\n"
            
            # Save assistant message to Redis + async Mongo sync
            asst_msg_data = {
                "user_id": str(user.id),
                "role": "assistant",
                "content": final_content,
                "action_data": action_data,
                "created_at": datetime.utcnow().isoformat()
            }
            asst_msg_data = await push_message(str(user.id), asst_msg_data)
            
            # Yield final done event
            yield f"data: {json.dumps({'type': 'done', 'message': asst_msg_data})}\n\n"
            
        except Exception as e:
            print(f"Streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': 'Assistant failed to respond.'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/chat", response_model=AssistantMessage)
async def chat_with_assistant(
    message: str = Body(..., embed=True),
    user: User = Depends(get_current_user)
):
    # Backward compatibility endpoint using new Redis logic
    now_str = datetime.utcnow().isoformat()
    
    user_msg_data = {
        "user_id": str(user.id),
        "role": "user",
        "content": message,
        "created_at": now_str
    }
    
    # Fetch recent history from Redis (BEFORE pushing new message)
    recent_messages_data = await get_recent_messages(str(user.id), 19)
    
    # Save user message to Redis + async Mongo sync
    user_msg_data = await push_message(str(user.id), user_msg_data)
    
    # Append the new message to our local list
    recent_messages_data.append(user_msg_data)
    
    lc_messages = []
    for m in recent_messages_data:
        if m["role"] == "user":
            lc_messages.append(HumanMessage(content=m["content"]))
        else:
            lc_messages.append(AIMessage(content=m["content"]))
            
    try:
        result = await assistant_graph.ainvoke(
            {"messages": lc_messages, "user_id": str(user.id)},
            config={"configurable": {"user_id": str(user.id)}}
        )
        
        final_messages = result.get("messages", [])
        if not final_messages:
            raise ValueError("No messages returned")
            
        final_msg = final_messages[-1]
        
        action_data = None
        new_msgs = final_messages[len(lc_messages):]
        for msg in new_msgs:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                tc = msg.tool_calls[0]
                action_data = {"action": tc["name"], "data": tc["args"]}
                break

        content_str = ""
        if isinstance(final_msg.content, list):
            for part in final_msg.content:
                if isinstance(part, dict) and part.get("type") == "text":
                    content_str += part.get("text", "")
                elif isinstance(part, str):
                    content_str += part
        else:
            content_str = str(final_msg.content)

        asst_msg_data = {
            "user_id": str(user.id),
            "role": "assistant",
            "content": content_str,
            "action_data": action_data,
            "created_at": datetime.utcnow().isoformat()
        }
        
        asst_msg_data = await push_message(str(user.id), asst_msg_data)
        
        return AssistantMessage(**asst_msg_data)
        
    except Exception as e:
        print(f"Assistant graph execution failed: {e}")
        raise HTTPException(status_code=500, detail="Assistant failed to respond")
