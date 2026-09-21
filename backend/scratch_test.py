import asyncio
import redis.asyncio as redis
async def main():
    r = redis.from_url('redis://localhost')
    print(type(r.pipeline()))
    await r.close()
asyncio.run(main())
