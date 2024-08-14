use std::{
    fmt::Display,
    str::{from_utf8, Utf8Error},
};

use base64::prelude::*;
use lazy_static::lazy_static;
use regex::Regex;
use rocket::{
    http::Status,
    request::{FromRequest, Outcome, Request},
};

lazy_static! {
    static ref BASIC_AUTH_REGEX: Regex = Regex::new(r"^Basic (?P<token>.*$)").unwrap();
}

#[derive(Debug)]
pub enum BasicAuthError {
    Base64DecodeError(base64::DecodeError),
    InvalidTokenError,
    Utf8Error(Utf8Error),
}

impl Display for BasicAuthError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Base64DecodeError(error) => error.fmt(f),
            Self::InvalidTokenError => write!(f, "Invalid Basic Auth token"),
            Self::Utf8Error(error) => error.fmt(f),
        }
    }
}

impl From<base64::DecodeError> for BasicAuthError {
    fn from(value: base64::DecodeError) -> Self {
        Self::Base64DecodeError(value)
    }
}

impl From<Utf8Error> for BasicAuthError {
    fn from(value: Utf8Error) -> Self {
        Self::Utf8Error(value)
    }
}

#[derive(Clone, Debug)]
pub struct BasicAuth(pub Option<(String, String)>);

impl BasicAuth {
    fn get_info_from_token(token: &str) -> Result<(String, String), BasicAuthError> {
        let decoded_token_bytes = BASE64_STANDARD.decode(token)?;
        let decoded_token = from_utf8(&decoded_token_bytes)?;

        let parts = decoded_token.split(":").collect::<Vec<&str>>();

        if parts.len() != 2 {
            Err(BasicAuthError::InvalidTokenError)
        } else {
            Ok((parts[0].to_string(), parts[1].to_string()))
        }
    }
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for BasicAuth {
    type Error = BasicAuthError;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let Some(header_value) = request.headers().get_one("Authorization") else {
            return Outcome::Success(BasicAuth(None));
        };

        let Some(caps) = BASIC_AUTH_REGEX.captures(header_value) else {
            return Outcome::Success(BasicAuth(None));
        };

        let token = &caps["token"];

        match BasicAuth::get_info_from_token(token) {
            Ok(parts) => Outcome::Success(BasicAuth(Some(parts))),
            Err(error) => Outcome::Error((Status::BadRequest, error)),
        }
    }
}
