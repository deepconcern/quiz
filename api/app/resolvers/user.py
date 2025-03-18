from bson import ObjectId
from typing import TYPE_CHECKING, Annotated
from strawberry import ID, field, input, lazy, type

from ..context import get_context
from ..models import UserModel, Users

if TYPE_CHECKING:
    from .quiz_template import QuizTemplate


def get_users() -> Users:
    return get_context().users


@type
class User:
    id: ID
    username: str

    @staticmethod
    def from_model(model: UserModel) -> "User":
        return User(
            id=ID(str(model["_id"])),
            username=model["username"],
        )

    @field
    def quiz_templates(
        self,
    ) -> list[Annotated["QuizTemplate", lazy(".quiz_template")]]:
        from .quiz_template import QuizTemplate

        return list(
            map(
                QuizTemplate.from_model,
                get_context().quiz_templates.get_by_user_id(ObjectId(str(self.id))),
            )
        )


@input
class CreateUser:
    username: str


@type
class UserQuery:
    @field
    def all(self) -> list[User]:
        return list(map(User.from_model, get_users().all()))

    @field
    def by_id(self, id: ID) -> User:
        return User.from_model(get_users().get_by_id(ObjectId(str(id))))
