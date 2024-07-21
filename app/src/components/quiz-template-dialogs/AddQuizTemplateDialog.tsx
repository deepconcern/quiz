import { useMutation } from "@apollo/client";
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
import { useNavigate } from "react-router-dom";

import {
  CREATE_QUIZ_TEMPLATE_MUTATION,
  GET_QUIZ_TEMPLATES_QUERY,
} from "../../queries";

export type AddQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
};

export const AddQuizTemplateDialog: FC<AddQuizTemplateDialogProps> = ({
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
    [createQuizTemplate, name, navigate]
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
