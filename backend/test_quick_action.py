import asyncio
from assistant.graph import assistant_graph
from langchain_core.messages import HumanMessage

async def main():
    messages = [HumanMessage(content="I want to build a new habit. Act as a behavioral science expert and guide me through creating an 'atomic habit'. Before creating it, ask me questions to understand my motivation, find a good trigger, and ensure it's obvious, attractive, easy, and satisfying.")]
    print("Sending message...")
    async for event in assistant_graph.astream_events(
        {"messages": messages, "user_id": "test_user"},
        version="v2",
        config={"configurable": {"user_id": "test_user"}}
    ):
        kind = event["event"]
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                print(chunk.content, end="", flush=True)
        elif kind == "on_tool_start":
            print(f"\n[TOOL CALLED: {event['name']}]")
            
if __name__ == "__main__":
    asyncio.run(main())
