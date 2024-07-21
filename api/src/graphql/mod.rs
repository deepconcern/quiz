mod question;
mod quiz_template;

use juniper::{graphql_object, EmptySubscription, RootNode};
use question::{QuestionMutation, QuestionQuery};
use quiz_template::{QuizTemplateMutation, QuizTemplateQuery};

use crate::context::Context;


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
}

pub type Schema = RootNode<'static, Query, Mutation, EmptySubscription<Context>>;
