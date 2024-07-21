use std::str::FromStr;

use juniper::{graphql_object, FieldResult, GraphQLInputObject, ID};
use mongodb::bson::doc;
use mongodb::bson::oid::ObjectId;

use super::question::Question;

use crate::context::Context;
use crate::models::{self, BaseModel};

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

        let results = context.questions.read_by_filter(doc! {
            "quiz_template_id": id,
        }).await?;

        Ok(results.iter().map(Question::from_model).collect())
    }
}

#[derive(GraphQLInputObject)]
struct CreateQuizTemplate {
    name: String,
}

impl CreateQuizTemplate {
    fn to_model(&self) -> models::QuizTemplate {
        models::QuizTemplate {
            id: ObjectId::new().to_string(),
            name: self.name.clone(),
        }
    }
}

#[derive(GraphQLInputObject)]
struct EditQuizTemplate {
    name: String,
}

impl EditQuizTemplate {
    fn to_model(&self, id: &str) -> models::QuizTemplate {
        models::QuizTemplate {
            id: id.to_string(),
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

        let model = context.quiz_templates.create(&input_model).await?;

        Ok(QuizTemplate::from_model(&model))
    }

    async fn delete_by_id(&self, context: &Context, id: ID) -> FieldResult<bool> {
        context.questions.delete_by_filter(doc! {
            "quiz_template_id": &id.to_string(),
        }).await?;

        let result = context.quiz_templates.delete_by_id(&id.to_string()).await?;

        Ok(result)
    }

    async fn edit(
        &self,
        context: &Context,
        id: ID,
        input: EditQuizTemplate,
    ) -> FieldResult<bool> {
        let input_model = input.to_model(&id.to_string());

        let result = context.quiz_templates.update_by_id(&id.to_string(), &input_model).await?;

        Ok(result)
    }
}

pub struct QuizTemplateQuery;

#[graphql_object]
#[graphql(context = Context)]
impl QuizTemplateQuery {
    async fn all(&self, context: &Context) -> FieldResult<Vec<QuizTemplate>> {
        let models = context.quiz_templates.read_all().await?;

        Ok(models.iter().map(QuizTemplate::from_model).collect())
    }

    async fn by_id(&self, context: &Context, id: ID) -> FieldResult<Option<QuizTemplate>> {
        let model = context.quiz_templates.read_by_id(&id.to_string()).await?;

        Ok(match model {
            Some(model) => Some(QuizTemplate::from_model(&model)),
            None => None,
        })
    }
}
