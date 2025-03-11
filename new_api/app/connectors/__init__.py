from flask import Flask

from .db import configure_db, get_db

def configure_connectors(app: Flask) -> None:
    configure_db(app)

__all__ = ["configure_connectors", "get_db"]