/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateQuestion = {
  answer: Scalars['String']['input'];
  question: Scalars['String']['input'];
  quizTemplateId: Scalars['String']['input'];
};

export type CreateQuizTemplate = {
  name: Scalars['String']['input'];
};

export type EditQuestion = {
  answer: Scalars['String']['input'];
  question: Scalars['String']['input'];
  quizTemplateId: Scalars['String']['input'];
};

export type EditQuizTemplate = {
  name: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  question: QuestionMutation;
  quizTemplate: QuizTemplateMutation;
};

export type Query = {
  __typename?: 'Query';
  apiVersion: Scalars['String']['output'];
  question: QuestionQuery;
  quizTemplate: QuizTemplateQuery;
};

export type Question = {
  __typename?: 'Question';
  answer: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  question: Scalars['String']['output'];
};

export type QuestionMutation = {
  __typename?: 'QuestionMutation';
  create: Question;
  deleteById: Scalars['Boolean']['output'];
  edit: Question;
};


export type QuestionMutationCreateArgs = {
  input: CreateQuestion;
};


export type QuestionMutationDeleteByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QuestionMutationEditArgs = {
  id: Scalars['ID']['input'];
  input: EditQuestion;
};

export type QuestionQuery = {
  __typename?: 'QuestionQuery';
  all: Array<Question>;
  byId?: Maybe<Question>;
};


export type QuestionQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QuizTemplate = {
  __typename?: 'QuizTemplate';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  questions: Array<Question>;
};

export type QuizTemplateMutation = {
  __typename?: 'QuizTemplateMutation';
  create: QuizTemplate;
  deleteById: Scalars['Boolean']['output'];
  edit: QuizTemplate;
};


export type QuizTemplateMutationCreateArgs = {
  input: CreateQuizTemplate;
};


export type QuizTemplateMutationDeleteByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QuizTemplateMutationEditArgs = {
  id: Scalars['ID']['input'];
  input: EditQuizTemplate;
};

export type QuizTemplateQuery = {
  __typename?: 'QuizTemplateQuery';
  all: Array<QuizTemplate>;
  byId?: Maybe<QuizTemplate>;
};


export type QuizTemplateQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type GetQuizTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuizTemplatesQuery = { __typename?: 'Query', quizTemplate: { __typename?: 'QuizTemplateQuery', all: Array<{ __typename?: 'QuizTemplate', id: string, name: string }> } };

export type CreateQuizTemplateMutationVariables = Exact<{
  input: CreateQuizTemplate;
}>;


export type CreateQuizTemplateMutation = { __typename?: 'Mutation', quizTemplate: { __typename?: 'QuizTemplateMutation', create: { __typename?: 'QuizTemplate', id: string } } };

export type CreateQuestionMutationVariables = Exact<{
  input: CreateQuestion;
}>;


export type CreateQuestionMutation = { __typename?: 'Mutation', question: { __typename?: 'QuestionMutation', create: { __typename?: 'Question', answer: string, id: string, question: string } } };

export type DeleteQuestionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', question: { __typename?: 'QuestionMutation', deleteById: boolean } };

export type DeleteQuizTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteQuizTemplateMutation = { __typename?: 'Mutation', quizTemplate: { __typename?: 'QuizTemplateMutation', deleteById: boolean } };

export type EditQuestionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: EditQuestion;
}>;


export type EditQuestionMutation = { __typename?: 'Mutation', question: { __typename?: 'QuestionMutation', edit: { __typename?: 'Question', answer: string, id: string, question: string } } };

export type EditQuizTemplateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: EditQuizTemplate;
}>;


export type EditQuizTemplateMutation = { __typename?: 'Mutation', quizTemplate: { __typename?: 'QuizTemplateMutation', edit: { __typename?: 'QuizTemplate', id: string, name: string, questions: Array<{ __typename?: 'Question', answer: string, id: string, question: string }> } } };

export type GetQuestionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetQuestionQuery = { __typename?: 'Query', question: { __typename?: 'QuestionQuery', byId?: { __typename?: 'Question', answer: string, id: string, question: string } | null } };

export type GetQuizTemplateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetQuizTemplateQuery = { __typename?: 'Query', quizTemplate: { __typename?: 'QuizTemplateQuery', byId?: { __typename?: 'QuizTemplate', id: string, name: string, questions: Array<{ __typename?: 'Question', answer: string, id: string, question: string }> } | null } };


export const GetQuizTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuizTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetQuizTemplatesQuery, GetQuizTemplatesQueryVariables>;
export const CreateQuizTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuizTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuizTemplate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateQuizTemplateMutation, CreateQuizTemplateMutationVariables>;
export const CreateQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateQuestion"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}}]}}]}}]}}]} as unknown as DocumentNode<CreateQuestionMutation, CreateQuestionMutationVariables>;
export const DeleteQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]}}]} as unknown as DocumentNode<DeleteQuestionMutation, DeleteQuestionMutationVariables>;
export const DeleteQuizTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteQuizTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]}}]} as unknown as DocumentNode<DeleteQuizTemplateMutation, DeleteQuizTemplateMutationVariables>;
export const EditQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditQuestion"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}}]}}]}}]}}]} as unknown as DocumentNode<EditQuestionMutation, EditQuestionMutationVariables>;
export const EditQuizTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditQuizTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EditQuizTemplate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}}]}}]}}]}}]}}]} as unknown as DocumentNode<EditQuizTemplateMutation, EditQuizTemplateMutationVariables>;
export const GetQuestionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuestion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"question"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}}]}}]}}]}}]} as unknown as DocumentNode<GetQuestionQuery, GetQuestionQueryVariables>;
export const GetQuizTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuizTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"question"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetQuizTemplateQuery, GetQuizTemplateQueryVariables>;