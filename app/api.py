from fastapi import FastAPI
from app.db import get_data

app = FastAPI()

@app.get("/data")
async def read_data():
    return await get_data()
