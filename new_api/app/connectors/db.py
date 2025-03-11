from typing import Optional
from flask import Flask, g
from os import environ
from pymongo import MongoClient

def configure_db(app: Flask) -> None:
    def close_db() -> None:
        db: Optional[MongoClient] = g.pop("db")

        if db is not None:
            db.close()

    app.teardown_appcontext(close_db)

def get_db() -> MongoClient:
    if "db" not in g:
        g.db = MongoClient(environ["DB_CONNECTION_STRING"])

    return g.db
    
