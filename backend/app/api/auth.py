from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.auth_service import AuthService
from app.core.database import get_db

router = APIRouter(prefix="/v1/auth", tags=["Auth"])

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user, org = AuthService.register_user(db, user_data)
    return {
        "user_id": str(user.id),
        "organization_id": str(org.id),
        "status": "success"
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    return AuthService.authenticate_user(db, login_data)

@router.post("/logout")
def logout():
    # In a fully-fledged app, you'd invalidate the refresh token here
    return {"status": "logged out"}
