from flask import g
from os import environ
from redis import Redis, from_url

def get_session_client() -> Redis:
    if "session" not in g:
        g.session = from_url(environ["SESSION_CLIENT_CONNECTION_STRING"])

    return g.session