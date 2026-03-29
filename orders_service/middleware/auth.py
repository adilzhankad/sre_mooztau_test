from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, UserRole
from services.auth import decode_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Не авторизован")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Невалидный токен")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    return user


def require_roles(*roles: str):
    """Dependency factory that checks user has one of the specified roles."""
    async def checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return user
    return checker


# Convenience shortcuts
require_super_admin = require_roles(UserRole.SUPER_ADMIN)
require_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.DEALER_ADMIN)
require_any_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.DEALER_ADMIN, UserRole.FACTORY_ADMIN)
require_factory = require_roles(UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN, UserRole.FACTORY_WORKER)
