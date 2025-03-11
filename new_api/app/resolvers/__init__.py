from flask import Flask, Request, Response
from strawberry.flask.views import AsyncGraphQLView

from ..context import Context


def configure_resolvers(app: Flask) -> None:
    class CustomView(AsyncGraphQLView):
        def get_context(self, _request: Request, _response: Response) -> Context:
            return Context()

    app.add_url_rule("/graphql", CustomView)