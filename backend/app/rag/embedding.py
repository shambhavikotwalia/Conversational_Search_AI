from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.models.review import Review, ReviewEmbedding
import math

class EmbeddingService:
    def __init__(self):
        # This will load the model into memory. In production, this should be a singleton or separate service.
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def generate_and_store_embeddings(self, db: Session, batch_size: int = 100):
        # Find reviews without embeddings
        reviews_without_embeddings = db.query(Review).outerjoin(ReviewEmbedding).filter(
            ReviewEmbedding.id == None,
            Review.review_text != None
        ).all()
        
        if not reviews_without_embeddings:
            return {"status": "success", "processed": 0}
            
        texts = [r.review_text for r in reviews_without_embeddings]
        
        # Generate embeddings in batches
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            embeddings = self.model.encode(batch_texts)
            all_embeddings.extend(embeddings)
            
        # Store to DB
        for i, review in enumerate(reviews_without_embeddings):
            # The vector is a numpy array, pgvector accepts a list of floats
            vector_list = all_embeddings[i].tolist()
            
            review_emb = ReviewEmbedding(
                review_id=review.id,
                vector=vector_list
            )
            db.add(review_emb)
            
        db.commit()
        return {"status": "success", "processed": len(reviews_without_embeddings)}
