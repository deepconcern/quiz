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

const USERS_COLLECTION: &'static str = "users";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct User {
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        rename = "_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub id: String,
    pub username: String,
}

impl Into<Document> for User {
    fn into(self) -> Document {
        doc! {
            "_id": self.id,
            "username": self.username,
        }
    }
}

pub struct Users {
    collection: Collection<User>,
}

impl BaseModel<User> for Users {
    fn collection(&self) -> Collection<User> {
        self.collection.clone()
    }

    fn update_doc(&self, model: &User) -> Result<Document, super::error::ModelError> {
        Ok(doc! {
            "username": model.username.clone(),
        })
    }
}

impl Users {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(USERS_COLLECTION),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BasicAuthUser {
    #[serde(rename(deserialize = "_id", serialize = "id"))]
    pub id: ObjectId,
    pub password_hash: String,
    pub user_id: ObjectId,
}
