use std::fmt::Display;

use argon2::password_hash;
use mongodb::bson::oid;

#[derive(Clone, Debug)]
pub enum ModelError {
    AuthenticationFailed,
    Generic(String),
    InsertError,
    MongoError(mongodb::error::Error),
    OidError(oid::Error),
    PasswordHashError(password_hash::Error),
    UserDoesNotExist(String)
}

impl Display for ModelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelError::AuthenticationFailed => write!(f, "Authentication failed"),
            ModelError::Generic(error) => write!(f, "{}", error),
            ModelError::InsertError => write!(f, "Could not insert document"),
            ModelError::MongoError(error) => error.fmt(f),
            ModelError::OidError(error) => error.fmt(f),
            ModelError::PasswordHashError(error) => error.fmt(f),
            ModelError::UserDoesNotExist(username) => write!(f, "User does not exist {}", username),
        }
    }
}

impl From<&str> for ModelError {
    fn from(value: &str) -> Self {
        Self::Generic(value.to_string())
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

impl From<password_hash::Error> for ModelError {
    fn from(value: password_hash::Error) -> Self {
        Self::PasswordHashError(value)
    }
}

impl From<String> for ModelError {
    fn from(value: String) -> Self {
        Self::Generic(value)
    }
}