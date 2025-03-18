from argon2 import PasswordHasher
from bson import ObjectId
from typing import Optional, Union, cast

from .document import Document, Documents

BASIC_AUTH_USERS_COLLECTION_NAME = "basic_auth_users"
USERS_COLLECTION_NAME = "users"


class NoUserExistsError(Exception):
    def __init__(self, id: Union[ObjectId, str], id_type="user_id") -> None:
        super().__init__(f"User with {id_type} '{id}' does not exist")


class UserAlreadyExistsError(Exception):
    def __init__(self, id: Union[ObjectId, str], id_type="user_id") -> None:
        super().__init__(f"User with {id_type} '{id}' already exists")


class BasicAuthUserModel(Document):
    password_hash: str
    user_id: ObjectId


class BasicAuthUsers(Documents):
    password_hasher: PasswordHasher

    def __init__(self) -> None:
        super().__init__(BASIC_AUTH_USERS_COLLECTION_NAME)

        self.password_hasher = PasswordHasher()

    def create(self, doc: dict) -> BasicAuthUserModel:
        password_hash = self.password_hasher.hash(doc["password_hash"])

        return super().create(
            {"password_hash": password_hash, "user_id": doc["user_id"]}
        )

    def verify(self, user_id: ObjectId, password: str) -> BasicAuthUserModel:
        model = cast(
            Optional[BasicAuthUserModel], self.collection.find_one({"user_id": user_id})
        )

        if model is None:
            raise NoUserExistsError(user_id)

        self.password_hasher.verify(model["password_hash"], password)

        if self.password_hasher.check_needs_rehash(model["password_hash"]):
            model["password_hash"] = self.password_hasher.hash(password)
            self.collection.update_one(
                {"_id": model["_id"]}, {"$set": model["password_hash"]}
            )

        return model


class UserModel(Document):
    username: str


class Users(Documents):
    basic_auth_users: BasicAuthUsers

    def __init__(self) -> None:
        super().__init__(USERS_COLLECTION_NAME)
        self.basic_auth_users = BasicAuthUsers()

    def login_with_basic_auth(self, username: str, password: str) -> UserModel:
        model = cast(
            Optional[UserModel], self.collection.find_one({"username": username})
        )

        if model is None:
            raise NoUserExistsError(username, "username")

        self.dataloader.prime(model["_id"], model)

        self.basic_auth_users.verify(model["_id"], password)

        return model

    def signup_with_basic_auth(self, username: str, password: str) -> UserModel:
        model = cast(
            Optional[UserModel], self.collection.find_one({"username": username})
        )

        if model is not None:
            raise UserAlreadyExistsError(username, "username")

        result = self.collection.insert_one({"username": username})

        model = {
            "_id": result.inserted_id,
            "username": username,
        }

        self.basic_auth_users.create(
            {"user_id": model["_id"], "password_hash": password}
        )
        self.dataloader.prime(model["_id"], model)

        return model
