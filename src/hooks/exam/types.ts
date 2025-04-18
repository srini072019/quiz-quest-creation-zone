
import { Exam, ExamFormData } from "@/types/exam.types";

export interface ExamHookResult {
  exams: Exam[];
  isLoading: boolean;
  createExam: (data: ExamFormData) => Promise<boolean>;
  updateExam: (id: string, data: ExamFormData) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;
  publishExam: (id: string) => Promise<boolean>;
  archiveExam: (id: string) => Promise<boolean>;
  fetchExams: () => Promise<void>;
  getExam: (id: string) => Exam | undefined;
  getExamsByCourse: (courseId: string) => Exam[];
}
