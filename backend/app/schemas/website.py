from pydantic import BaseModel
import uuid
from datetime import datetime

class WebsiteCreate(BaseModel):
    name: str
    domain: str
    organization_id: uuid.UUID

class WebsiteResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    domain: str
    public_site_key: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
