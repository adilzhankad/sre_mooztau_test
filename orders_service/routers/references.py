from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.order import Order
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/references", tags=["References"])


@router.get("/manufacturers", response_model=List[str])
def get_manufacturers(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.query(Order.factory).distinct().filter(Order.factory != "").all()
    return [r[0] for r in rows if r[0]]
