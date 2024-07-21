#[macro_use]
extern crate rocket;

mod context;
mod graphql;
mod models;

use std::env::var;

use context::Context;
use dotenvy::dotenv;
use graphql::{Mutation, Query, Schema};
use juniper::EmptySubscription;
use juniper_rocket::{graphiql_source, playground_source, GraphQLRequest, GraphQLResponse};
use mongodb::Database;
use rocket::{build, response::content::RawHtml, State};
use rocket_cors::{AllowedOrigins, CorsOptions};

#[get("/")]
fn health_check() -> &'static str {
    "OK"
}

#[get("/graphiql")]
fn graphiql() -> RawHtml<String> {
    graphiql_source("/graphql", "/subscriptions")
}

#[get("/playground")]
fn playground() -> RawHtml<String> {
    playground_source("/graphql", "/subscriptions")
}

#[get("/graphql?<request..>")]
async fn get_graphql(db: &State<Database>, request: GraphQLRequest, schema: &State<Schema>) -> GraphQLResponse {
    request.execute(&schema, &Context::new(db)).await
}

#[post("/graphql", data = "<request>")]
async fn post_graphql(db: &State<Database>, request: GraphQLRequest, schema: &State<Schema>) -> GraphQLResponse {
    request.execute(&schema, &Context::new(db)).await
}

#[launch]
async fn rocket() -> _ {
    dotenv().ok();

    let client = mongodb::Client::with_uri_str(var("MONGODB_CONNECTION_STRING").unwrap()).await.unwrap();

    let allowed_origins = AllowedOrigins::some_exact(&var("ALLOWED_ORIGINS").unwrap().split(",").map(|s| s.trim()).collect::<Vec<&str>>());

    print!("Allowed origins: {:?}", allowed_origins);

    let cors = CorsOptions {
        allowed_origins,
        ..Default::default()
    }.to_cors().unwrap();

    build()
        .attach(cors)
        .manage(client.default_database().unwrap())
        .manage(Schema::new(
            Query,
            Mutation,
            EmptySubscription::new(),
        ))
        .mount(
            "/",
            routes![
                get_graphql,
                graphiql,
                health_check,
                playground,
                post_graphql
            ],
        )
}
