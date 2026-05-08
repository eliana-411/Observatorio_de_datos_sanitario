import time
from fastapi import Request
from utils.logger import get_logger

logger = get_logger()

async def request_logger(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(
        "%s %s %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )
    return response
