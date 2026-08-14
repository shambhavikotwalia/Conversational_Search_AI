from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.website import WebsiteCreate, WebsiteResponse
from app.models.website import Website
from app.models.user import User
from app.core.database import get_db
from app.api.deps import get_current_active_user, require_organization_access
import uuid
from typing import List

router = APIRouter(prefix="/v1/websites", tags=["Websites"])

@router.post("/", response_model=WebsiteResponse)
def create_website(
    website_data: WebsiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user has access to this organization
    require_organization_access(db, current_user, website_data.organization_id)
    
    db_website = Website(
        organization_id=website_data.organization_id,
        name=website_data.name,
        domain=website_data.domain
    )
    db.add(db_website)
    db.commit()
    db.refresh(db_website)
    
    return db_website

@router.get("/org/{organization_id}", response_model=List[WebsiteResponse])
def list_websites(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    require_organization_access(db, current_user, organization_id)
    websites = db.query(Website).filter(Website.organization_id == organization_id).all()
    return websites
