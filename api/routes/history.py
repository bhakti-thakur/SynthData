from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.core.security import get_current_user
from api.db.session import get_db
from api.models.activity import UserActivity
from api.schemas.history import ActivityResponse


router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=List[ActivityResponse])
def list_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[ActivityResponse]:
    activities = (
        db.query(UserActivity)
        .filter(UserActivity.user_id == current_user.id)
        .order_by(UserActivity.created_at.desc())
        .all()
    )
    return activities


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_history_item(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ActivityResponse:
    activity = db.query(UserActivity).filter(UserActivity.id == activity_id).first()
    if not activity or activity.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity
