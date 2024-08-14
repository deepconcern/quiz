import { ApolloError, useQuery } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  FC,
  MouseEvent,
  useCallback,
  useState,
} from "react";
import { Link as RouterLink } from "react-router-dom";

import { Page } from "../components/Page";
import { QuizTemplate, User } from "../gql/graphql";
import { GET_QUIZ_TEMPLATES_QUERY } from "../queries";
import { AddQuizTemplateDialog } from "../components/quiz-template-dialogs";
import { useError } from "../hooks/useError";
import { useUser } from "../hooks/useUser";

type HomePageErrorProps = {
  error: ApolloError | string;
};

const HomePageAnonymous: FC = () => (
  <div>Login to create quizzes</div>
);

const HomePageError: FC<HomePageErrorProps> = ({ error }) => {
  useError(error);

  return <div>ERROR</div>;
};

const HomePageLoading: FC = () => (
  <div>LOADING</div>
);

type HomePageDataProps = {
  quizTemplates: Omit<QuizTemplate, "questions">[];
  user: User;
};

const HomePageData: FC<HomePageDataProps> = ({ quizTemplates, user }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);

  const handleDialogOpen = useCallback(
    (ev: MouseEvent<HTMLElement>) => {
      ev.preventDefault();

      setDialogOpen(true);
    },
    [setDialogOpen]
  );

  return (
    <>
      <Paper>
        <List>
          {quizTemplates.map((quizTemplate) => (
            <ListItemButton
              component={RouterLink}
              key={quizTemplate.id}
              to={`/quiz-template/${quizTemplate.id}`}
            >
              <ListItemText primary={quizTemplate.name} />
            </ListItemButton>
          ))}
          <ListItemButton onClick={handleDialogOpen}>
            <ListItemIcon>
              <AddIcon/>
            </ListItemIcon>
            <ListItemText primary="Add new quiz template" />
          </ListItemButton>
        </List>
      </Paper>
      <AddQuizTemplateDialog
        onClose={handleDialogClose}
        open={isDialogOpen}
        user={user}
      />
    </>
  );
};

export const HomePage: FC = () => {
  const { user } = useUser();

  const { data, error, loading } = useQuery(GET_QUIZ_TEMPLATES_QUERY, {
    skip: !user,
    variables: {
      userId: user?.id || "",
    },
  });

  const content = (() => {
    if (!user) return <HomePageAnonymous />;
    if (error) return <HomePageError error={error} />;
    if (loading) return <HomePageLoading />;
    if (!data) return <HomePageError error="Unexpected error: No data" />;
    return <HomePageData quizTemplates={data.quizTemplate.byUserId} user={user} />;
  })();

  return (
    <Page sx={{ m: 3 }}>
      <Container>
        <Typography component="h2" sx={{ mb: 3 }} variant="h4">
          Quiz Templates
        </Typography>
        {content}
      </Container>
    </Page>
  );
};
