import { ApolloError, useMutation, useQuery } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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
import { useParams } from "react-router-dom";

import { AddQuestionDialog, EditQuestionDialog } from "../components/question-dialogs";
import { Page } from "../components/Page";
import { QuizTemplate, User } from "../gql/graphql";
import { DELETE_QUESTION_MUTATION, GET_QUIZ_TEMPLATE_QUERY } from "../queries";
import { DeleteQuizTemplateDialog, EditQuizTemplateDialog } from "../components/quiz-template-dialogs";
import { useError } from "../hooks/useError";
import { useUser } from "../hooks/useUser";

type QuizTemplatePageErrorProps = {
  error: ApolloError | string;
};

const QuizTemplateAnonymous: FC = () => (
  <div>Login to view</div>
);

const QuizTemplatePageError: FC<QuizTemplatePageErrorProps> = ({ error }) => {
  useError(error);

  return <div>ERROR</div>;
};

const QuizTemplatePageLoading: FC = () => (
  <div>LOADING</div>
);

type ModalKey =
  | "add-question"
  | "delete-quiz-template"
  | "edit-question"
  | "edit-quiz-template";

type QuizTemplatePageDataProps = {
  quizTemplate: QuizTemplate;
  user: User;
};

const QuizTemplatePageData: FC<QuizTemplatePageDataProps> = ({
  quizTemplate,
  user,
}) => {
  const [openDialog, setOpenDialog] = useState<ModalKey | null>(null);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);

  const [deleteQuestion] = useMutation(DELETE_QUESTION_MUTATION, {
    refetchQueries: [GET_QUIZ_TEMPLATE_QUERY],
  });

  const handleDialogClose = useCallback(() => {
    setOpenDialog(null);
  }, [setOpenDialog]);

  const handleDialogOpen = useCallback(
    (modalKey: ModalKey) => (ev: MouseEvent<HTMLElement>) => {
      ev.preventDefault();

      setOpenDialog(modalKey);
    },
    [setOpenDialog]
  );

  const handleQuestionDelete = useCallback(
    (questionId: string) => async (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      await deleteQuestion({
        variables: {
          id: questionId,
        },
      });
    },
    [deleteQuestion]
  );

  const handleQuestionEdit = useCallback(
    (questionId: string) => (ev: MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();

      setEditQuestionId(questionId);
      setOpenDialog("edit-question");
    },
    [setOpenDialog, setEditQuestionId]
  );

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography component="p" variant="h5">
            {quizTemplate.name}
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={handleDialogOpen("edit-quiz-template")} size="small">
            Edit
          </Button>
          <Button
            onClick={handleDialogOpen("delete-quiz-template")}
            size="small"
          >
            Delete
          </Button>
        </CardActions>
      </Card>
      <Paper>
        <List>
          {quizTemplate.questions.map((question) => (
            <ListItem
              key={question.id}
              secondaryAction={
                <>
                  <IconButton onClick={handleQuestionEdit(question.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleQuestionDelete(question.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={question.question}
                secondary={question.answer}
              />
            </ListItem>
          ))}
          <ListItemButton onClick={handleDialogOpen("add-question")}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Add new question" />
          </ListItemButton>
        </List>
      </Paper>
      <AddQuestionDialog
        onClose={handleDialogClose}
        open={openDialog === "add-question"}
        quizTemplateId={quizTemplate.id}
      />
      <DeleteQuizTemplateDialog
        onClose={handleDialogClose}
        open={openDialog === "delete-quiz-template"}
        quizTemplateId={quizTemplate.id}
      />
      <EditQuestionDialog
        onClose={handleDialogClose}
        open={openDialog === "edit-question"}
        questionId={editQuestionId}
        quizTemplateId={quizTemplate.id}
      />
      <EditQuizTemplateDialog
        onClose={handleDialogClose}
        open={openDialog === "edit-quiz-template"}
        quizTemplate={quizTemplate}
        user={user}
      />
    </>
  );
};

export const QuizTemplatePage: FC = () => {
  const { quizTemplateId } = useParams<"quizTemplateId">();
  const { data, error, loading } = useQuery(GET_QUIZ_TEMPLATE_QUERY, {
    skip: !quizTemplateId,
    variables: {
      id: quizTemplateId!,
    },
  });

  const { user } = useUser();

  const content = (() => {
    if (!user) return <QuizTemplateAnonymous/>;
    if (error) return <QuizTemplatePageError error={error} />;
    if (!quizTemplateId || loading) return <QuizTemplatePageLoading />;
    if (!data?.quizTemplate.byId)
      return <QuizTemplatePageError error="No data" />;
    return <QuizTemplatePageData quizTemplate={data.quizTemplate.byId} user={user} />;
  })();

  return (
    <Page sx={{ m: 3 }}>
      <Container>
        <Typography component="h2" sx={{ mb: 3 }} variant="h4">
          Quiz Template
        </Typography>
        {content}
      </Container>
    </Page>
  );
};
