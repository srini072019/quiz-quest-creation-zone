
import { DifficultyLevel } from "./question.types";

export interface QuestionPoolCondition {
  difficultyLevel?: DifficultyLevel;
  subjectIds?: string[];
  count: number;
}

export interface QuestionPool {
  id: string;
  name: string;
  description: string;
  conditions: QuestionPoolCondition[];
}

export interface ExamWithQuestionPool {
  useQuestionPool: boolean;
  questionPool?: QuestionPool;
}
