#[macro_use]
extern crate rocket;

mod auth;
mod context;
mod graphql;
mod models;
mod session;

use std::{env::var, fs};

use auth::BasicAuth;
use context::Context;
use dotenvy::dotenv;
use graphql::{Mutation, Query, Schema};
use juniper::EmptySubscription;
use juniper_rocket::{graphiql_source, playground_source, GraphQLRequest, GraphQLResponse};
use models::ModelError;
use rocket::{
    build,
    fs::NamedFile,
    http::{CookieJar, Status},
    response::content::RawHtml,
    State,
};
use session::SessionStorage;

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
async fn get_graphql(
    context: Context,
    request: GraphQLRequest,
    schema: &State<Schema>,
) -> GraphQLResponse {
    request.execute(&schema, &context).await
}

#[post("/graphql", data = "<request>")]
async fn post_graphql(
    context: Context,
    request: GraphQLRequest,
    schema: &State<Schema>,
) -> GraphQLResponse {
    request.execute(&schema, &context).await
}

fn map_login_error(e: ModelError) -> (Status, &'static str) {
    match e {
        ModelError::AuthenticationFailed => eprintln!("ERROR: {:?}", e),
        ModelError::UserDoesNotExist(_) => eprintln!("ERROR: {:?}", e),
        _ => panic!("Invalid state: {:?}", e),
    };

    (Status::Unauthorized, "Unauthorized")
}

#[get("/login")]
async fn login_page() -> NamedFile {
    let path = std::path::Path::new(rocket::fs::relative!("static")).join("login.html");

    NamedFile::open(path).await.unwrap()
}

#[post("/login")]
async fn login(
    basic_auth: BasicAuth,
    context: Context,
    cookie_jar: &CookieJar<'_>,
    mut session_storage: SessionStorage,
) -> Result<(), (Status, &'static str)> {
    let (username, password) = basic_auth.0.as_ref().ok_or_else(|| {
        eprintln!("Invalid header: {:?}", basic_auth);

        (Status::BadRequest, "Invalid authorization header")
    })?;

    let user = context
        .users
        .login_with_basic_auth(username, password)
        .await
        .map_err(map_login_error)?;

    let _ = session_storage
        .create_session(&user.id, cookie_jar)
        .await
        .map_err(|e| match e {
            _ => {
                eprintln!("Error creating session");

                (Status::InternalServerError, "Unexpected error")
            }
        });

    Ok(())
}

#[post("/logout")]
async fn logout(
    cookie_jar: &CookieJar<'_>,
    mut session_storage: SessionStorage,
) -> Result<(), (Status, &'static str)> {
    let _ = session_storage
        .delete_session(cookie_jar)
        .await
        .map_err(|e| match e {
            _ => {
                eprintln!("Error deleting session");

                (Status::InternalServerError, "Unexpected error")
            }
        });

    Ok(())
}

#[post("/signup")]
async fn signup(
    basic_auth: BasicAuth,
    context: Context,
    cookie_jar: &CookieJar<'_>,
    mut session_storage: SessionStorage,
) -> Result<(), (Status, &'static str)> {
    let (username, password) = basic_auth
        .0
        .ok_or((Status::BadRequest, "Invalid authorization header"))?;

    let user = context
        .users
        .signup_with_basic_auth(&username, &password)
        .await
        .map_err(map_login_error)?;

    let _ = session_storage
        .create_session(&user.id, cookie_jar)
        .await
        .map_err(|e| match e {
            _ => {
                eprintln!("Error creating session");

                (Status::InternalServerError, "Unexpected error")
            }
        });

    Ok(())
}

fn mongodb_connection_uri() -> String {
    match var("MONGODB_CONNECTION_STRING") {
        Ok(value) => {
            println!("MongoDB connection string found");

            value
        }
        Err(_) => {
            println!("No MongoDB connection string found. Will build it instead");

            let username = match var("MONGODB_USERNAME") {
                Ok(username) => username,
                Err(e) => {
                    eprintln!("{}", e);

                    panic!("No MongoDB username set");
                }
            };

            let password = match var("MONGODB_PASSWORD_FILE") {
                Ok(file) => fs::read_to_string(file)
                    .expect("Cannot read password file")
                    .trim()
                    .to_string(),
                Err(e) => {
                    eprintln!("{}", e);

                    panic!("No MongoDB password file set");
                }
            };

            let domain = match var("MONGODB_DOMAIN") {
                Ok(domain) => domain,
                Err(e) => {
                    eprintln!("{}", e);

                    panic!("No MongoDB domain set");
                }
            };

            let database = match var("MONGODB_DATABASE") {
                Ok(database) => database,
                Err(e) => {
                    eprintln!("{}", e);

                    panic!("No MongoDB database set");
                }
            };

            format!(
                "mongodb://{}:{}@{}/{}",
                username, password, domain, database
            )
        }
    }
}

#[launch]
async fn rocket() -> _ {
    dotenv().ok();

    let db_client = mongodb::Client::with_uri_str(mongodb_connection_uri())
        .await
        .unwrap();

    let session_client = redis::Client::open(var("REDIS_CONNECTION_STRING").unwrap()).unwrap();

    build()
        // .attach(cors)
        .manage(session_client)
        .manage(db_client.default_database().unwrap())
        .manage(Schema::new(Query, Mutation, EmptySubscription::new()))
        .mount(
            "/",
            routes![
                get_graphql,
                graphiql,
                health_check,
                login,
                logout,
                playground,
                post_graphql,
                signup,
                login_page,
            ],
        )
}
