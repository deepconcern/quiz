// @generated automatically by Diesel CLI.

diesel::table! {
    questions (id) {
        answer -> Text,
        id -> Uuid,
        question -> Text,
        quiz_template_id -> Uuid,
    }
}

diesel::table! {
    quiz_templates (id) {
        id -> Uuid,
        name -> Text,
    }
}

diesel::joinable!(questions -> quiz_templates (quiz_template_id));

diesel::allow_tables_to_appear_in_same_query!(
    questions,
    quiz_templates,
);
