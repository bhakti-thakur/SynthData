from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: str
    activity_type: str
    mode: str
    created_at: datetime
    dataset_id: Optional[str]
    input_metadata: Optional[Dict[str, Any]]
    result_snapshot: Optional[Dict[str, Any]]
    download_url: Optional[str]

    class Config:
        orm_mode = True
