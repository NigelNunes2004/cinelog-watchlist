from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from auth_utils import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token_payload,
    decode_token,
    hash_password,
    verify_password,
)
from database import get_db
from deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_tokens(user: models.User, db: Session) -> schemas.TokenResponse:
    access_token = create_access_token(user.id, user.email)
    refresh_token, jti, expires_at = create_refresh_token_payload(user.id)

    db.add(
        models.RefreshToken(
            jti=jti,
            user_id=user.id,
            expires_at=expires_at,
        )
    )
    db.commit()

    return schemas.TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/signup", response_model=schemas.TokenResponse, status_code=201)
def signup(body: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        display_name=body.display_name or body.email.split("@")[0],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user, db)


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return _issue_tokens(user, db)


@router.post("/refresh", response_model=schemas.TokenResponse)
def refresh(body: schemas.RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    jti = payload.get("jti")
    user_id = payload.get("sub")
    if not jti or not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    stored = (
        db.query(models.RefreshToken)
        .filter(
            models.RefreshToken.jti == jti,
            models.RefreshToken.user_id == int(user_id),
            models.RefreshToken.revoked == False,
        )
        .first()
    )
    if not stored:
        raise HTTPException(status_code=401, detail="Refresh token revoked or not found")

    if stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        stored.revoked = True
        db.commit()
        raise HTTPException(status_code=401, detail="Refresh token expired")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate refresh token
    stored.revoked = True
    return _issue_tokens(user, db)


@router.post("/logout")
def logout(body: schemas.RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        jti = payload.get("jti")
        if jti:
            stored = db.query(models.RefreshToken).filter(models.RefreshToken.jti == jti).first()
            if stored:
                stored.revoked = True
                db.commit()
    except HTTPException:
        pass
    return {"message": "Logged out"}


@router.get("/me", response_model=schemas.UserResponse)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
