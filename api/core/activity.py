from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from api.models.activity import UserActivity


def log_activity(
    db: Session,
    *,
    user_id: str,
    activity_type: str,
    mode: str,
    dataset_id: Optional[str],
    input_metadata: Optional[Dict[str, Any]],
    result_snapshot: Optional[Dict[str, Any]],
    download_url: Optional[str],
) -> None:
    try:
        activity = UserActivity(
            user_id=user_id,
            activity_type=activity_type,
            mode=mode,
            dataset_id=dataset_id,
            input_metadata=input_metadata,
            result_snapshot=result_snapshot,
            download_url=download_url,
        )
        db.add(activity)
        db.commit()
    except Exception:
        db.rollback()
