use mongodb::{bson::{doc, oid::ObjectId}, Collection, Database};
use rocket::futures::TryStreamExt;
use serde::{Deserialize, Serialize};

use super::error::ModelError;

const QUESTIONS_COLLECTION: &'static str = "questions";

#[derive(Debug, Deserialize, Serialize)]
pub struct Question {
    #[serde(rename(deserialize = "_id", serialize = "id"))]
    pub id: ObjectId,
    pub answer: String,
    pub question: String,
    pub quiz_template_id: ObjectId,
}

pub struct NewQuestion {
    pub answer: String,
    pub question: String,
    pub quiz_template_id: ObjectId,
}

pub struct UpdateQuestion {
    pub answer: String,
    pub question: String,
    pub quiz_template_id: ObjectId,
}

impl Question {
    pub fn collection(db: &Database) -> Collection<Question> {
        db.collection::<Question>(QUESTIONS_COLLECTION)
    }

    pub async fn create(db: &Database, new_question: &NewQuestion) -> Result<Question, ModelError> {
        let result = Question::collection(db)
            .insert_one(Question {
                answer: new_question.answer.clone(),
                id: ObjectId::new(),
                question: new_question.question.clone(),
                quiz_template_id: new_question.quiz_template_id.clone(),
            })
            .await?;

        let inserted_id = result
            .inserted_id
            .as_object_id()
            .ok_or(ModelError::InsertError)?;

        Question::get_by_id(db, &inserted_id)
            .await?
            .ok_or(ModelError::InsertError)
    }

    pub async fn delete_by_id(db: &Database, id: &ObjectId) -> Result<bool, ModelError> {
        let result = Question::collection(db).delete_one(doc! {
            "_id": id,
        }).await?;

        Ok(result.deleted_count > 0)
    }

    pub async fn delete_by_quiz_template_id(db: &Database, quiz_template_id: &ObjectId) -> Result<bool, ModelError> {
        let result = Question::collection(db).delete_one(doc! {
            "quiz_template_id": quiz_template_id,
        }).await?;

        Ok(result.deleted_count > 0)
    }

    pub async fn get_all(db: &Database) -> Result<Vec<Question>, ModelError> {
        let questions = Question::collection(db)
            .find(doc! {})
            .await?
            .try_collect()
            .await?;

        Ok(questions)
    }

    pub async fn get_by_id(db: &Database, id: &ObjectId) -> Result<Option<Question>, ModelError> {
        let question = Question::collection(db)
            .find_one(doc! { "_id": id })
            .await?;

        Ok(question)
    }

    pub async fn get_by_quiz_template_id(
        db: &Database,
        quiz_template_id: &ObjectId,
    ) -> Result<Vec<Question>, ModelError> {
        let questions = Question::collection(db)
            .find(doc! {
                "quiz_template_id": quiz_template_id,
            })
            .await?
            .try_collect()
            .await?;

        Ok(questions)
    }

    pub async fn update(
        db: &Database,
        id: &ObjectId,
        update_question: &UpdateQuestion,
    ) -> Result<Question, ModelError> {
        let result = Question::collection(db)
            .update_one(
                doc! {
                    "_id": id,
                },
                doc! {
                    "$set": doc! {
                        "answer": update_question.answer.clone(),
                        "question": update_question.question.clone(),
                        "quiz_template_id": update_question.quiz_template_id.clone(),
                    },
                },
            )
            .await?;

        if result.modified_count == 0 {
            Err(ModelError::UpdateError)
        } else {
            Question::get_by_id(db, id)
                .await?
                .ok_or(ModelError::UpdateError)
        }
    }
}
