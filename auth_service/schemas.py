from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    phone: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    organization_id: Optional[int] = None
    full_name: str


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Users ─────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    organization_id: Optional[int] = None
    role: str
    full_name: str
    phone: str
    email: Optional[str] = None
    is_active: bool
    created_at: datetime
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    organization_id: Optional[int] = None
    role: str
    full_name: str
    phone: str
    email: Optional[str] = None
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    organization_id: Optional[int] = None


# ── Organizations ─────────────────────────────────────────────────────────────

class OrgOut(BaseModel):
    id: int
    name: str
    org_type: str
    is_active: bool
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None
    region: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrgCreate(BaseModel):
    name: str
    org_type: str
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None
    region: Optional[str] = None


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    org_type: Optional[str] = None
    is_active: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None
    region: Optional[str] = None


# ── Me ────────────────────────────────────────────────────────────────────────

class MeResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    role: str
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    is_active: bool
