import uuid
from sqlalchemy import Column, Uuid, JSON, String, DateTime, ForeignKey

from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    website_id = Column(Uuid(as_uuid=True), ForeignKey("websites.id"), nullable=True)
    key_hash = Column(String, nullable=False)
    key_prefix = Column(String, nullable=False)
    name = Column(String, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    organization = relationship("Organization")
    website = relationship("Website")
