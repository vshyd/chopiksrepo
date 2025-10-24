import time 
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.llm import run
from app.db import get_data
from app.logger import setup_logger


app = FastAPI()
logger = setup_logger('api')

# @app.middleware("http")
# async def log_requests(request: Request, call_next):
#     start_time = time.time()
#     client_ip = request.client.host
#     method = request.method
#     path = request.url.path

#     logger.info(f"→ {client_ip} {method} {path}")
#     try:
#         response = await call_next(request)
#     except Exception as e:
#         logger.error(f"⚠️  error on handling {method} {path}: {e}", exc_info=True)
#         return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

#     process_time = (time.time() - start_time) * 1000
#     logger.info(f"← {method} {path} [{response.status_code}] {process_time:.1f} ms")
#     return response


@app.get("/data")
async def read_data():
    logger.info('call to /data')
    data = await get_data()
    return data

@app.get('/llm')
def read_llm():
    logger.info('call to llm')
    run()
    return ""