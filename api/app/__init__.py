from dotenv import load_dotenv

# Run before everything else

load_dotenv()

from argon2.exceptions import (
    HashingError,
    InvalidHashError,
    VerificationError,
    VerifyMismatchError,
)
from flask import Flask, Response, abort, make_response, request
from typing import Any, Callable, Coroutine, Tuple
from werkzeug.exceptions import HTTPException

from .connectors import configure_connectors
from .context import get_context
from .models import SESSION_COOKIE_NAME, NoUserExistsError, UserAlreadyExistsError, UserModel
from .resolvers import configure_resolvers


def get_basic_auth() -> Tuple[str, str]:
    try:
        assert request.authorization is not None
        assert request.authorization.type == "basic"

        parameters = request.authorization.parameters

        password = parameters.get("password", None)
        username = parameters.get("username", None)

        assert password is not None
        assert username is not None
    except AssertionError:
        abort(400)

    return (username, password)


def perform_basic_auth(
    f: Callable[[str, str], UserModel],
) -> UserModel:
    try:
        (username, password) = get_basic_auth()

        return f(username, password)
    except HashingError:
        abort(500)
    except InvalidHashError:
        abort(400)
    except NoUserExistsError:
        abort(404)
    except UserAlreadyExistsError:
        abort(403)
    except VerificationError:
        abort(500)
    except VerifyMismatchError:
        abort(401)


app = Flask(__name__)

configure_connectors(app)
configure_resolvers(app)

@app.errorhandler(Exception)
def handle_exception(e: Exception) -> Response:
    if app.debug:
        app.logger.exception(e)
    else:
        app.logger.error(e)

    if isinstance(e, HTTPException):
        response = make_response(e.description, e.code)

        response.data = {
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }

        response.content_type = "application/json"

        return response
    
    return make_response({ "error": "Internal Server Error" }, 500)


@app.get("/")
def health_check() -> str:
    return "OK"


@app.post("/login")
def login() -> Response:
    context = get_context()

    if request.authorization is None:
        abort(400)

    user = perform_basic_auth(context.users.login_with_basic_auth)

    r = make_response("SUCCESS", 200)

    session = context.sessions.create(user["_id"])

    r.set_cookie(SESSION_COOKIE_NAME, session["id"])

    return r

@app.post("/logout")
def logout() -> Response:
    context = get_context()

    if SESSION_COOKIE_NAME not in request.cookies:
        abort(400)

    session_id = request.cookies[SESSION_COOKIE_NAME]

    context.sessions.delete(session_id)

    r = make_response("SUCCESS", 200)

    r.delete_cookie(SESSION_COOKIE_NAME)

    return r

@app.post("/signup")
def signup() -> Response:
    context = get_context()

    user = perform_basic_auth(context.users.signup_with_basic_auth)

    r = make_response("SUCCESS", 200)

    session = context.sessions.create(user["_id"])

    r.set_cookie(SESSION_COOKIE_NAME, session["id"])

    return r

# For Gunicorn
application = app