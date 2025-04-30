import type {
  Gsm8k,
  Bbh,
  Hotpotqa,
  Longbench,
  Math,
  Mmlu,
} from "@/interfaces/datasets";

export type QuestionData = Gsm8k | Bbh | Hotpotqa | Longbench | Math | Mmlu;

export function getQuestionText(data: QuestionData): string {
  if ("question" in data) return data.question;
  if ("input" in data) return data.input;
  if ("problem" in data) return data.problem;
  if ("Question" in data) return data.Question;
  return "Unknown question format";
}

export function getAnswerText(data: QuestionData): string {
  if ("answer" in data) return data.answer;
  if ("target" in data) return data.target;
  if ("answers" in data) return data.answers.join(", ");
  if ("Answer" in data) return data.Answer;
  if ("solution" in data) return data.solution;
  return "Answer not available";
}

export function getIndex(data: QuestionData): number {
  return "idx" in data ? data.idx : -1;
}
