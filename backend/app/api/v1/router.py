from fastapi import APIRouter

from app.routes.ai import router as ai_router
from app.routes.execution import router as execution_router
from app.routes.health import router as health_router
from app.routes.leads import router as leads_router
from app.routes.missions import router as missions_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(ai_router)
api_router.include_router(missions_router)
api_router.include_router(leads_router)
api_router.include_router(execution_router)
