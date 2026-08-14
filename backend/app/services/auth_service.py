from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.organization import Organization, OrganizationMember
from app.schemas.user import UserCreate, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from datetime import datetime

class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserCreate):
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        db_user = User(
            email=user_data.email,
            password_hash=get_password_hash(user_data.password)
        )
        db.add(db_user)
        db.flush() # To get user ID

        # Create organization
        db_org = Organization(
            name=user_data.organization_name
        )
        db.add(db_org)
        db.flush()

        # Link user to organization as OWNER
        db_member = OrganizationMember(
            organization_id=db_org.id,
            user_id=db_user.id,
            role="OWNER"
        )
        db.add(db_member)
        db.commit()
        db.refresh(db_user)

        return db_user, db_org

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin):
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
