from dataclasses import dataclass
from typing import Optional
from flask import g, request

from .models import SESSION_COOKIE_NAME, Questions, QuizTemplates, Sessions, UserModel, Users

@dataclass
class Context:
    current_user: Optional[UserModel]
    questions: Questions
    quiz_templates: QuizTemplates
    sessions: Sessions
    users: Users

def get_context() -> Context:
    if "context" not in g:
        sessions = Sessions()
        users = Users()

        user = None

        if SESSION_COOKIE_NAME in request.cookies:
            session_id = request.cookies[SESSION_COOKIE_NAME]
            user_id = sessions.get(session_id)["user_id"]
            try:
                user = Users().get_by_id(user_id)
            except ValueError:
                pass

        g.context = Context(
            current_user=user,
            questions=Questions(),
            quiz_templates=QuizTemplates(),
            sessions=sessions,
            users=users,
        )
    
    return g.context