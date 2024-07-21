import { useMutation, useQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import {
  FC,
  useCallback,
  useEffect,
} from "react";

import { Question } from "../../gql/graphql";
import { EDIT_QUESTION_MUTATION, GET_QUESTION_QUERY, GET_QUIZ_TEMPLATE_QUERY } from "../../queries";
import { QuestionDialogBase } from "./QuestionDialogBase";

export type EditQuestionDialogProps = {
  defaultValues?: Omit<Question, "id"> | null;
  onClose: () => void;
  open: boolean;
  questionId?: string | null;
  quizTemplateId: string;
};

export const EditQuestionDialog: FC<EditQuestionDialogProps> = ({
  onClose,
  open,
  questionId,
  quizTemplateId,
}) => {
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
    [data, editQuestion, onClose, questionId, quizTemplateId]
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
