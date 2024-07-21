use std::str::FromStr;

use juniper::{graphql_object, FieldResult, GraphQLInputObject, GraphQLObject, ID};
use mongodb::bson::oid::{self, ObjectId};

use crate::context::Context;
use crate::models;

#[derive(GraphQLObject)]
pub struct Question {
    answer: String,
    id: ID,
    question: String,
}

impl Question {
    pub fn from_model(model: &models::Question) -> Self {
        Self {
            answer: model.answer.clone(),
            id: model.id.to_string().into(),
            question: model.question.clone(),
        }
    }
}

#[derive(GraphQLInputObject)]
struct CreateQuestion {
    answer: String,
    question: String,
    quiz_template_id: String,
}

impl CreateQuestion {
    fn to_model(&self) -> Result<models::NewQuestion, oid::Error> {
        Ok(models::NewQuestion {
            answer: self.answer.clone(),
            question: self.question.clone(),
            quiz_template_id: ObjectId::from_str(&self.quiz_template_id)?,
        })
    }
}

#[derive(GraphQLInputObject)]
struct EditQuestion {
    answer: String,
    question: String,
    quiz_template_id: String,
}

impl EditQuestion {
    fn to_model(&self) -> Result<models::UpdateQuestion, oid::Error> {
        Ok(models::UpdateQuestion {
            answer: self.answer.clone(),
            question: self.question.clone(),
            quiz_template_id: ObjectId::from_str(&self.quiz_template_id)?,
        })
    }
}

pub struct QuestionMutation;

#[graphql_object]
#[graphql(context = Context)]
impl QuestionMutation {
    async fn create(&self, context: &Context, input: CreateQuestion) -> FieldResult<Question> {
        let input_model = input.to_model()?;

        let model = models::Question::create(&context.database, &input_model).await?;

        Ok(Question::from_model(&model))
    }

    async fn delete_by_id(&self, context: &Context, id: ID) -> FieldResult<bool> {
        let db_id = ObjectId::from_str(&id)?;

        let result = models::Question::delete_by_id(&context.database, &db_id).await?;

        Ok(result)
    }

    async fn edit(
        &self,
        context: &Context,
        id: ID,
        input: EditQuestion,
    ) -> FieldResult<Question> {
        let input_model = input.to_model()?;

        let db_id = ObjectId::from_str(&id)?;

        let model = models::Question::update(&context.database, &db_id, &input_model).await?;

        Ok(Question::from_model(&model))
    }
}

pub struct QuestionQuery;

#[graphql_object]
#[graphql(context = Context)]
impl QuestionQuery {
    async fn all(&self, context: &Context) -> FieldResult<Vec<Question>> {
        let models = models::Question::get_all(&context.database).await?;

        Ok(models.iter().map(Question::from_model).collect())
    }

    async fn by_id(&self, context: &Context, id: ID) -> FieldResult<Option<Question>> {
        let db_id = ObjectId::from_str(&id)?;

        let model = models::Question::get_by_id(&context.database, &db_id).await?;

        Ok(match model {
            Some(model) => Some(Question::from_model(&model)),
            None => None,
        })
    }
}
