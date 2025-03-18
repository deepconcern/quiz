from typing import Optional
from flask import Flask, g
from os import environ
from pymongo import MongoClient
from pymongo.database import Database

def configure_db(app: Flask) -> None:
    def close_db(_: Optional[BaseException]) -> None:
        db_client: Optional[MongoClient] = g.pop("db_client", None)

        if db_client is not None:
            db_client.close()

    app.teardown_appcontext(close_db)

def get_db() -> Database:
    if "db_client" not in g:
        g.db_client = MongoClient(environ["DB_CONNECTION_STRING"])

    return g.db_client.get_default_database()