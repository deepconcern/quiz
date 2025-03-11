from strawberry import field, type

@type
class Query:
    apiVersion: str = field(resolver = lambda: "1")