use mongodb::Database;

use crate::models::{Questions, QuizTemplates, Users};

pub struct Context {
    pub questions: Questions,
    pub quiz_templates: QuizTemplates,
    pub users: Users,
}

impl Context {
    pub fn new(db: &Database) -> Self {
        Self {
            questions: Questions::new(&db),
            quiz_templates: QuizTemplates::new(&db),
            users: Users::new(&db),
        }
    }
}

impl juniper::Context for Context {}