use std::fmt::Display;

use rand::{seq::IteratorRandom, thread_rng, SeedableRng};
use rand_chacha::ChaCha20Rng;
use redis::{aio::MultiplexedConnection, AsyncCommands, RedisError};
use rocket::{
    http::{Cookie, CookieJar, Status},
    outcome::try_outcome,
    request::{FromRequest, Outcome},
    Request, State,
};

const CHOICES: &'static str = "abcdefghijklmnopqrstuvwxyz0123456789";

const FIFTEEN_DAYS: u64 = 60 * 60 * 24 * 15;

const SESSION_COOKIE: &'static str = "quiz_session";

pub struct SessionStorage {
    connection: MultiplexedConnection,
}

#[derive(Debug)]
pub enum SessionError {
    Build,
    Rand(rand::Error),
    Redis(RedisError),
}

impl Display for SessionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Build => write!(f, "Unable to build session"),
            Self::Rand(error) => error.fmt(f),
            Self::Redis(error) => error.fmt(f),
        }
    }
}

impl From<rand::Error> for SessionError {
    fn from(value: rand::Error) -> Self {
        Self::Rand(value)
    }
}

impl From<RedisError> for SessionError {
    fn from(value: RedisError) -> Self {
        Self::Redis(value)
    }
}

impl SessionStorage {
    pub fn new(connection: MultiplexedConnection) -> Self {
        Self { connection }
    }

    fn get_session_id(&self, cookie_jar: &CookieJar<'_>) -> Option<String> {
        cookie_jar.get_private(SESSION_COOKIE).map(|c| c.value_trimmed().to_string())
    }

    pub async fn get_session(
        &mut self,
        cookie_jar: &CookieJar<'_>,
    ) -> Result<Option<String>, SessionError> {
        let Some(session_id) = self.get_session_id(cookie_jar) else {
            return Ok(None);
        };

        println!("DEBUG: session_id = {:?}", session_id);

        let user_id: Option<String> = self.connection.get(session_id).await?;

        Ok(user_id)
    }

    pub async fn delete_session(
        &mut self,
        cookie_jar: &CookieJar<'_>,
    ) -> Result<usize, SessionError> {
        let Some(session_id) = self.get_session_id(cookie_jar) else {
            return Ok(0);
        };

        cookie_jar.remove_private(SESSION_COOKIE);

        let delete_count: usize = self.connection.del(session_id).await?;

        Ok(delete_count)
    }

    pub async fn create_session(
        &mut self,
        user_id: &str,
        cookie_jar: &CookieJar<'_>,
    ) -> Result<(), SessionError> {
        let mut max_retries = 100;
        let mut session_id = String::from("session:");

        let session_id_length = session_id.len() + 8;

        let mut rng = ChaCha20Rng::from_rng(thread_rng())?;

        loop {
            while session_id.len() < session_id_length {
                match CHOICES.chars().choose(&mut rng) {
                    Some(c) => session_id.push(c),
                    None => {
                        eprintln!("Invalid state: Unable to generate random session ID");

                        return Err(SessionError::Build);
                    }
                }
            }

            let exists: bool = self.connection.exists(&session_id).await?;

            if exists {
                max_retries -= 1;

                if max_retries < 1 {
                    eprintln!("Cannot find random session ID");

                    return Err(SessionError::Build);
                }

                continue;
            }

            break;
        }

        let _: () = self.connection.set_ex(&session_id, user_id, FIFTEEN_DAYS).await?;

        cookie_jar.remove_private(SESSION_COOKIE);
        cookie_jar.add_private(
            Cookie::build((SESSION_COOKIE, session_id))
                .http_only(true)
                .secure(true),
        );

        Ok(())
    }
}   

#[rocket::async_trait]
impl<'r> FromRequest<'r> for SessionStorage {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let session_client: &State<redis::Client> =
            try_outcome!(request.guard::<&State<redis::Client>>().await);

        let session_connection = match session_client.get_multiplexed_async_connection().await {
            Ok(s) => s,
            Err(_) => return Outcome::Error((Status::InternalServerError, ())),
        };

        Outcome::Success(Self::new(session_connection))
    }
}
