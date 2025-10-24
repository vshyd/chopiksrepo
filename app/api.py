import time 
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.llm import run
from app.db import MongoDB
from app.logger import setup_logger


app = FastAPI()
logger = setup_logger('api')

mongo: MongoDB = None

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host
    method = request.method
    path = request.url.path

    logger.info(f"→ {client_ip} {method} {path}")
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"⚠️  error on handling {method} {path}: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

    process_time = (time.time() - start_time) * 1000
    logger.info(f"← {method} {path} [{response.status_code}] {process_time:.1f} ms")
    return response


@app.on_event('startup')
async def initialize():
    global mongo 
    mongo = await MongoDB.create()


@app.get('/llm')
def read_llm():
    logger.info('call to llm')
    run()
    return ""


@app.get("/all")
async def get_articles():
    return await mongo.get_data()


@app.get("/articles/filter")
async def filter_articles(
    lang: str | None = Query(None),
    source: str | None = Query(None),
    days: int | None = Query(None),
    text_contains: str | None = Query(None),
    limit: int = 50
):
    results = await mongo.get_filtered_data(
        lang=lang,
        source=source,
        days=days,
        text_contains=text_contains,
        limit=limit
    )
    return {"count": len(results), "results": results}