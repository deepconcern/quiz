import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client";
import CssBaseline from "@mui/material/CssBaseline";
import { FC } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { QuizTemplatePage } from "./pages/QuizTemplatePage";
import { UserProvider } from "./contexts/user";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    uri: "/graphql",
  }),
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
      <UserProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </UserProvider>
    </ApolloProvider>
  );
};
