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
        
        # 2. Extract unique products
        # Kaggle Dataset mapping:
        # Clothing ID -> external_product_id
        # Division Name -> metadata.division
        # Department Name -> metadata.department
        # Class Name -> metadata.class
        
        unique_products = df.drop_duplicates(subset=['Clothing ID'])
        product_map = {} # external_id to internal db id
        
        for _, row in unique_products.iterrows():
            ext_id = str(row['Clothing ID'])
            
            # Check if exists
            product = db.query(Product).filter(
                Product.organization_id == organization_id,
                Product.external_product_id == ext_id
            ).first()
            
            metadata = {
                "division": row.get('Division Name', None) if not pd.isna(row.get('Division Name')) else None,
                "department": row.get('Department Name', None) if not pd.isna(row.get('Department Name')) else None,
                "class": row.get('Class Name', None) if not pd.isna(row.get('Class Name')) else None
            }
            
            if not product:
                product = Product(
                    organization_id=organization_id,
                    website_id=website_id,
                    external_product_id=ext_id,
                    name=f"Product {ext_id}",
                    metadata_json=metadata
                )
                db.add(product)
                db.flush()
            
            product_map[ext_id] = product.id
            
        # 3. Process reviews
        for _, row in df.iterrows():
            ext_id = str(row['Clothing ID'])
            review_text = row.get('Review Text', None)
            
            # Missing Review Handling: if Review Text is missing, it is NOT embedded.
            # but we still save the metadata for stats.
            is_valid_text = isinstance(review_text, str) and review_text.strip() != ""
            
            rating = int(row['Rating']) if not pd.isna(row.get('Rating')) else None
            recommended_val = row.get('Recommended IND', 0)
            recommended = bool(recommended_val) if not pd.isna(recommended_val) else False
            
            age = int(row['Age']) if not pd.isna(row.get('Age')) else None
            title = row.get('Title', None) if not pd.isna(row.get('Title')) else None
            
            review = Review(
                product_id=product_map[ext_id],
                title=title,
                review_text=review_text if is_valid_text else None,
                rating=rating,
                recommended=recommended,
                positive_feedback_count=int(row.get('Positive Feedback Count', 0)) if not pd.isna(row.get('Positive Feedback Count')) else 0,
                reviewer_age=age
            )
            db.add(review)
            db.flush()
            
        db.commit()
        return {"status": "success", "products_processed": len(product_map), "reviews_processed": len(df)}
