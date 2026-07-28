import asyncio
import traceback
from fastapi import Response
from routers.auth import signup
from models import SignupRequest
from database import users_collection

async def test():
    try:
        req = SignupRequest(name="Test", email="test_traceback@example.com", password="Password123!")
        res = Response()
        await signup(req, res)
        print("Success")
    except Exception as e:
        traceback.print_exc()

asyncio.run(test())
