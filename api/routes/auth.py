import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from api.core.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    hash_refresh_token,
    verify_password,
    verify_refresh_token,
)
from jose import JWTError, jwt
from api.db.session import get_db
from api.models.user import User
from api.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_google_client_id() -> str:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise RuntimeError("GOOGLE_CLIENT_ID environment variable is not set")
    return client_id


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    print(f"[DEBUG REGISTER] Received payload type: {type(payload)}")
    print(f"[DEBUG REGISTER] Email: {payload.email}")
    print(f"[DEBUG REGISTER] Password type: {type(payload.password).__name__}")
    print(f"[DEBUG REGISTER] Password repr: {repr(payload.password)}")
    print(f"[DEBUG REGISTER] Password length: {len(payload.password)} chars")
    
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    print(f"[DEBUG REGISTER] About to hash password...")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_google_user=False,
    )
    print(f"[DEBUG REGISTER] User created, adding to DB...")
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate tokens
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    
    # Store hashed refresh token (only the random part is hashed)
    user.refresh_token_hash = hash_refresh_token(refresh_token)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Generate tokens
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    
    # Store hashed refresh token (overwrites any existing token = single device)
    user.refresh_token_hash = hash_refresh_token(refresh_token)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        token_info = google_id_token.verify_oauth2_token(
            payload.id_token,
            google_requests.Request(),
            _get_google_client_id(),
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

    email = token_info.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token missing email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, hashed_password=None, is_google_user=True)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate tokens
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    
    # Store hashed refresh token (overwrites any existing token = single device)
    user.refresh_token_hash = hash_refresh_token(refresh_token)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Refresh access token using JWT refresh token with token rotation."""
    # Decode and validate JWT refresh token
    try:
        # Get SECRET_KEY
        secret_key = os.getenv("SECRET_KEY")
        if not secret_key:
            raise RuntimeError("SECRET_KEY not configured")
        
        # Decode JWT (automatically validates signature and expiration)
        payload_data = jwt.decode(payload.refresh_token, secret_key, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Validate token type claim
    token_type = payload_data.get("type")
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Extract user_id from sub claim
    user_id_str = payload_data.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Parse and query user (O(1) lookup)
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Verify user has a refresh token stored
    if not user.refresh_token_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Verify full JWT string against stored bcrypt hash
    if not verify_refresh_token(payload.refresh_token, user.refresh_token_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Generate new tokens (token rotation)
    new_access_token = create_access_token(str(user.id))
    new_refresh_token = create_refresh_token(str(user.id))
    
    # Update stored refresh token hash (single-device enforcement)
    user.refresh_token_hash = hash_refresh_token(new_refresh_token)
    db.commit()
    
    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Logout user by invalidating refresh token."""
    current_user.refresh_token_hash = None
    db.commit()
    return {"message": "Successfully logged out"}
