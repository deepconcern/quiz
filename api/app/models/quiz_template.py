from bson import ObjectId

from .document import Document, Documents


QUIZ_TEMPLATES_COLLECTION_NAME = "quiz_template"


class QuizTemplateModel(Document):
    name: str
    user_id: ObjectId


class QuizTemplates(Documents):
    def __init__(self) -> None:
        super().__init__(QUIZ_TEMPLATES_COLLECTION_NAME)

    def get_by_user_id(self, user_id: ObjectId) -> list[QuizTemplateModel]:
        models: list[QuizTemplateModel] = []
        priming_data = {}

        for model in self.collection.find({"user_id": user_id}):
            priming_data[model["_id"]] = model

            models.append(model)

        self.dataloader.prime_many(priming_data)

        return models
