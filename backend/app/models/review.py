import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
from pgvector.sqlalchemy import Vector
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship

class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    external_review_id = Column(String, nullable=True)
    title = Column(Text, nullable=True)
    review_text = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    recommended = Column(Boolean, nullable=True)
    positive_feedback_count = Column(Integer, default=0)
    reviewer_age = Column(Integer, nullable=True)
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="reviews")
    embedding = relationship("ReviewEmbedding", back_populates="review", uselist=False)

class ReviewEmbedding(Base):
    __tablename__ = "review_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False, unique=True)
    embedding_model = Column(String, default="all-MiniLM-L6-v2")
    embedding_version = Column(String, default="v1")
    vector = Column(Vector(384)) # all-MiniLM-L6-v2 produces 384-dimensional embeddings
    created_at = Column(DateTime, default=datetime.utcnow)

    review = relationship("Review", back_populates="embedding")
