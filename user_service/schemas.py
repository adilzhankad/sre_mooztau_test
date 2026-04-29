from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models import OrgType, UserRole


class OrganizationOut(BaseModel):
    id: int
    name: str
    org_type: str
    is_active: bool
    contact_phone: str
    contact_email: str
    region: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str
    role: str
    is_active: bool
    organization_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
