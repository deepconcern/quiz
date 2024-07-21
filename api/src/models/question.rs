use std::str::FromStr;

use mongodb::{
    bson::{
        doc,
        oid::ObjectId,
        serde_helpers::{deserialize_hex_string_from_object_id, serialize_hex_string_as_object_id},
        Document,
    },
    Collection, Database,
};
use serde::{Deserialize, Serialize};

use super::base_model::BaseModel;

const QUESTIONS_COLLECTION: &'static str = "questions";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Question {
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        rename = "_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub id: String,
    pub answer: String,
    pub question: String,
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub quiz_template_id: String,
}

pub struct Questions {
    collection: Collection<Question>,
}

impl Questions {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection::<Question>(QUESTIONS_COLLECTION),
        }
    }
}

impl BaseModel<Question> for Questions {
    fn collection(&self) -> Collection<Question> {
        self.collection.clone()
    }

    fn update_doc(&self, model: &Question) -> Result<Document, super::error::ModelError> {
        Ok(doc! {
            "answer": model.answer.clone(),
            "question": model.question.clone(),
            "quiz_template_id": ObjectId::from_str(&model.quiz_template_id)?,
        })
    }
}
