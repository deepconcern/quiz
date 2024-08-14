use juniper::{graphql_object, FieldResult, GraphQLInputObject, GraphQLObject, ID};
use mongodb::bson::oid::{self, ObjectId};

use crate::context::Context;
use crate::models::{self, BaseModel};

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
    fn to_model(&self) -> Result<models::Question, oid::Error> {
        Ok(models::Question {
            answer: self.answer.clone(),
            id: ObjectId::new().to_string(),
            question: self.question.clone(),
            quiz_template_id: self.quiz_template_id.clone(),
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
    fn to_model(&self, id: &str) -> models::Question {
        models::Question {
            answer: self.answer.clone(),
            id: id.to_string(),
            question: self.question.clone(),
            quiz_template_id: self.quiz_template_id.clone(),
        }
    }
}

pub struct QuestionMutation;

#[graphql_object]
#[graphql(context = Context)]
impl QuestionMutation {
    async fn create(&self, context: &Context, input: CreateQuestion) -> FieldResult<Question> {
        let input_model = input.to_model()?;

        let model = context.questions.create(&input_model).await?;

        Ok(Question::from_model(&model))
    }

    async fn delete_by_id(&self, context: &Context, id: ID) -> FieldResult<bool> {
        let result = context.questions.delete_by_id(&id.to_string()).await?;

        Ok(result)
    }

    async fn edit(
        &self,
        context: &Context,
        id: ID,
        input: EditQuestion,
    ) -> FieldResult<bool> {
        let input_model = input.to_model(&id.to_string());

        let result = context.questions.update_by_id(&id.to_string(), &input_model).await?;
        
        Ok(result)
    }
}

pub struct QuestionQuery;

#[graphql_object]
#[graphql(context = Context)]
impl QuestionQuery {
    async fn all(&self, context: &Context) -> FieldResult<Vec<Question>> {
        let models = context.questions.read_all().await?;

        Ok(models.iter().map(Question::from_model).collect())
    }

    async fn by_id(&self, context: &Context, id: ID) -> FieldResult<Option<Question>> {
        let model = context.questions.read_by_id(&id.to_string()).await?;

        Ok(match model {
            Some(model) => Some(Question::from_model(&model)),
            None => None,
        })
    }
}
