import { useMutation } from "@apollo/client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { ChangeEvent, FC, FormEvent, useCallback, useState } from "react";

import { QuizTemplate, User } from "../../gql/graphql";
import {
  EDIT_QUIZ_TEMPLATE_MUTATION,
  GET_QUIZ_TEMPLATE_QUERY,
} from "../../queries";

export type EditQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplate: QuizTemplate;
  user: User;
};

export const EditQuizTemplateDialog: FC<EditQuizTemplateDialogProps> = ({
  onClose,
  open,
  quizTemplate,
  user,
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
            userId: user.id,
          },
        },
      });

      onClose();
    },
    [editQuizTemplate, name, onClose, quizTemplate.id, user]
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
