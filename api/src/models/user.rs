use std::str::FromStr;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2, PasswordHash, PasswordVerifier,
};
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

use super::{base_model::BaseModel, error::ModelError};

const BASIC_AUTH_USERS_COLLECTION: &'static str = "basic_auth_users";
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
    basic_auth_users: BasicAuthUsers,
    collection: Collection<User>,
}

impl BaseModel<User> for Users {
    fn collection(&self) -> Collection<User> {
        self.collection.clone()
    }

    fn update_doc(&self, model: &User) -> Result<Document, ModelError> {
        Ok(doc! {
            "username": model.username.clone(),
        })
    }
}

impl Users {
    pub fn new(db: &Database) -> Self {
        Self {
            basic_auth_users: BasicAuthUsers::new(db),
            collection: db.collection(USERS_COLLECTION),
        }
    }

    pub async fn signup_with_basic_auth(
        &self,
        username: &str,
        password: &str,
    ) -> Result<User, ModelError> {
        let existing_models = self
            .read_by_filter(doc! {
                "username": username,
            })
            .await?;

        if existing_models.len() > 0 {
            return Err(format!("Username '{}' already exists.", username))?;
        }

        let model = User {
            id: ObjectId::new().to_string(),
            username: username.to_string(),
        };

        self.create(&model).await?;

        self.basic_auth_users
            .create_by_user_id_and_password(&model.id, password)
            .await?;

        Ok(model)
    }

    pub async fn login_with_basic_auth(
        &self,
        username: &str,
        password: &str,
    ) -> Result<User, ModelError> {
        let models = self
            .read_by_filter(doc! {
                "username": username,
            })
            .await?;

        if models.len() != 1 {
            return Err(ModelError::UserDoesNotExist(username.to_string()));
        }

        let model = models[0].clone();

        let authenticated = self
            .basic_auth_users
            .verify_password_hash_by_user_id(&model.id, password)
            .await?;

        if !authenticated {
            return Err(ModelError::AuthenticationFailed)?;
        }

        Ok(model)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct BasicAuthUser {
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        rename = "_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub id: String,
    pub password_hash: String,
    pub salt: String,
    #[serde(
        deserialize_with = "deserialize_hex_string_from_object_id",
        serialize_with = "serialize_hex_string_as_object_id"
    )]
    pub user_id: String,
}

struct BasicAuthUsers {
    collection: Collection<BasicAuthUser>,
}

impl BasicAuthUsers {
    pub fn new(db: &Database) -> Self {
        Self {
            collection: db.collection(BASIC_AUTH_USERS_COLLECTION),
        }
    }

    pub async fn create_by_user_id_and_password(
        &self,
        user_id: &str,
        password: &str,
    ) -> Result<BasicAuthUser, ModelError> {
        let salt = SaltString::generate(&mut OsRng);

        let password_hash = Argon2::default()
            .hash_password(&password.as_bytes(), &salt)?
            .to_string();

        self.create(&BasicAuthUser {
            id: ObjectId::new().to_string(),
            password_hash,
            salt: salt.as_str().to_string(),
            user_id: user_id.to_string(),
        })
        .await
    }

    pub async fn verify_password_hash_by_user_id(
        &self,
        user_id: &str,
        password: &str,
    ) -> Result<bool, ModelError> {
        let models = self
            .read_by_filter(doc! {
                "user_id": ObjectId::from_str(user_id)?,
            })
            .await?;

        if models.len() != 1 {
            return Err(format!(
                "Error getting basic auth information for ID '{}''",
                user_id
            ))?;
        }

        let model = &models[0];

        let parsed_hash = PasswordHash::new(&model.password_hash)?;

        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }
}

impl BaseModel<BasicAuthUser> for BasicAuthUsers {
    fn collection(&self) -> Collection<BasicAuthUser> {
        self.collection.clone()
    }

    fn update_doc(&self, model: &BasicAuthUser) -> Result<Document, ModelError> {
        Ok(doc! {
            "password_hash": model.password_hash.clone(),
            "salt": model.salt.clone(),
            "user_id": model.user_id.clone(),
        })
    }
}
