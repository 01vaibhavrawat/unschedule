import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import time
import asyncio

async def main():
  print('Testing ainvoke...')
  try:
    start = time.time()
    llm = ChatGoogleGenerativeAI(model='gemini-3.5-flash-lite', temperature=0.7)
    res = await llm.ainvoke([HumanMessage(content='hi')])
    print('Success ainvoke', time.time() - start, res.content)
  except Exception as e:
    print('Error', e)

if __name__ == '__main__':
  asyncio.run(main())
