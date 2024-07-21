use std::fmt::Display;

#[derive(Clone, Debug)]
pub enum ModelError {
    MongoError(mongodb::error::Error),
    InsertError,
    UpdateError,
}

impl Display for ModelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ModelError::InsertError => write!(f, "Could not insert document"),
            ModelError::MongoError(error)=> {
                write!(f, "Mongo Error: ")?;

                error.fmt(f)
            },
            ModelError::UpdateError => write!(f, "Could not update document"),
        }
    }
}

impl From<mongodb::error::Error> for ModelError {
    fn from(value: mongodb::error::Error) -> Self {
        Self::MongoError(value)
    }
}