
import { useState, useEffect } from "react";
import { Exam, ExamFormData, ExamStatus } from "@/types/exam.types";
import { 
  fetchExamsFromApi, 
  createExamInApi, 
  updateExamInApi, 
  deleteExamInApi,
  updateExamStatusInApi 
} from "./api";
import { ExamHookResult } from "./types";

export const useExams = (courseId?: string, instructorId?: string): ExamHookResult => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const fetchedExams = await fetchExamsFromApi(courseId, instructorId);
      setExams(fetchedExams);
    } finally {
      setIsLoading(false);
    }
  };

  const createExam = async (data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const examId = await createExamInApi(data);
      if (examId) {
        await fetchExams();
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (id: string, data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamInApi(id, data);
      if (success) {
        await fetchExams();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await deleteExamInApi(id);
      if (success) {
        await fetchExams();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const publishExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamStatusInApi(id, ExamStatus.PUBLISHED);
      if (success) {
        await fetchExams();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await updateExamStatusInApi(id, ExamStatus.ARCHIVED);
      if (success) {
        await fetchExams();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [courseId, instructorId]);

  return {
    exams,
    isLoading,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    archiveExam,
    fetchExams,
    getExam: (id: string) => exams.find(exam => exam.id === id),
    getExamsByCourse: (courseId: string) => exams.filter(exam => exam.courseId === courseId),
  };
};
