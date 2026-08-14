import pandas as pd
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.review import Review, ReviewEmbedding
import uuid
from typing import List, Dict
import math

class IngestionService:
    @staticmethod
    def process_csv(db: Session, file_path: str, organization_id: uuid.UUID, website_id: uuid.UUID = None):
        # 1. Load CSV
        df = pd.read_csv(file_path)
        
        # Support both Kaggle dataset and test dataset schemas
        ext_id_col = 'Clothing ID' if 'Clothing ID' in df.columns else 'external_product_id'
        review_col = 'Review Text' if 'Review Text' in df.columns else 'review_text'
        rating_col = 'Rating' if 'Rating' in df.columns else 'rating'
        recommend_col = 'Recommended IND' if 'Recommended IND' in df.columns else 'recommended'
        age_col = 'Age' if 'Age' in df.columns else 'reviewer_age'
        title_col = 'Title' if 'Title' in df.columns else 'title'
        
        unique_products = df.drop_duplicates(subset=[ext_id_col])
        product_map = {} # external_id to internal db id
        
        for _, row in unique_products.iterrows():
            ext_id = str(row[ext_id_col])
            
            # Check if exists
            product = db.query(Product).filter(
                Product.organization_id == organization_id,
                Product.external_product_id == ext_id
            ).first()
            
            metadata = {
                "division": row.get('Division Name', None) if not pd.isna(row.get('Division Name', None)) else None,
                "department": row.get('Department Name', None) if not pd.isna(row.get('Department Name', None)) else None,
                "class": row.get('Class Name', None) if not pd.isna(row.get('Class Name', None)) else None,
                "brand": row.get('brand', None) if not pd.isna(row.get('brand', None)) else None,
                "category": row.get('category', None) if not pd.isna(row.get('category', None)) else None
            }
            
            if not product:
                product_name = row.get('product_name', f"Product {ext_id}")
                if pd.isna(product_name): product_name = f"Product {ext_id}"
                
                product = Product(
                    organization_id=organization_id,
                    website_id=website_id,
                    external_product_id=ext_id,
                    name=product_name,
                    metadata_json=metadata
                )
                db.add(product)
                db.flush()
            
            product_map[ext_id] = product.id
            
        # 3. Process reviews
        for _, row in df.iterrows():
            ext_id = str(row[ext_id_col])
            review_text = row.get(review_col, None)
            
            # Missing Review Handling: if Review Text is missing, it is NOT embedded.
            is_valid_text = isinstance(review_text, str) and review_text.strip() != ""
            
            rating = int(row[rating_col]) if not pd.isna(row.get(rating_col, None)) else None
            recommended_val = row.get(recommend_col, 0)
            recommended = bool(recommended_val) if not pd.isna(recommended_val) else False
            
            age = int(row[age_col]) if not pd.isna(row.get(age_col, None)) else None
            title = row.get(title_col, None) if not pd.isna(row.get(title_col, None)) else None
            
            review = Review(
                product_id=product_map[ext_id],
                title=title,
                review_text=review_text if is_valid_text else None,
                rating=rating,
                recommended=recommended,
                positive_feedback_count=int(row.get('Positive Feedback Count', 0)) if not pd.isna(row.get('Positive Feedback Count', 0)) else 0,
                reviewer_age=age
            )
            db.add(review)
            db.flush()
            
        db.commit()
        return {"status": "success", "products_processed": len(product_map), "reviews_processed": len(df)}
