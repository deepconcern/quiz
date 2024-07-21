use mongodb::{
    bson::{doc, oid::ObjectId, Document},
    Collection, Database,
};
use rocket::futures::TryStreamExt;
use serde::{Deserialize, Serialize};

use super::{error::ModelError, Question};

const QUIZ_TEMPLATES_COLLECTION: &'static str = "quiz_templates";

#[derive(Debug, Deserialize, Serialize)]
pub struct QuizTemplate {
    #[serde(rename(deserialize = "_id", serialize = "id"))]
    pub id: ObjectId,
    pub name: String,
}

pub struct NewQuizTemplate {
    pub name: String,
}

pub struct UpdateQuizTemplate {
    pub name: String,
}

impl QuizTemplate {
    pub fn collection(db: &Database) -> Collection<QuizTemplate> {
        db.collection::<QuizTemplate>(QUIZ_TEMPLATES_COLLECTION)
    }

    pub async fn create(
        db: &Database,
        new_quiz_template: &NewQuizTemplate,
    ) -> Result<QuizTemplate, ModelError> {
        let result = QuizTemplate::collection(db)
            .insert_one(QuizTemplate {
                id: ObjectId::new(),
                name: new_quiz_template.name.clone(),
            })
            .await?;

        let inserted_id = result
            .inserted_id
            .as_object_id()
            .ok_or(ModelError::InsertError)?;

        QuizTemplate::get_by_id(db, &inserted_id)
            .await?
            .ok_or(ModelError::InsertError)
    }

    pub async fn delete_by_id(db: &Database, id: &ObjectId) -> Result<bool, ModelError> {
        let questions_result = Question::delete_by_quiz_template_id(db, id).await?;
        
        let result = QuizTemplate::collection(db).delete_one(doc! {
            "_id": id,
        }).await?;

        Ok(questions_result && result.deleted_count > 0)
    }

    pub async fn get_all(db: &Database) -> Result<Vec<QuizTemplate>, ModelError> {
        let quiz_templates = QuizTemplate::collection(db)
            .find(Document::new())
            .await?
            .try_collect()
            .await?;

        Ok(quiz_templates)
    }

    pub async fn get_by_id(
        db: &Database,
        id: &ObjectId,
    ) -> Result<Option<QuizTemplate>, ModelError> {
        let quiz_template = QuizTemplate::collection(db)
            .find_one(doc! { "_id": id })
            .await?;

        Ok(quiz_template)
    }

    pub async fn update(
        db: &Database,
        id: &ObjectId,
        update_quiz_template: &UpdateQuizTemplate,
    ) -> Result<QuizTemplate, ModelError> {
        let result = QuizTemplate::collection(db)
            .update_one(
                doc! {
                    "_id": id,
                },
                doc! {
                    "$set": doc! {
                        "name": update_quiz_template.name.clone(),
                    },
                },
            )
            .await?;

        if result.modified_count == 0 {
            Err(ModelError::UpdateError)
        } else {
            QuizTemplate::get_by_id(db, id)
                .await?
                .ok_or(ModelError::UpdateError)
        }
    }
}
