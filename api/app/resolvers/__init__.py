from flask import Flask, Request, Response
from strawberry import Schema
from strawberry.flask.views import GraphQLView

from ..context import Context, get_context

from .mutation import Mutation
from .query import Query


def configure_resolvers(app: Flask) -> None:
    schema = Schema(Query, Mutation)

    class CustomView(GraphQLView[Context]):
        def get_context(self, request: Request, response: Response) -> Context:
            return get_context()

    app.add_url_rule("/graphql", view_func=CustomView.as_view("graphql_view", schema=schema))