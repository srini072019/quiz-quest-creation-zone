
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useEnrollment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  const enrollInCourse = async (courseId: string, userId: string): Promise<boolean> => {
    if (!authState.user) {
      toast.error("You must be logged in to enroll in courses");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: userId,
          enrolled_by: authState.user.id
        });

      if (error) throw error;
      
      toast.success("User enrolled in course successfully");
      return true;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll user in course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unenrollFromCourse = async (courseId: string, userId: string): Promise<boolean> => {
    if (!authState.user) {
      toast.error("You must be logged in to manage enrollments");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success("User unenrolled from course successfully");
      return true;
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      toast.error("Failed to unenroll user from course");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getEnrolledCourses = async () => {
    if (!authState.user) return [];
    
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          courses:course_id (
            id,
            title,
            description,
            instructor_id,
            is_published,
            created_at,
            updated_at,
            image_url
          )
        `)
        .eq('user_id', authState.user.id);

      if (error) throw error;

      return data.map(enrollment => enrollment.courses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("Failed to fetch enrolled courses");
      return [];
    }
  };

  const getCourseParticipants = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          user_id,
          enrolled_at,
          enrolled_by,
          profiles:user_id (
            display_name,
            avatar_url,
            role
          )
        `)
        .eq('course_id', courseId);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching course participants:", error);
      toast.error("Failed to fetch course participants");
      return [];
    }
  };

  return {
    isLoading,
    enrollInCourse,
    unenrollFromCourse,
    getEnrolledCourses,
    getCourseParticipants,
  };
};
