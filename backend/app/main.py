from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Conversational Search AI Platform",
    description="Multi-tenant RAG Search Platform API",
    version="1.0.0"
)

# CORS middleware
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.auth import router as auth_router
from app.api.websites import router as websites_router
from app.api.api_keys import router as api_keys_router
from app.api.search import router as search_router
from app.api.catalog import router as catalog_router
from app.api.analytics import router as analytics_router
from app.core.middleware import CorrelationLogMiddleware

app.add_middleware(CorrelationLogMiddleware)

app.include_router(auth_router)
app.include_router(websites_router)
app.include_router(api_keys_router)
app.include_router(search_router)
app.include_router(catalog_router)
app.include_router(analytics_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Service is healthy"}
