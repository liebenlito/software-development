from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from db.session import SessionLocal
from models.user import User
from schemas.user import Token, UserOut, LoginIn
from core.security import verify_password, create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = next(get_db())):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User inactive")
    
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"access_token": token}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(lambda: None)):
    return current_user