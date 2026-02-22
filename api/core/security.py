import os
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from api.db.session import get_db
from api.models.user import User


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _get_secret_key() -> str:
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError("SECRET_KEY environment variable is not set")
    return secret_key


def hash_password(password: str) -> str:
    # DEBUG: Check actual password value and length
    print(f"[DEBUG] hash_password called with type: {type(password).__name__}")
    print(f"[DEBUG] password value: {repr(password)}")
    print(f"[DEBUG] password length: {len(password)} chars, {len(password.encode('utf-8'))} bytes")
    
    try:
        hashed = _pwd_context.hash(password)
        print(f"[DEBUG] Password hashed successfully")
        return hashed
    except Exception as e:
        print(f"[DEBUG] Error during hashing: {type(e).__name__}: {e}")
        raise


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {
        "sub": subject,
        "exp": expire,
        "iat": now
    }
    return jwt.encode(to_encode, _get_secret_key(), algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Generate a JWT refresh token.
    
    Format: JWT with claims {sub, type, exp, iat}
    Signed with SECRET_KEY using HS256.
    """
    now = datetime.utcnow()
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
        "iat": now
    }
    return jwt.encode(payload, _get_secret_key(), algorithm=ALGORITHM)


def hash_refresh_token(refresh_token: str) -> str:
    """Hash the full refresh token JWT using bcrypt."""
    return _pwd_context.hash(refresh_token)


def verify_refresh_token(plain_token: str, hashed_token: str) -> bool:
    """Verify a refresh token JWT against its stored hash."""
    return _pwd_context.verify(plain_token, hashed_token)


def get_current_user(
    token: str = Depends(_oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
