
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Exam, ExamFormData, ExamStatus } from "@/types/exam.types";
import { supabase } from "@/integrations/supabase/client";

export const useExams = (courseId?: string, instructorId?: string) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('exams')
        .select('*, exam_questions(question_id, order_number)');
      
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      if (instructorId) {
        query = query.eq('instructor_id', instructorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const transformedExams: Exam[] = data.map(exam => ({
        id: exam.id,
        title: exam.title,
        description: exam.description || "",
        courseId: exam.course_id,
        instructorId: exam.instructor_id,
        timeLimit: exam.time_limit,
        passingScore: exam.passing_score,
        shuffleQuestions: exam.shuffle_questions,
        status: exam.status as ExamStatus,
        questions: exam.exam_questions?.map(eq => eq.question_id) || [],
        createdAt: new Date(exam.created_at),
        updatedAt: new Date(exam.updated_at),
        startDate: exam.start_date ? new Date(exam.start_date) : undefined,
        endDate: exam.end_date ? new Date(exam.end_date) : undefined,
      }));
      
      setExams(transformedExams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setIsLoading(false);
    }
  };

  const createExam = async (data: ExamFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Insert exam record
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          title: data.title,
          description: data.description,
          course_id: data.courseId,
          instructor_id: await supabase.auth.getUser().then(res => res.data.user?.id),
          time_limit: data.timeLimit,
          passing_score: data.passingScore,
          shuffle_questions: data.shuffleQuestions,
          status: data.status,
          start_date: data.startDate ? data.startDate.toISOString() : null,
          end_date: data.endDate ? data.endDate.toISOString() : null,
        })
        .select()
        .single();

      if (examError) throw examError;
      
      // Insert question associations
      if (data.questions.length > 0) {
        const examQuestions = data.questions.map((questionId, index) => ({
          exam_id: examData.id,
          question_id: questionId,
          order_number: index + 1,
        }));
        
        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(examQuestions);
          
        if (questionsError) throw questionsError;
      }
      
      await fetchExams();
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
      // Update exam record
      const { error: examError } = await supabase
        .from('exams')
        .update({
          title: data.title,
          description: data.description,
          course_id: data.courseId,
          time_limit: data.timeLimit,
          passing_score: data.passingScore,
          shuffle_questions: data.shuffleQuestions,
          status: data.status,
          start_date: data.startDate ? data.startDate.toISOString() : null,
          end_date: data.endDate ? data.endDate.toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (examError) throw examError;
      
      // Delete all existing question associations
      const { error: deleteError } = await supabase
        .from('exam_questions')
        .delete()
        .eq('exam_id', id);
        
      if (deleteError) throw deleteError;
      
      // Insert new question associations
      if (data.questions.length > 0) {
        const examQuestions = data.questions.map((questionId, index) => ({
          exam_id: id,
          question_id: questionId,
          order_number: index + 1,
        }));
        
        const { error: questionsError } = await supabase
          .from('exam_questions')
          .insert(examQuestions);
          
        if (questionsError) throw questionsError;
      }
      
      await fetchExams();
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
      // Note: exam_questions will be automatically deleted due to CASCADE
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchExams();
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
      const { error } = await supabase
        .from('exams')
        .update({
          status: ExamStatus.PUBLISHED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchExams();
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
      const { error } = await supabase
        .from('exams')
        .update({
          status: ExamStatus.ARCHIVED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchExams();
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
    getExam,
    getExamsByCourse,
  };
};
