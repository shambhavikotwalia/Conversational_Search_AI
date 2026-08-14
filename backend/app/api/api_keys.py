from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.api_key import ApiKey
from app.models.user import User
from app.core.database import get_db
from app.api.deps import get_current_active_user, require_organization_access
import uuid
import secrets
import hashlib
from pydantic import BaseModel

router = APIRouter(prefix="/v1/api-keys", tags=["API Keys"])

class ApiKeyCreate(BaseModel):
    name: str
    organization_id: uuid.UUID
    website_id: uuid.UUID = None

@router.post("/")
def create_api_key(
    key_data: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    require_organization_access(db, current_user, key_data.organization_id)
    
    # Generate secret
    secret = secrets.token_urlsafe(32)
    key_prefix = secret[:8]
    key_hash = hashlib.sha256(secret.encode()).hexdigest()
    
    db_key = ApiKey(
        organization_id=key_data.organization_id,
        website_id=key_data.website_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=key_data.name
    )
    db.add(db_key)
    db.commit()
    
    return {
        "id": db_key.id,
        "name": db_key.name,
        "secret_key": secret, # ONLY RETURNED ONCE
        "key_prefix": key_prefix
    }
