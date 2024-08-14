use mongodb::{
    bson::{
        doc,
        serde_helpers::{deserialize_hex_string_from_object_id, serialize_hex_string_as_object_id},
        Document,
    },
    Collection, Database,
};
use serde::{Deserialize, Serialize};

use super::base_model::BaseModel;

const QUIZ_TEMPLATES_COLLECTION: &'static str = "quiz_templates";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct QuizTemplate {
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        rename = "_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub id: String,
    pub name: String,
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub user_id: String,
}

pub struct QuizTemplates {
    collection: Collection<QuizTemplate>,
}

impl BaseModel<QuizTemplate> for QuizTemplates {
    fn collection(&self) -> Collection<QuizTemplate> {
        self.collection.clone()
    }

    fn update_doc(&self, model: &QuizTemplate) -> Result<Document, super::error::ModelError> {
        Ok(doc! {
            "name": model.name.clone(),
            "user_id": model.user_id.clone(),
        })
    }
}

impl QuizTemplates {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection::<QuizTemplate>(QUIZ_TEMPLATES_COLLECTION),
        }
    }
}
