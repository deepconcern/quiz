/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetQuizTemplates {\n    quizTemplate {\n      all {\n        id\n        name\n      }\n    }\n  }\n": types.GetQuizTemplatesDocument,
    "\n  mutation CreateQuizTemplate($input: CreateQuizTemplate!) {\n    quizTemplate {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n": types.CreateQuizTemplateDocument,
    "\n  mutation CreateQuestion($input: CreateQuestion!) {\n    question {\n      create(input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n": types.CreateQuestionDocument,
    "\n  mutation DeleteQuestion($id: ID!) {\n    question {\n      deleteById(id: $id)\n    }\n  }\n": types.DeleteQuestionDocument,
    "\n  mutation DeleteQuizTemplate($id: ID!) {\n    quizTemplate {\n      deleteById(id: $id)\n    }\n  }\n": types.DeleteQuizTemplateDocument,
    "\n  mutation EditQuestion($id: ID!, $input: EditQuestion!) {\n    question {\n      edit(id: $id, input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n": types.EditQuestionDocument,
    "\n  mutation EditQuizTemplate($id: ID!, $input: EditQuizTemplate!) {\n    quizTemplate {\n      edit(id: $id, input: $input) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n": types.EditQuizTemplateDocument,
    "\n  query GetQuestion($id: ID!) {\n    question {\n      byId(id: $id) {\n        answer\n        id\n        question\n      }\n    }\n  }\n": types.GetQuestionDocument,
    "\n  query GetQuizTemplate($id: ID!) {\n    quizTemplate {\n      byId(id: $id) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n": types.GetQuizTemplateDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetQuizTemplates {\n    quizTemplate {\n      all {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetQuizTemplates {\n    quizTemplate {\n      all {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateQuizTemplate($input: CreateQuizTemplate!) {\n    quizTemplate {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateQuizTemplate($input: CreateQuizTemplate!) {\n    quizTemplate {\n      create(input: $input) {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateQuestion($input: CreateQuestion!) {\n    question {\n      create(input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateQuestion($input: CreateQuestion!) {\n    question {\n      create(input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteQuestion($id: ID!) {\n    question {\n      deleteById(id: $id)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteQuestion($id: ID!) {\n    question {\n      deleteById(id: $id)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteQuizTemplate($id: ID!) {\n    quizTemplate {\n      deleteById(id: $id)\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteQuizTemplate($id: ID!) {\n    quizTemplate {\n      deleteById(id: $id)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EditQuestion($id: ID!, $input: EditQuestion!) {\n    question {\n      edit(id: $id, input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation EditQuestion($id: ID!, $input: EditQuestion!) {\n    question {\n      edit(id: $id, input: $input) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EditQuizTemplate($id: ID!, $input: EditQuizTemplate!) {\n    quizTemplate {\n      edit(id: $id, input: $input) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation EditQuizTemplate($id: ID!, $input: EditQuizTemplate!) {\n    quizTemplate {\n      edit(id: $id, input: $input) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetQuestion($id: ID!) {\n    question {\n      byId(id: $id) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetQuestion($id: ID!) {\n    question {\n      byId(id: $id) {\n        answer\n        id\n        question\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetQuizTemplate($id: ID!) {\n    quizTemplate {\n      byId(id: $id) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetQuizTemplate($id: ID!) {\n    quizTemplate {\n      byId(id: $id) {\n        id\n        name\n        questions {\n          answer\n          id\n          question\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;