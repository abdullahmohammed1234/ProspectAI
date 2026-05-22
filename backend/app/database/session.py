from __future__ import annotations

from fastapi import Request


def get_database(request: Request):
    """Return the configured database instance from the application state."""
    return request.app.state.database
