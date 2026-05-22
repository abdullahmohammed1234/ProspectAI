from functools import lru_cache

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="ProspectAI API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    environment: str = Field(default="development", alias="APP_ENVIRONMENT")
    debug: bool = Field(default=False, alias="APP_DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        alias="CORS_ORIGINS",
    )
    cors_allow_credentials: bool = Field(default=True, alias="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: list[str] = Field(default_factory=lambda: ["*"], alias="CORS_ALLOW_METHODS")
    cors_allow_headers: list[str] = Field(default_factory=lambda: ["*"], alias="CORS_ALLOW_HEADERS")
    gemini_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GEMINI_API_KEY", "GOOGLE_API_KEY"),
    )
    gemini_model: str = Field(default="gemini-2.5-flash-lite", alias="GEMINI_MODEL")
    gemini_base_url: str = Field(
        default="https://generativelanguage.googleapis.com/v1beta",
        alias="GEMINI_BASE_URL",
    )
    gemini_request_timeout_seconds: float = Field(default=30.0, alias="GEMINI_REQUEST_TIMEOUT_SECONDS")
    gemini_max_retries: int = Field(default=3, alias="GEMINI_MAX_RETRIES")
    gemini_temperature: float = Field(default=0.2, alias="GEMINI_TEMPERATURE")
    gemini_max_output_tokens: int = Field(default=1024, alias="GEMINI_MAX_OUTPUT_TOKENS")
    mongodb_uri: str | None = Field(default=None, alias="MONGODB_URI")
    mongodb_name: str = Field(default="prospectai", alias="MONGODB_NAME")
    mongodb_max_pool_size: int = Field(default=100, alias="MONGODB_MAX_POOL_SIZE")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", "cors_allow_methods", "cors_allow_headers", mode="before")
    @classmethod
    def _split_comma_separated_values(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
