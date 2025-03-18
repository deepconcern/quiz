from bson import ObjectId

from .document import Document, Documents


QUESTIONS_COLLECTION_NAME = "questions"


class QuestionModel(Document):
    answer: str
    question: str
    quiz_template_id: ObjectId


class Questions(Documents[QuestionModel]):
    def __init__(self) -> None:
        super().__init__(QUESTIONS_COLLECTION_NAME)

    def get_by_quiz_template_id(
        self, quiz_template_id: ObjectId
    ) -> list[QuestionModel]:
        models: list[QuestionModel] = []
        priming_data = {}

        for model in self.collection.find({"quiz_template_id": quiz_template_id}):
            priming_data[model["_id"]] = model

            models.append(model)

        self.dataloader.prime_many(priming_data)

        return models
