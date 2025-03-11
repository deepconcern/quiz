from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database
from typing import Optional, TypedDict, cast

BASIC_AUTH_USERS_COLLECTION_NAME = "basic_auth_users"
USERS_COLLECTION_NAME = "users"

class NoUserExistsError(Exception):
    def __init__(self, user_id: ObjectId) -> None:
        super().__init__(f"User with ID '{user_id}' does not exist")

class UserAlreadyExistsError(Exception):
    def __init__(self, user_id: ObjectId) -> None:
        super().__init__(f"User with ID '{user_id}' already exists")

class BasicAuthUserModel(TypedDict):
    _id: ObjectId
    password_hash: str
    user_id: ObjectId

class BasicAuthUsers:
    collection: Collection
    password_hasher: PasswordHasher

    def __init__(self, db: Database) -> None:
        self.collection = db.get_collection(BASIC_AUTH_USERS_COLLECTION_NAME)
        self.password_hasher = PasswordHasher()

    def create(self, user_id: ObjectId, password: str) -> BasicAuthUserModel:
        model = cast(Optional[BasicAuthUserModel], self.collection.find_one({ "user_id": user_id }))

        if model is not None:
            raise UserAlreadyExistsError(user_id)
        
        password_hash = self.password_hasher.hash(password)
        
        result = self.collection.insert_one({
            "password_hash": password_hash,
            "user_id": user_id,
        })

        return {
            "_id": result.inserted_id,
            "password_hash": password_hash,
            "user_id": user_id,
        }

    def verify(self, user_id: ObjectId, password: str) -> BasicAuthUserModel:
        model = cast(Optional[BasicAuthUserModel], self.collection.find_one({ "user_id": user_id }))

        if model is None:
            raise NoUserExistsError(user_id)

        self.password_hasher.verify(model["password_hash"], password)

        if self.password_hasher.check_needs_rehash(model["password_hash"]):
            model["password_hash"] = self.password_hasher.hash(password)
            self.collection.update_one({ "_id": model["_id"] }, { "$set": model["password_hash"] })
        
        return model






class UserModel(TypedDict):
    _id: ObjectId
    username: str

class Users:
    pass