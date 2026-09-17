import asyncio
import os
from langchain_core.messages import HumanMessage
from assistant.graph import assistant_graph

async def run():
    try:
        res = await assistant_graph.ainvoke(
            {"messages": [HumanMessage(content="Hello")], "user_id": "6aa7f0bce942d739f0e93ca7"},
            config={"configurable": {"user_id": "6aa7f0bce942d739f0e93ca7"}}
        )
        print("GRAPH SUCCESS:", res["messages"][-1].content)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
