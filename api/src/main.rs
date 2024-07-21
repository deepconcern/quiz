#[macro_use]
extern crate rocket;
extern crate rocket_db_pools;

mod context;
mod graphql;
mod models;
mod schema;

use std::env::var;

use context::Context;
use dotenvy::dotenv;
use graphql::{Mutation, Query, Schema};
use juniper::EmptySubscription;
use juniper_rocket::{graphiql_source, playground_source, GraphQLRequest, GraphQLResponse};
use mongodb::Client;
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
async fn get_graphql(db_client: &State<Client>, request: GraphQLRequest, schema: &State<Schema>) -> GraphQLResponse {
    request.execute(&schema, &Context::new(db_client.inner())).await
}

#[post("/graphql", data = "<request>")]
async fn post_graphql(db_client: &State<Client>, request: GraphQLRequest, schema: &State<Schema>) -> GraphQLResponse {
    request.execute(&schema, &Context::new(db_client.inner())).await
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
        .manage(client)
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
