FROM rust:latest

RUN apt update

RUN apt install libpq-dev

WORKDIR /usr/src/myapp

COPY . .

RUN cargo install --path .

CMD ["api"]