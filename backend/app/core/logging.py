from __future__ import annotations

import json
import logging
import logging.config
from datetime import datetime, timezone
from typing import Any


class JsonFormatter(logging.Formatter):
    reserved_keys = {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "message",
        "module",
        "msecs",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "thread",
        "threadName",
    }

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key in self.reserved_keys or key.startswith("_"):
                continue
            payload[key] = self._serialize(value)
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)

    @staticmethod
    def _serialize(value: Any) -> Any:
        if isinstance(value, (str, int, float, bool)) or value is None:
            return value
        if isinstance(value, dict):
            return {key: JsonFormatter._serialize(item) for key, item in value.items()}
        if isinstance(value, list):
            return [JsonFormatter._serialize(item) for item in value]
        return str(value)


def configure_logging(level: str = "INFO") -> None:
    normalized_level = level.upper()
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {"json": {"()": JsonFormatter}},
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "formatter": "json",
                }
            },
            "root": {"handlers": ["default"], "level": normalized_level},
            "loggers": {
                "uvicorn": {"handlers": ["default"], "level": normalized_level, "propagate": False},
                "uvicorn.error": {"handlers": ["default"], "level": normalized_level, "propagate": False},
                "uvicorn.access": {"handlers": ["default"], "level": normalized_level, "propagate": False},
            },
        }
    )
