from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_active_user, require_organization_access
from app.services.ingestion_service import IngestionService
from app.rag.embedding import EmbeddingService
import uuid
import os
import shutil

router = APIRouter(prefix="/v1/catalog", tags=["Catalog"])

embedding_service = EmbeddingService()

def process_upload_task(file_path: str, organization_id: uuid.UUID, website_id: uuid.UUID):
    db = next(get_db())
    try:
        # Process CSV
        IngestionService.process_csv(db, file_path, organization_id, website_id)
        
        # Generate Embeddings
        embedding_service.generate_and_store_embeddings(db)
    except Exception as e:
        print(f"Error processing dataset: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
        db.close()

@router.post("/import")
def import_catalog(
    organization_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    website_id: uuid.UUID = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    require_organization_access(db, current_user, organization_id)
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    temp_file_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    background_tasks.add_task(
        process_upload_task,
        file_path=temp_file_path,
        organization_id=organization_id,
        website_id=website_id
    )
    
    return {"status": "accepted", "message": "Dataset ingestion started in background"}
