-- Your SQL goes here

CREATE TABLE quiz_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

CREATE TABLE questions (
    answer TEXT NOT NULL,
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    quiz_template_id UUID NOT NULL,
    CONSTRAINT fk_quiz_template_id
        FOREIGN KEY(quiz_template_id)
            REFERENCES quiz_templates(id)
);