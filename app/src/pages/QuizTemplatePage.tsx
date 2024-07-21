import { ApolloError, useMutation, useQuery } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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
import { useNavigate, useParams } from "react-router-dom";

import { Page } from "../components/Page";
import { graphql } from "../gql";
import { Question, QuizTemplate } from "../gql/graphql";

const CREATE_QUESTION_MUTATION = graphql(`
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

const DELETE_QUESTION_MUTATION = graphql(`
  mutation DeleteQuestion($id: ID!) {
    question {
      deleteById(id: $id)
    }
  }
`);

const DELETE_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation DeleteQuizTemplate($id: ID!) {
    quizTemplate {
      deleteById(id: $id)
    }
  }
`);

const EDIT_QUESTION_MUTATION = graphql(`
  mutation EditQuestion($id: ID!, $input: EditQuestion!) {
    question {
      edit(id: $id, input: $input) {
        answer
        id
        question
      }
    }
  }
`);

const EDIT_QUIZ_TEMPLATE_MUTATION = graphql(`
  mutation EditQuizTemplate($id: ID!, $input: EditQuizTemplate!) {
    quizTemplate {
      edit(id: $id, input: $input) {
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

const GET_QUESTION_QUERY = graphql(`
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

const GET_QUIZ_TEMPLATE_QUERY = graphql(`
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

type QuizTemplatePageErrorProps = {
  error: ApolloError | string;
};

const QuizTemplatePageError: FC<QuizTemplatePageErrorProps> = ({ error }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <div>ERROR</div>;
};

const QuizTemplatePageLoading: FC = () => {
  return <div>LOADING</div>;
};

type QuestionDialogBaseProps = {
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (question: Omit<Question, "id">) => void;
  open: boolean;
  defaultValues?: Omit<Question, "id"> | null;
};

const QuestionDialogBase: FC<QuestionDialogBaseProps> = ({
  defaultValues,
  mode,
  onClose,
  onSubmit,
  open,
}) => {
  const [answer, setAnswer] = useState(defaultValues?.answer || "");
  const [question, setQuestion] = useState(defaultValues?.question || "");

  const handleAnswerChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setAnswer(ev.target.value);
    },
    [setAnswer]
  );

  const handleQuestionChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setQuestion(ev.target.value);
    },
    [setQuestion]
  );

  const handleSubmit = useCallback(
    (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      onSubmit({
        answer,
        question,
      });
    },
    [answer, onSubmit, question]
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
      <DialogTitle>{mode === "add" ? "Add" : "Edit"} Question</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          onChange={handleQuestionChange}
          sx={{ mb: 3 }}
          value={question}
        />
        <TextField
          fullWidth
          label="Answer"
          onChange={handleAnswerChange}
          value={answer}
        />
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained">
          Confirm
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

type AddQuestionDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplateId: string;
};

const AddQuestionDialog: FC<AddQuestionDialogProps> = ({
  onClose,
  open,
  quizTemplateId,
}) => {
  const navigate = useNavigate();

  const [createQuestion] = useMutation(CREATE_QUESTION_MUTATION, {
    refetchQueries: [GET_QUIZ_TEMPLATE_QUERY],
  });

  const handleSubmit = useCallback(
    async (question: Omit<Question, "id">) => {
      await createQuestion({
        variables: {
          input: {
            ...question,
            quizTemplateId,
          },
        },
      });

      onClose();
    },
    [createQuestion, navigate, onClose]
  );

  return (
    <QuestionDialogBase
      mode="add"
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
    />
  );
};

type EditQuestionDialogProps = {
  defaultValues?: Omit<Question, "id"> | null;
  onClose: () => void;
  open: boolean;
  questionId?: string | null;
  quizTemplateId: string;
};

const EditQuestionDialog: FC<EditQuestionDialogProps> = ({
  onClose,
  open,
  questionId,
  quizTemplateId,
}) => {
  const navigate = useNavigate();

  const { data, error, loading } = useQuery(GET_QUESTION_QUERY, {
    skip: !questionId,
    variables: {
      id: questionId!,
    },
  });

  const [editQuestion] = useMutation(EDIT_QUESTION_MUTATION, {
    refetchQueries: [GET_QUIZ_TEMPLATE_QUERY],
  });

  const handleSubmit = useCallback(
    async (question: Omit<Question, "id">) => {
      if (!data || !questionId) return;

      await editQuestion({
        variables: {
          id: questionId,
          input: {
            ...question,
            quizTemplateId,
          },
        },
      });

      onClose();
    },
    [data, editQuestion, navigate, onClose, questionId]
  );

  useEffect(() => {
    if (error) console.error(error);
    onClose();
  }, [error, onClose]);

  if (loading)
    return (
      <Dialog onClose={onClose} open={open}>
        <CircularProgress />
      </Dialog>
    );

  if (!data) return null;

  return (
    <QuestionDialogBase
      defaultValues={data?.question.byId}
      mode="edit"
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
    />
  );
};

type DeleteQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplateId: string;
};

const DeleteQuizTemplateDialog: FC<DeleteQuizTemplateDialogProps> = ({
  onClose,
  open,
  quizTemplateId,
}) => {
  const [deleteQuizTemplate] = useMutation(DELETE_QUIZ_TEMPLATE_MUTATION);

  const navigate = useNavigate();

  const handleDelete = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      await deleteQuizTemplate({
        variables: {
          id: quizTemplateId,
        },
      });

      navigate("/");
    },
    [deleteQuizTemplate, navigate, quizTemplateId]
  );

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
        component: "form",
        onSubmit: handleDelete,
      }}
    >
      <DialogTitle>Delete Quiz Template</DialogTitle>
      <DialogContent>
        This will delete the quiz template and all created questions.
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained">
          Confirm
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

type EditQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplate: QuizTemplate;
};

const EditQuizTemplateDialog: FC<EditQuizTemplateDialogProps> = ({
  onClose,
  open,
  quizTemplate,
}) => {
  const [name, setName] = useState(quizTemplate.name);

  const [editQuizTemplate] = useMutation(EDIT_QUIZ_TEMPLATE_MUTATION, {
    refetchQueries: [GET_QUIZ_TEMPLATE_QUERY],
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

      await editQuizTemplate({
        variables: {
          id: quizTemplate.id,
          input: {
            name,
          },
        },
      });

      onClose();
    },
    [name, onClose]
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
      <DialogTitle>Edit Quiz Template</DialogTitle>
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
          Confirm
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

type ModalKey =
  | "add-question"
  | "delete-quiz-template"
  | "edit-question"
  | "edit-quiz-template";

type QuizTemplatePageDataProps = {
  quizTemplate: QuizTemplate;
};

const QuizTemplatePageData: FC<QuizTemplatePageDataProps> = ({
  quizTemplate,
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
          <Button
            onClick={handleDialogOpen("edit-quiz-template")}
            size="small"
          >
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

  const content = (() => {
    if (error) return <QuizTemplatePageError error={error} />;
    if (!quizTemplateId || loading) return <QuizTemplatePageLoading />;
    if (!data?.quizTemplate.byId)
      return <QuizTemplatePageError error="No data" />;
    return <QuizTemplatePageData quizTemplate={data.quizTemplate.byId} />;
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
