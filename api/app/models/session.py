from bson import ObjectId
from redis import Redis
from typing import TypedDict, cast
from uuid import uuid4

from ..connectors import get_session_client


SESSION_COOKIE_NAME = "quiz_session"
SESSION_ID_PREFIX = "session:"


class SessionModel(TypedDict):
    id: str
    user_id: ObjectId


class Sessions:
    client: Redis

    def __init__(self) -> None:
        self.client = get_session_client()

    def create(self, user_id: ObjectId) -> SessionModel:
        session_id = SESSION_ID_PREFIX + str(uuid4())

        self.client.set(session_id, str(user_id))

        return {
            "id": session_id,
            "user_id": user_id,
        }

    def delete(self, id: str) -> bool:
        return self.client.delete(id) is not None

    def get(self, id: str) -> SessionModel:
        user_id = self.client.get(id)

        if user_id is None:
            raise ValueError(f"No session exists with ID: {id}")

        return {
            "id": id,
            "user_id": ObjectId(str(cast(bytes, user_id), encoding="utf-8")),
        }
