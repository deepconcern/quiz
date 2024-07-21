import { useMutation } from "@apollo/client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { FC, FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { DELETE_QUIZ_TEMPLATE_MUTATION } from "../../queries";

export type DeleteQuizTemplateDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplateId: string;
};

export const DeleteQuizTemplateDialog: FC<DeleteQuizTemplateDialogProps> = ({
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
