from fastapi import APIRouter, Depends
from app.core.security import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/ping")
async def admin_ping(admin: User = Depends(get_admin_user)):
    return {"status": "ok", "admin": admin.name, "role": admin.role}
