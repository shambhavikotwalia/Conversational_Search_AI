from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.website import Website
from app.rag.embedding import EmbeddingService
from app.rag.retrieval import RetrievalService
from app.rag.generation import RAGGenerationService
from pydantic import BaseModel
from typing import Dict, Optional, List
import time

router = APIRouter(prefix="/v1/search", tags=["Search"])

class SearchRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    filters: Optional[Dict] = {}
    limit: Optional[int] = 5

class SearchResponse(BaseModel):
    request_id: str
    query: str
    answer: str
    products: List[Dict]
    citations: List[Dict]
    confidence: float
    latency_ms: int
    status: str

# In a real setup, instantiate services properly (e.g., singleton)
embedding_service = EmbeddingService()
retrieval_service = RetrievalService(embedding_service)
generation_service = RAGGenerationService()

@router.post("/", response_model=SearchResponse)
def search(
    request: SearchRequest, 
    x_site_key: str = Header(None), 
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    if not x_site_key:
        raise HTTPException(status_code=401, detail="X-Site-Key header missing")
        
    website = db.query(Website).filter(Website.public_site_key == x_site_key).first()
    if not website:
        raise HTTPException(status_code=401, detail="Invalid site key")
        
    # Retrieve Candidates
    candidates = retrieval_service.retrieve(
        db=db,
        query=request.query,
        organization_id=website.organization_id,
        limit=20
    )
    
    # Reranking / Evidence Selection (Basic version: just take top 5)
    evidence = candidates[:5]
    
    # Generate Answer
    rag_result = generation_service.generate(
        query=request.query,
        evidence=evidence
    )
    
    latency_ms = int((time.time() - start_time) * 1000)
    
    return SearchResponse(
        request_id="req_demo",
        query=request.query,
        answer=rag_result.get("answer", ""),
        products=rag_result.get("products", []),
        citations=rag_result.get("citations", []),
        confidence=rag_result.get("confidence", 0.0),
        latency_ms=latency_ms,
        status="success" if not rag_result.get("insufficient_evidence") else "insufficient_evidence"
    )
