import uuid
from sqlalchemy import Column, Uuid, JSON, String, DateTime, ForeignKey, Integer, Float, Text

from datetime import datetime
from app.core.database import Base

class SearchEvent(Base):
    __tablename__ = "search_events"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(String, index=True)
    organization_id = Column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    website_id = Column(Uuid(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    conversation_id = Column(String, nullable=True)
    query = Column(Text, nullable=True)
    retrieval_count = Column(Integer, default=0)
    confidence = Column(Float, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
