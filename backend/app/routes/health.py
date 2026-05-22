from fastapi import APIRouter, Request

from app.models.common import HealthResponse


router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    settings = request.app.state.settings
    return HealthResponse(status="ok", version=settings.app_version, environment=settings.environment)
