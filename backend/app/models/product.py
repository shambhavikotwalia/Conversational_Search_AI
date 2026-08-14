import uuid
from sqlalchemy import Column, Uuid, JSON, String, DateTime, ForeignKey, Text, DECIMAL, JSON

from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "products"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(Uuid(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    website_id = Column(Uuid(as_uuid=True), ForeignKey("websites.id"), nullable=True)
    external_product_id = Column(String, index=True)
    name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    subcategory = Column(String, nullable=True)
    price = Column(DECIMAL, nullable=True)
    currency = Column(String, default="USD")
    url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    attributes = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    reviews = relationship("Review", back_populates="product")
