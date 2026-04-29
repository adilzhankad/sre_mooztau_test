from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Organization, User, UserRole
from schemas import OrganizationOut, UserOut, UserProfile

router = APIRouter(tags=["users"])


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    organization_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if organization_id:
        q = q.filter(User.organization_id == organization_id)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    return q.order_by(User.id).offset(offset).limit(limit).all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user_profile(user_id: int, data: UserProfile, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


# ── Organizations ─────────────────────────────────────────────────────────────

@router.get("/organizations", response_model=List[OrganizationOut])
def list_organizations(
    org_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Organization)
    if org_type:
        q = q.filter(Organization.org_type == org_type)
    return q.order_by(Organization.id).all()


@router.get("/organizations/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
