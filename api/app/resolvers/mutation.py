from strawberry import field, type

from .question import QuestionMutation
from .quiz_template import QuizTemplateMutation

@type
class Mutation:
    question: QuestionMutation = field(resolver=lambda: QuestionMutation())
    quiz_template: QuizTemplateMutation = field(resolver=lambda: QuizTemplateMutation())