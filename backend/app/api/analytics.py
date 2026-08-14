from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.search_event import SearchEvent
from app.api.deps import get_current_active_user, require_organization_access
import uuid

router = APIRouter(prefix="/v1/analytics", tags=["Analytics"])

@router.get("/overview/{organization_id}")
def get_analytics_overview(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    require_organization_access(db, current_user, organization_id)
    
    total_searches = db.query(func.count(SearchEvent.id)).filter(SearchEvent.organization_id == organization_id).scalar()
    
    avg_latency = db.query(func.avg(SearchEvent.latency_ms)).filter(SearchEvent.organization_id == organization_id).scalar() or 0
    
    avg_confidence = db.query(func.avg(SearchEvent.confidence)).filter(SearchEvent.organization_id == organization_id).scalar() or 0
    
    success_searches = db.query(func.count(SearchEvent.id)).filter(
        SearchEvent.organization_id == organization_id,
        SearchEvent.status == "success"
    ).scalar()
    
    ai_answer_rate = (success_searches / total_searches * 100) if total_searches > 0 else 0
    
    return {
        "total_searches": total_searches,
        "ai_answer_rate": round(ai_answer_rate, 2),
        "avg_latency_ms": round(avg_latency, 2),
        "avg_confidence": round(avg_confidence, 2)
    }
