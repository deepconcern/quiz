from bson import ObjectId
from typing import TYPE_CHECKING, Annotated
from strawberry import ID, Private, field, input, lazy, type

from ..context import get_context
from ..models import QuestionModel, Questions

if TYPE_CHECKING:
    from .quiz_template import QuizTemplate


def get_questions() -> Questions:
    return get_context().questions


@type
class Question:
    answer: str
    id: ID
    question: str
    quiz_template_id: Private[ID]

    @staticmethod
    def from_model(model: QuestionModel) -> "Question":
        return Question(
            answer=model["answer"],
            id=ID(str(model["_id"])),
            question=model["question"],
            quiz_template_id=ID(str(model["quiz_template_id"])),
        )

    @field
    def quiz_template(self) -> Annotated["QuizTemplate", lazy(".quiz_template")]:
        from .quiz_template import QuizTemplate

        return QuizTemplate.from_model(
            get_context().quiz_templates.get_by_id(ObjectId(str(self.quiz_template_id)))
        )


@input
class CreateQuestion:
    answer: str
    question: str
    quiz_template_id: ID


@input
class EditQuestion(CreateQuestion):
    id: ID


@type
class QuestionMutation:
    @field
    def create(self, input: CreateQuestion) -> Question:
        return Question.from_model(
            get_questions().create(
                {
                    "answer": input.answer,
                    "question": input.question,
                    "quiz_template_id": ObjectId(str(input.quiz_template_id)),
                }
            )
        )

    @field
    def delete_by_id(self, id: ID) -> bool:
        return get_questions().delete_by_id(ObjectId(str(id)))

    @field
    def edit(self, input: EditQuestion) -> Question:
        return Question.from_model(
            get_questions().edit_by_id(
                ObjectId(str(input.id)),
                {
                    "answer": input.answer,
                    "question": input.question,
                    "quiz_template_id": ObjectId(str(input.quiz_template_id)),
                },
            )
        )


@type
class QuestionQuery:
    @field
    def all(self) -> list[Question]:
        return list(map(Question.from_model, get_questions().all()))

    @field
    def by_id(self, id: ID) -> Question:
        return Question.from_model(get_questions().get_by_id(ObjectId(str(id))))
