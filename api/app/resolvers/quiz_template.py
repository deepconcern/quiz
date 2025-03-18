from bson import ObjectId
from typing import TYPE_CHECKING, Annotated
from strawberry import ID, Private, field, input, lazy, type

from ..context import get_context
from ..models import QuizTemplateModel, QuizTemplates

if TYPE_CHECKING:
    from .question import Question


def get_quiz_templates() -> QuizTemplates:
    return get_context().quiz_templates


@type
class QuizTemplate:
    id: ID
    name: str
    user_id: Private[ID]

    @staticmethod
    def from_model(model: QuizTemplateModel) -> "QuizTemplate":
        return QuizTemplate(
            id=ID(str(model["_id"])),
            name=model["name"],
            user_id=ID(str(model["user_id"])),
        )

    @field
    def questions(self) -> list[Annotated["Question", lazy(".question")]]:
        from .question import Question

        return list(
            map(
                Question.from_model,
                get_context().questions.get_by_quiz_template_id(ObjectId(str(self.id))),
            )
        )


@input
class CreateQuizTemplate:
    name: str
    user_id: ID


@input
class EditQuizTemplate(CreateQuizTemplate):
    id: ID


@type
class QuizTemplateMutation:
    @field
    def create(self, input: CreateQuizTemplate) -> QuizTemplate:
        return QuizTemplate.from_model(
            get_quiz_templates().create(
                {"name": input.name, "user_id": ObjectId(str(input.user_id))}
            )
        )

    @field
    def edit(self, input: EditQuizTemplate) -> QuizTemplate:
        return QuizTemplate.from_model(
            get_quiz_templates().edit_by_id(
                ObjectId(str(input.id)),
                {"name": input.name, "user_id": ObjectId(str(input.user_id))},
            )
        )

    @field
    def delete_by_id(self, id: ID) -> bool:
        return get_quiz_templates().delete_by_id(ObjectId(str(id)))


@type
class QuizTemplateQuery:
    @field
    def all(self) -> list[QuizTemplate]:
        return list(map(QuizTemplate.from_model, get_quiz_templates().all()))

    @field
    def by_id(self, id: ID) -> QuizTemplate:
        return QuizTemplate.from_model(
            get_quiz_templates().get_by_id(ObjectId(str(id)))
        )

    @field
    def by_user_id(self, user_id: ID) -> list[QuizTemplate]:
        return list(
            map(
                QuizTemplate.from_model,
                get_quiz_templates().get_by_user_id(ObjectId(str(user_id))),
            )
        )
