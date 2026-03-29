from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models import User, Organization, UserRole
from schemas import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserOut,
    UserCreate,
    UserUpdate,
    OrgOut,
    OrgCreate,
    OrgUpdate,
    MeResponse,
)
from security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter()

security_scheme = HTTPBearer(auto_error=False)


# ── Auth middleware ────────────────────────────────────────────────────────────

async def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(creds.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_roles(*roles: str):
    async def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return checker


# ── Helper ────────────────────────────────────────────────────────────────────

def _user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        organization_id=user.organization_id,
        role=user.role,
        full_name=user.full_name,
        phone=user.phone,
        email=user.email,
        is_active=user.is_active,
        created_at=user.created_at,
        organization_name=user.organization.name if user.organization else None,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/api/auth/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == body.phone).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    token_data = {
        "user_id": user.id,
        "role": user.role,
        "organization_id": user.organization_id,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role,
        organization_id=user.organization_id,
        full_name=user.full_name,
    )


@router.post("/api/auth/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    token_data = {
        "user_id": user.id,
        "role": user.role,
        "organization_id": user.organization_id,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role,
        organization_id=user.organization_id,
        full_name=user.full_name,
    )


@router.get("/api/auth/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)):
    return MeResponse(
        id=user.id,
        full_name=user.full_name,
        phone=user.phone,
        email=user.email,
        role=user.role,
        organization_id=user.organization_id,
        organization_name=user.organization.name if user.organization else None,
        is_active=user.is_active,
    )


@router.post("/api/auth/logout")
def logout(user: User = Depends(get_current_user)):
    return {"detail": "Successfully logged out"}


# ══════════════════════════════════════════════════════════════════════════════
#  USER ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/api/users/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role == UserRole.SUPER_ADMIN.value:
        users = db.query(User).order_by(User.id).all()
    elif user.role == UserRole.DEALER_ADMIN.value:
        users = db.query(User).filter(User.organization_id == user.organization_id).order_by(User.id).all()
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return [_user_to_out(u) for u in users]


@router.post("/api/users/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: UserCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Permission check
    if user.role == UserRole.SUPER_ADMIN.value:
        pass  # can create any user
    elif user.role == UserRole.DEALER_ADMIN.value:
        if body.organization_id != user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="DEALER_ADMIN can only create users in own organization",
            )
        allowed_roles = [UserRole.DEALER_ADMIN.value, UserRole.DEALER_MANAGER.value]
        if body.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"DEALER_ADMIN can only create roles: {allowed_roles}",
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # Check phone uniqueness
    existing = db.query(User).filter(User.phone == body.phone).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already registered")

    # Validate organization exists if provided
    if body.organization_id:
        org = db.query(Organization).filter(Organization.id == body.organization_id).first()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    new_user = User(
        organization_id=body.organization_id,
        role=body.role,
        full_name=body.full_name,
        phone=body.phone,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _user_to_out(new_user)


@router.get("/api/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # SUPER_ADMIN can see anyone; others can see own org only
    if user.role != UserRole.SUPER_ADMIN.value:
        if target.organization_id != user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return _user_to_out(target)


@router.put("/api/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Permission check
    if user.role == UserRole.SUPER_ADMIN.value:
        pass
    elif user.role == UserRole.DEALER_ADMIN.value:
        if target.organization_id != user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    update_data = body.model_dump(exclude_unset=True)

    # Check phone uniqueness if changing phone
    if "phone" in update_data:
        existing = db.query(User).filter(User.phone == update_data["phone"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already registered")

    for field, value in update_data.items():
        setattr(target, field, value)

    db.commit()
    db.refresh(target)
    return _user_to_out(target)


@router.patch("/api/users/{user_id}/activate", response_model=UserOut)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Permission check
    if user.role == UserRole.SUPER_ADMIN.value:
        pass
    elif user.role == UserRole.DEALER_ADMIN.value:
        if target.organization_id != user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    # Prevent deactivating yourself
    if target.id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot toggle your own active status")

    target.is_active = not target.is_active
    db.commit()
    db.refresh(target)
    return _user_to_out(target)


# ══════════════════════════════════════════════════════════════════════════════
#  ORGANIZATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/api/organizations/", response_model=List[OrgOut])
def list_organizations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role == UserRole.SUPER_ADMIN.value:
        orgs = db.query(Organization).order_by(Organization.id).all()
    else:
        if user.organization_id:
            orgs = db.query(Organization).filter(Organization.id == user.organization_id).all()
        else:
            orgs = []
    return orgs


@router.post("/api/organizations/", response_model=OrgOut, status_code=status.HTTP_201_CREATED)
def create_organization(
    body: OrgCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value)),
):
    # Check name uniqueness
    existing = db.query(Organization).filter(Organization.name == body.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organization name already exists")

    org = Organization(
        name=body.name,
        org_type=body.org_type,
        contact_phone=body.contact_phone,
        contact_email=body.contact_email,
        address=body.address,
        region=body.region,
        credit_limit=body.credit_limit,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.get("/api/organizations/{org_id}", response_model=OrgOut)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Non-admins can only see their own org
    if user.role != UserRole.SUPER_ADMIN.value:
        if org.id != user.organization_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    return org


@router.put("/api/organizations/{org_id}", response_model=OrgOut)
def update_organization(
    org_id: int,
    body: OrgUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value)),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    update_data = body.model_dump(exclude_unset=True)

    # Check name uniqueness if changing name
    if "name" in update_data:
        existing = db.query(Organization).filter(
            Organization.name == update_data["name"],
            Organization.id != org_id,
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Organization name already exists")

    for field, value in update_data.items():
        setattr(org, field, value)

    db.commit()
    db.refresh(org)
    return org
