import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import time

print('Testing...')
try:
  start = time.time()
  llm = ChatGoogleGenerativeAI(model='gemini-3.5-flash-lite', temperature=0.7)
  res = llm.invoke([HumanMessage(content='hi')])
  print('Success', time.time() - start, res.content)
except Exception as e:
  print('Error', e)
