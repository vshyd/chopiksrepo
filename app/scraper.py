import aiohttp
import asyncio
from app.db import save_data

URLS = ["https://example.com", "https://httpbin.org/get"]

async def fetch(session, url):
    async with session.get(url) as resp:
        return {"url": url, "status": resp.status}

async def run_scraper():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(*(fetch(session, u) for u in URLS))
        await save_data(results)

if __name__ == "__main__":
    asyncio.run(run_scraper())
