from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app.models.review import Review, ReviewEmbedding
from app.models.product import Product
from app.rag.embedding import EmbeddingService
import uuid
from typing import List, Dict

class RetrievalService:
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service

    def retrieve(self, db: Session, query: str, organization_id: uuid.UUID, limit: int = 20) -> List[Dict]:
        # 1. Embed query
        query_vector = self.embedding_service.model.encode(query).tolist()
        
        # 2. Vector search via pgvector
        # We find top K reviews based on vector L2 distance
        # Filtered by organization_id
        
        results = db.query(Review, ReviewEmbedding.vector.l2_distance(query_vector).label("distance")).\
            join(ReviewEmbedding, Review.id == ReviewEmbedding.review_id).\
            join(Product, Review.product_id == Product.id).\
            filter(Product.organization_id == organization_id).\
            order_by("distance").\
            limit(limit).all()
            
        candidates = []
        for review, distance in results:
            # Distance is lower the closer they are. Convert to a similarity score (1 - normalized distance)
            # A rough heuristic: score = 1 / (1 + distance)
            semantic_score = 1.0 / (1.0 + float(distance))
            
            candidates.append({
                "review_id": str(review.id),
                "product_id": str(review.product_id),
                "product_name": review.product.name,
                "review_text": review.review_text,
                "rating": review.rating,
                "semantic_score": semantic_score,
                # In a full hybrid search, we would add keyword/metadata scores here
                "hybrid_score": semantic_score 
            })
            
        # 3. Sort by hybrid score (currently just semantic score)
        candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return candidates
