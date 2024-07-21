use std::fmt::Display;

use mongodb::bson::oid;

#[derive(Clone, Debug)]
pub enum ModelError {
    InsertError,
    MongoError(mongodb::error::Error),
    OidError(oid::Error),
}

impl Display for ModelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelError::InsertError => write!(f, "Could not insert document"),
            ModelError::MongoError(error) => error.fmt(f),
            ModelError::OidError(error) => error.fmt(f),
        }
    }
}

impl From<mongodb::error::Error> for ModelError {
    fn from(value: mongodb::error::Error) -> Self {
        Self::MongoError(value)
    }
}

impl From<oid::Error> for ModelError {
    fn from(value: oid::Error) -> Self {
        Self::OidError(value)
    }
}