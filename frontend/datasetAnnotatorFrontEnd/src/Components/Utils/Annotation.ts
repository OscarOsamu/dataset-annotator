import type { Answer, Image, Question } from "../../api";
import { apiConfig } from "../../configuration";

export interface QuestionAnswerRow {
  question: Question;
  answer: Answer | undefined;
  isSkipped: boolean;
}

export type AnswersByImage = Map<number, Map<number, Answer>>;

/** Build the lookup used by annotation navigation and recap rendering. */
export const indexAnswersByImage = (answers: Answer[]): AnswersByImage => {
  const answersByImage: AnswersByImage = new Map();
  for (const answer of answers) {
    let imageAnswers = answersByImage.get(answer.image);
    if (!imageAnswers) {
      imageAnswers = new Map();
      answersByImage.set(answer.image, imageAnswers);
    }
    imageAnswers.set(answer.question, answer);
  }
  return answersByImage;
};

export const updateAnswerIndex = (
  answersByImage: AnswersByImage,
  answer: Answer,
): AnswersByImage => {
  const updatedIndex = new Map(answersByImage);
  const imageAnswers = new Map(updatedIndex.get(answer.image));
  imageAnswers.set(answer.question, answer);
  updatedIndex.set(answer.image, imageAnswers);
  return updatedIndex;
};

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
  const imageAnswers = indexAnswersByImage(answers).get(image.id);

  for (const question of questions) {
    if (skipRemaining) continue;

    const answer = imageAnswers?.get(question.id);
    if (!answer) return question;

    if (answer.is_unclear && question.skip_next_questions_if_null) {
      skipRemaining = true;
    }
  }

  return undefined;
};

export const findNextQuestionInIndex = (
  image: Image,
  questions: Question[],
  answersByImage: AnswersByImage,
) => {
  const imageAnswers = answersByImage.get(image.id);
  let skipRemaining = false;

  for (const question of questions) {
    if (skipRemaining) continue;

    const answer = imageAnswers?.get(question.id);
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
): QuestionAnswerRow[] =>
  getQuestionAnswerRowsFromIndex(questions, indexAnswersByImage(answers), imageId);

export const getQuestionAnswerRowsFromIndex = (
  questions: Question[],
  answersByImage: AnswersByImage,
  imageId: number,
): QuestionAnswerRow[] => {
  const imageAnswers = answersByImage.get(imageId);
  let skipRemaining = false;

  return questions.map((question) => {
    const row = {
      question,
      answer: imageAnswers?.get(question.id),
      isSkipped: skipRemaining,
    };

    if (row.answer?.is_unclear && question.skip_next_questions_if_null) {
      skipRemaining = true;
    }

    return row;
  });
};
