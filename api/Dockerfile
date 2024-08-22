# Base stage

FROM rust AS chef

RUN cargo install cargo-chef

WORKDIR /usr/src/myapp

# Stage 1 - planner

FROM chef AS planner

COPY . .

RUN cargo chef prepare --recipe-path recipe.json

# Stage 2 - builder

FROM chef AS builder

COPY --from=planner /usr/src/myapp/recipe.json recipe.json

COPY . .

RUN cargo build --release

# Stage 3 - run

FROM ubuntu AS run

WORKDIR /usr/src/myapp

COPY --from=builder /usr/src/myapp/target/release/api .

CMD ["/usr/src/myapp/api"]