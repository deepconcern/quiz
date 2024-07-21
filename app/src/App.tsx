import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { QuizTemplatePage } from "./pages/QuizTemplatePage";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: `${import.meta.env.VITE_GRAPHQL_API_URI}/graphql`,
});

const router = createBrowserRouter([
  {
    element: <HomePage/>,
    path: "/",
  },
  {
    element: <QuizTemplatePage/>,
    path: "/quiz-template/:quizTemplateId",
  }
]);

export const App: FC = () => {
  return (
    <ApolloProvider client={client}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ApolloProvider>
  );
};
