import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useState,
} from "react";

import { Question } from "../../gql/graphql";

export type QuestionDialogBaseProps = {
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (question: Omit<Question, "id">) => void;
  open: boolean;
  defaultValues?: Omit<Question, "id"> | null;
};

export const QuestionDialogBase: FC<QuestionDialogBaseProps> = ({
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
