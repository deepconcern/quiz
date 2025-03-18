from bson import ObjectId
from typing import Any, TypeVar, TypedDict, Union, cast

from ..connectors import get_db
from ..dataloader import DataLoader

class Document(TypedDict):
    _id: ObjectId

D = TypeVar("D", bound=Document)

class Documents[D]:
    def __init__(self, collection_name: str) -> None:
        collection = get_db().get_collection(collection_name)

        def load(ids: list[ObjectId]) -> list[Union[D, ValueError]]:
            data: list[Union[D, ValueError]] = []

            for id in ids:
                model = collection.find_one({ "_id": id })

                data.append(model if model is not None else ValueError(f"No model exists with ID: {id}"))

            return data

        self.collection = collection
        self.dataloader = DataLoader(load_fn=load)
    
    def all(self) -> list[D]:
        models: list[D] = []
        priming_data = {}

        for model in self.collection.find({}):
            priming_data[model["_id"]] = model
        
            models.append(model)
        
        self.dataloader.prime_many(priming_data)

        return models
    
    def create(self, doc: dict) -> D:
        result = self.collection.insert_one(doc)

        model = cast(Any, { **doc, "_id": result.inserted_id })

        self.dataloader.prime(model["_id"], model)

        return model
    
    def delete_by_id(self, id: ObjectId) -> bool:
        self.dataloader.clear(id)

        return self.collection.delete_one({ "_id": id }).deleted_count > 0
    
    def edit_by_id(self, id: ObjectId, doc: dict) -> D:
        self.collection.update_one({ "_id": id }, doc)

        return cast(D, { **doc, "_id": id })

    def get_by_id(self, id: ObjectId) -> D:
        return self.dataloader.load(id)