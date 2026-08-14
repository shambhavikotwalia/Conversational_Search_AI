import uuid
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api_logger")

class CorrelationLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        
        start_time = time.time()
        
        logger.info(f"Incoming request: {request.method} {request.url} - Correlation ID: {correlation_id}")
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Correlation-ID"] = correlation_id
        
        logger.info(f"Completed request: {request.method} {request.url} - Status: {response.status_code} - Correlation ID: {correlation_id} - Time: {process_time:.2f}ms")
        
        return response
