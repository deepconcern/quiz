import { useMutation } from "@apollo/client";
import { FC, useCallback } from "react";

import { Question } from "../../gql/graphql";
import { CREATE_QUESTION_MUTATION, GET_QUIZ_TEMPLATE_QUERY } from "../../queries";
import { QuestionDialogBase } from "./QuestionDialogBase";

export type AddQuestionDialogProps = {
  onClose: () => void;
  open: boolean;
  quizTemplateId: string;
};

export const AddQuestionDialog: FC<AddQuestionDialogProps> = ({
  onClose,
  open,
  quizTemplateId,
}) => {
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
    [createQuestion, onClose, quizTemplateId]
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
