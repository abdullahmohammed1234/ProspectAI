from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router as v1_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.database.manager import InMemoryDatabase
from app.database.mongo import MongoDatabase
from app.models.common import HealthResponse
from app.services.ai_service import GeminiAIService
from app.utils.ids import generate_id


logger = logging.getLogger("prospectai.api")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.settings = settings
        # choose MongoDB if configured, otherwise fall back to in-memory
        if settings.mongodb_uri:
            mongo = MongoDatabase(settings)
            # ensure indexes on startup
            await mongo.ensure_indexes()
            app.state.database = mongo
        else:
            app.state.database = InMemoryDatabase()

        app.state.ai_service = GeminiAIService(settings)
        logger.info(
            "application_startup",
            extra={"environment": settings.environment, "app_name": settings.app_name, "version": settings.app_version},
        )
        yield
        logger.info("application_shutdown", extra={"environment": settings.environment})

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    register_exception_handlers(app)
    app.include_router(v1_router, prefix=settings.api_v1_prefix)

    @app.middleware("http")
    async def request_logging_middleware(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or generate_id("req")
        request.state.request_id = request_id
        start_time = perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "request_failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": str(request.url.path),
                },
            )
            raise

        duration_ms = round((perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "http_request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": str(request.url.path),
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client": request.client.host if request.client else None,
            },
        )
        return response

    @app.get("/", response_model=HealthResponse, include_in_schema=False)
    async def root() -> HealthResponse:
        return HealthResponse(status="ok", version=settings.app_version, environment=settings.environment)

    @app.get("/health", response_model=HealthResponse, include_in_schema=False)
    async def root_health() -> HealthResponse:
        return HealthResponse(status="ok", version=settings.app_version, environment=settings.environment)

    return app


app = create_app()
