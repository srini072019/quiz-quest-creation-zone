
import { useState } from "react";
import { toast } from "sonner";
import { Exam, ExamFormData, ExamStatus } from "@/types/exam.types";

// Mock data for now - will be replaced with Supabase integration
const mockExams: Exam[] = [
  {
    id: "exam-1",
    title: "Introduction to Programming Midterm",
    description: "Test your knowledge of programming fundamentals",
    courseId: "course-1",
    instructorId: "instructor-1",
    timeLimit: 60,
    passingScore: 70,
    shuffleQuestions: true,
    status: ExamStatus.PUBLISHED,
    questions: ["question-1", "question-2"],
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-03-20"),
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-04-10"),
  },
  {
    id: "exam-2",
    title: "Advanced Math Quiz",
    description: "Test your knowledge of advanced mathematical concepts",
    courseId: "course-2",
    instructorId: "instructor-2",
    timeLimit: 45,
    passingScore: 60,
    shuffleQuestions: false,
    status: ExamStatus.DRAFT,
    questions: ["question-3"],
    createdAt: new Date("2025-03-22"),
    updatedAt: new Date("2025-03-22"),
  }
];

export const useExams = (courseId?: string, instructorId?: string) => {
  const [exams, setExams] = useState<Exam[]>(
    mockExams.filter(exam => 
      (!courseId || exam.courseId === courseId) && 
      (!instructorId || exam.instructorId === instructorId)
    )
  );
  const [isLoading, setIsLoading] = useState(false);

  const createExam = async (data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        ...data,
        instructorId: instructorId || "current-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setExams([...exams, newExam]);
      toast.success("Exam created successfully");
      return true;
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (id: string, data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const updatedExams = exams.map(exam => 
        exam.id === id 
          ? { ...exam, ...data, updatedAt: new Date() } 
          : exam
      );
      
      setExams(updatedExams);
      toast.success("Exam updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Failed to update exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const filteredExams = exams.filter(exam => exam.id !== id);
      setExams(filteredExams);
      toast.success("Exam deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const publishExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const updatedExams = exams.map(exam => 
        exam.id === id 
          ? { ...exam, status: ExamStatus.PUBLISHED, updatedAt: new Date() } 
          : exam
      );
      
      setExams(updatedExams);
      toast.success("Exam published successfully");
      return true;
    } catch (error) {
      console.error("Error publishing exam:", error);
      toast.error("Failed to publish exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveExam = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with Supabase
      const updatedExams = exams.map(exam => 
        exam.id === id 
          ? { ...exam, status: ExamStatus.ARCHIVED, updatedAt: new Date() } 
          : exam
      );
      
      setExams(updatedExams);
      toast.success("Exam archived successfully");
      return true;
    } catch (error) {
      console.error("Error archiving exam:", error);
      toast.error("Failed to archive exam");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getExam = (id: string): Exam | undefined => {
    return exams.find(exam => exam.id === id);
  };

  const getExamsByCourse = (courseId: string): Exam[] => {
    return exams.filter(exam => exam.courseId === courseId);
  };

  return {
    exams,
    isLoading,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    archiveExam,
    getExam,
    getExamsByCourse,
  };
};
