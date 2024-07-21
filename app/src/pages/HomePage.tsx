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
  useEffect,
  useState,
} from "react";
import { Link as RouterLink } from "react-router-dom";

import { Page } from "../components/Page";
import { QuizTemplate } from "../gql/graphql";
import { GET_QUIZ_TEMPLATES_QUERY } from "../queries";
import { AddQuizTemplateDialog } from "../components/quiz-template-dialogs";

type HomePageErrorProps = {
  error: ApolloError | string;
};

const HomePageError: FC<HomePageErrorProps> = ({ error }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <div>ERROR</div>;
};

const HomePageLoading: FC = () => {
  return <div>LOADING</div>;
};

type HomePageDataProps = {
  quizTemplates: Omit<QuizTemplate, "questions">[];
};

const HomePageData: FC<HomePageDataProps> = ({ quizTemplates }) => {
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
      />
    </>
  );
};

export const HomePage: FC = () => {
  const { data, error, loading } = useQuery(GET_QUIZ_TEMPLATES_QUERY);

  const content = (() => {
    if (error) return <HomePageError error={error} />;
    if (loading) return <HomePageLoading />;
    if (!data) return <HomePageError error="No data" />;
    return <HomePageData quizTemplates={data.quizTemplate.all} />;
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
