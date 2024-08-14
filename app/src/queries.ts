import { graphql } from "./gql";

export const CREATE_QUESTION_MUTATION = graphql(`
  mutation CreateQuestion($input: CreateQuestion!) {
    question {
      create(input: $input) {
        answer
        id
        question
      }
    }
  }
`);

export const CREATE_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation CreateQuizTemplate($input: CreateQuizTemplate!) {
    quizTemplate {
      create(input: $input) {
        id
      }
    }
  }
`);

export const DELETE_QUESTION_MUTATION = graphql(`
  mutation DeleteQuestion($id: ID!) {
    question {
      deleteById(id: $id)
    }
  }
`);

export const DELETE_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation DeleteQuizTemplate($id: ID!) {
    quizTemplate {
      deleteById(id: $id)
    }
  }
`);

export const EDIT_QUESTION_MUTATION = graphql(`
  mutation EditQuestion($id: ID!, $input: EditQuestion!) {
    question {
      edit(id: $id, input: $input)
    }
  }
`);

export const EDIT_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation EditQuizTemplate($id: ID!, $input: EditQuizTemplate!) {
    quizTemplate {
      edit(id: $id, input: $input)
    }
  }
`);

export const GET_QUESTION_QUERY = graphql(`
  query GetQuestion($id: ID!) {
    question {
      byId(id: $id) {
        answer
        id
        question
      }
    }
  }
`);

export const GET_QUIZ_TEMPLATE_QUERY = graphql(`
  query GetQuizTemplate($id: ID!) {
    quizTemplate {
      byId(id: $id) {
        id
        name
        questions {
          answer
          id
          question
        }
      }
    }
  }
`);

export const GET_QUIZ_TEMPLATES_QUERY = graphql(`
  query GetQuizTemplates($userId: ID!) {
    quizTemplate {
      byUserId(userId: $userId) {
        id
        name
      }
    }
  }
`);

export const GET_USER_QUERY = graphql(/* GraphQL */`
  query GetUser {
    user {
      id
      username
    }
  }
`);