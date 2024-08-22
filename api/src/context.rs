use mongodb::Database;
use rocket::{
    http::Status,
    outcome::try_outcome,
    request::{FromRequest, Outcome},
    Request, State,
};

use crate::{
    models::{BaseModel, Questions, QuizTemplates, User, Users},
    session::SessionStorage,
};

pub struct Context {
    pub questions: Questions,
    pub quiz_templates: QuizTemplates,
    pub users: Users,
    pub user: Option<User>,
}

impl juniper::Context for Context {}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Context {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let db: &State<Database> = try_outcome!(request.guard::<&State<mongodb::Database>>().await);

        let users = Users::new(&db);

        let mut session_storage: SessionStorage =
            try_outcome!(request.guard::<SessionStorage>().await);

        let user_id = match session_storage.get_session(request.cookies()).await {
            Ok(user_id) => user_id,
            Err(e) => {
                eprintln!("Error getting session: {:?}", e);

                return Outcome::Error((Status::InternalServerError, ()));
            }
        };

        let user = match user_id {
            Some(id) => match users.read_by_id(&id).await {
                Ok(user) => user,
                Err(e) => {
                    eprintln!("Error reading user: {:?}", e);

                    return Outcome::Error((Status::InternalServerError, ()));
                }
            },
            None => None,
        };

        Outcome::Success(Context {
            questions: Questions::new(&db),
            quiz_templates: QuizTemplates::new(&db),
            user,
            users,
        })
    }
}
