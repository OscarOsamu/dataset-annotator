import type { Answer, Image, Question } from "../../api";
import { apiConfig } from "../../configuration";

export interface QuestionAnswerRow {
  question: Question;
  answer: Answer | undefined;
  isSkipped: boolean;
}

export const getImageUrl = (path: string) => {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${apiConfig.basePath}/data/${encodedPath}`;
};

export const formatAnswer = (answer: Answer | undefined) => {
  if (!answer) return "Not answered";
  if (answer.is_unclear) return "Unclear";
  if (answer.answer_integer !== undefined && answer.answer_integer !== null) {
    return String(answer.answer_integer);
  }
  if (Array.isArray(answer.answer_choices)) {
    return answer.answer_choices.map(String).join(", ");
  }
  return "Not answered";
};

export const findNextQuestion = (
  image: Image,
  questions: Question[],
  answers: Answer[],
) => {
  let skipRemaining = false;
  const imageAnswers = new Map(
    answers
      .filter((answer) => answer.image === image.id)
      .map((answer) => [answer.question, answer]),
  );

  for (const question of questions) {
    if (skipRemaining) continue;

    const answer = imageAnswers.get(question.id);
    if (!answer) return question;

    if (answer.is_unclear && question.skip_next_questions_if_null) {
      skipRemaining = true;
    }
  }

  return undefined;
};

export const getQuestionAnswerRows = (
  questions: Question[],
  answers: Answer[],
  imageId: number,
): QuestionAnswerRow[] => {
  const imageAnswers = new Map(
    answers
      .filter((answer) => answer.image === imageId)
      .map((answer) => [answer.question, answer]),
  );
  let skipRemaining = false;

  return questions.map((question) => {
    const row = {
      question,
      answer: imageAnswers.get(question.id),
      isSkipped: skipRemaining,
    };

    if (row.answer?.is_unclear && question.skip_next_questions_if_null) {
      skipRemaining = true;
    }

    return row;
  });
};
