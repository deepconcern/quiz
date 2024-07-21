use std::str::FromStr;

use juniper::{graphql_object, FieldResult, GraphQLInputObject, GraphQLObject, ID};
use mongodb::bson::oid::ObjectId;

use super::question::Question;

use crate::context::Context;
use crate::models;

struct QuizTemplate {
    id: ID,
    name: String,
}

impl QuizTemplate {
    fn from_model(model: &models::QuizTemplate) -> Self {
        println!("{:?}", model);
        Self {
            id: model.id.to_string().into(),
            name: model.name.clone(),
        }
    }
}

#[graphql_object]
#[graphql(context = Context)]
impl QuizTemplate {
    fn id(&self) -> ID {
        self.id.clone()
    }

    fn name(&self) -> &str {
        self.name.as_str()
    }

    async fn questions(&self, context: &Context) -> FieldResult<Vec<Question>> {
        let id = ObjectId::from_str(&self.id.to_string())?;

        let results = models::Question::get_by_quiz_template_id(&context.database, &id).await?;

        Ok(results.iter().map(Question::from_model).collect())
    }
}

#[derive(GraphQLInputObject)]
struct CreateQuizTemplate {
    name: String,
}

impl CreateQuizTemplate {
    fn to_model(&self) -> models::NewQuizTemplate {
        models::NewQuizTemplate {
            name: self.name.clone(),
        }
    }
}

#[derive(GraphQLObject)]
struct CreateQuizTemplateError {
    id: String,
}

#[derive(GraphQLInputObject)]
struct EditQuizTemplate {
    name: String,
}

impl EditQuizTemplate {
    fn to_model(&self) -> models::UpdateQuizTemplate {
        models::UpdateQuizTemplate {
            name: self.name.clone(),
        }
    }
}

pub struct QuizTemplateMutation;

#[graphql_object]
#[graphql(context = Context)]
impl QuizTemplateMutation {
    async fn create(&self, context: &Context, input: CreateQuizTemplate) -> FieldResult<QuizTemplate> {
        let input_model = input.to_model();

        let model = models::QuizTemplate::create(&context.database, &input_model).await?;

        Ok(QuizTemplate::from_model(&model))
    }

    async fn delete_by_id(&self, context: &Context, id: ID) -> FieldResult<bool> {
        let db_id = ObjectId::from_str(&id)?;

        let result = models::QuizTemplate::delete_by_id(&context.database, &db_id).await?;

        Ok(result)
    }

    async fn edit(
        &self,
        context: &Context,
        id: ID,
        input: EditQuizTemplate,
    ) -> FieldResult<QuizTemplate> {
        let input_model = input.to_model();

        let db_id = ObjectId::from_str(&id)?;

        let model = models::QuizTemplate::update(&context.database, &db_id, &input_model).await?;

        Ok(QuizTemplate::from_model(&model))
    }
}

pub struct QuizTemplateQuery;

#[graphql_object]
#[graphql(context = Context)]
impl QuizTemplateQuery {
    async fn all(&self, context: &Context) -> FieldResult<Vec<QuizTemplate>> {
        let models = models::QuizTemplate::get_all(&context.database).await?;

        Ok(models.iter().map(QuizTemplate::from_model).collect())
    }

    async fn by_id(&self, context: &Context, id: ID) -> FieldResult<Option<QuizTemplate>> {
        let db_id = ObjectId::from_str(&id)?;

        let model = models::QuizTemplate::get_by_id(&context.database, &db_id).await?;

        Ok(match model {
            Some(model) => Some(QuizTemplate::from_model(&model)),
            None => None,
        })
    }
}
