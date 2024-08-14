mod question;
mod quiz_template;

use juniper::{graphql_object, EmptySubscription, GraphQLObject, RootNode, ID};
use question::{QuestionMutation, QuestionQuery};
use quiz_template::{QuizTemplateMutation, QuizTemplateQuery};

use crate::{context::Context, models};

#[derive(GraphQLObject)]
pub struct User {
    id: ID,
    username: String,
}

impl User {
    fn from_model(model: &models::User) -> Self {
        Self {
            id: model.id.clone().into(),
            username: model.username.clone(),
        }
    }
}


pub struct Mutation;

#[graphql_object]
#[graphql(context = Context)]
impl Mutation {
    fn question(&self) -> QuestionMutation {
        QuestionMutation
    }

    fn quiz_template(&self) -> QuizTemplateMutation {
        QuizTemplateMutation
    }
}

pub struct Query;

#[graphql_object]
#[graphql(context = Context)]
impl Query {
    fn api_version(&self) -> &'static str {
        "1.0"
    }

    fn question(&self) -> QuestionQuery {
        QuestionQuery
    }

    fn quiz_template(&self) -> QuizTemplateQuery {
        QuizTemplateQuery
    }

    fn user(&self, context: &Context) -> Option<User> {
        context.user.as_ref().map(User::from_model)
    }
}

pub type Schema = RootNode<'static, Query, Mutation, EmptySubscription<Context>>;
