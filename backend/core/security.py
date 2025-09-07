from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext

from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], depracted="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str, role: str, expire_minutes: int | None = None) -> str:
    if expire_minutes is None:
        expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    to_encode = {"sub": subject, "role": role, "exp": expire}

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None