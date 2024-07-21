import { ApolloError, useMutation, useQuery } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ChangeEvent,
  FC,
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Page } from "../components/Page";
import { graphql } from "../gql";
import { QuizTemplate } from "../gql/graphql";

const GET_QUIZ_TEMPLATES_QUERY = graphql(`
  query GetQuizTemplates {
    quizTemplate {
      all {
        id
        name
      }
    }
  }
`);

const CREATE_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation CreateQuizTemplate($input: CreateQuizTemplate!) {
    quizTemplate {
      create(input: $input) {
        id
      }
    }
  }
`);

type CreateQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
};

const CreateQuizTemplateDialog: FC<CreateQuizTemplateDialogProps> = ({
  onClose,
  open,
}) => {
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const [createQuizTemplate] = useMutation(CREATE_QUIZ_TEMPLATE_MUTATION, {
    refetchQueries: [GET_QUIZ_TEMPLATES_QUERY],
  });

  const handleNameChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setName(ev.target.value);
    },
    [setName]
  );

  const handleSubmit = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      const { data } = await createQuizTemplate({
        variables: {
          input: {
            name,
          },
        },
      });

      navigate(`/quiz-template/${data?.quizTemplate.create.id}`);
    },
    [name]
  );

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Create Quiz Template</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="name"
          onChange={handleNameChange}
          value={name}
        />
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained">
          Create
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

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
      <CreateQuizTemplateDialog
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
