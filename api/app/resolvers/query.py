from strawberry import field, type
from typing import Optional

from ..context import get_context

from .question import QuestionQuery
from .quiz_template import QuizTemplateQuery
from .user import User, UserQuery

@type
class Query:
    question: QuestionQuery = field(resolver=lambda: QuestionQuery())
    quiz_template: QuizTemplateQuery = field(resolver=lambda: QuizTemplateQuery())
    user: UserQuery = field(resolver=lambda: UserQuery())

    @field
    def current_user(self) -> Optional[User]:
        model = get_context().current_user

        if model is None:
            return None
        
        return User.from_model(model)
