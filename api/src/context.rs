use mongodb::{Client, Database};

pub struct Context {
    pub database: Database,
}

impl Context {
    pub fn new(db_client: &Client) -> Self {
        Self {
            database: db_client.default_database().unwrap(),
        }
    }
}

impl juniper::Context for Context {}