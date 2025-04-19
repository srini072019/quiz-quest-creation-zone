
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExamStatus } from "@/types/exam.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Course } from "@/types/course.types";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import QuestionPoolConfig from "./QuestionPoolConfig";
import { QuestionPool } from "@/types/question-pool.types";
import QuestionSelectionSection from "./QuestionSelectionSection";
import { ExamFormData } from "@/types/exam.types";
import ExamHeaderFields from "./form/ExamHeaderFields";
import ExamSettingsFields from "./form/ExamSettingsFields";
import ExamDateFields from "./form/ExamDateFields";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  courseId: z.string().min(1, "Course is required"),
  timeLimit: z.coerce.number().min(5, "Time limit must be at least 5 minutes"),
  passingScore: z.coerce.number().min(1, "Passing score is required").max(100, "Passing score cannot exceed 100%"),
  shuffleQuestions: z.boolean(),
  useQuestionPool: z.boolean().default(false),
  status: z.nativeEnum(ExamStatus),
  questions: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => {
  if (data.endDate <= data.startDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface ExamFormProps {
  initialData?: {
    title?: string;
    description?: string;
    courseId?: string;
    timeLimit?: number;
    passingScore?: number;
    shuffleQuestions?: boolean;
    useQuestionPool?: boolean;
    questionPool?: QuestionPool;
    status?: ExamStatus;
    questions?: string[];
    startDate?: Date;
    endDate?: Date;
  };
  courses: Course[];
  questions: Question[];
  subjects: Subject[];
  onSubmit: (data: ExamFormData) => void;
  isSubmitting: boolean;
  courseIdFixed?: boolean;
}

const ExamForm = ({
  initialData,
  courses,
  questions,
  subjects,
  onSubmit,
  isSubmitting,
  courseIdFixed = false,
}: ExamFormProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState(initialData?.courseId || "");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [useQuestionPool, setUseQuestionPool] = useState(initialData?.useQuestionPool || false);
  const [questionPool, setQuestionPool] = useState<QuestionPool | undefined>(
    initialData?.questionPool
  );

  // Set default dates if not provided
  const defaultStartDate = initialData?.startDate || new Date();
  const defaultEndDate = initialData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      courseId: initialData?.courseId || "",
      timeLimit: initialData?.timeLimit || 30,
      passingScore: initialData?.passingScore || 70,
      shuffleQuestions: initialData?.shuffleQuestions || false,
      useQuestionPool: initialData?.useQuestionPool || false,
      status: initialData?.status || ExamStatus.DRAFT,
      questions: initialData?.questions || [],
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    },
  });

  const watchCourseId = form.watch("courseId");
  const watchQuestions = form.watch("questions");

  useEffect(() => {
    if (watchCourseId) {
      setSelectedCourseId(watchCourseId);
      
      const courseSubjects = subjects.filter(subject => subject.courseId === watchCourseId);
      
      const courseQuestions = questions.filter(question => 
        courseSubjects.some(subject => subject.id === question.subjectId)
      );
      
      setFilteredQuestions(courseQuestions);
    }
  }, [watchCourseId, courses, questions, subjects]);

  const questionsBySubject = filteredQuestions.reduce((acc, question) => {
    const subject = subjects.find(s => s.id === question.subjectId);
    if (subject) {
      if (!acc[subject.id]) {
        acc[subject.id] = {
          subject,
          questions: []
        };
      }
      acc[subject.id].questions.push(question);
    }
    return acc;
  }, {} as Record<string, { subject: typeof subjects[0], questions: Question[] }>);

  const handleSubmit = (data: ExamFormData) => {
    // Validate question count
    if (!useQuestionPool && data.questions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    // Validate start and end dates
    const now = new Date();
    if (data.startDate < now) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (data.endDate <= data.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (useQuestionPool) {
      if (!questionPool) {
        toast.error("Please configure the question pool");
        return;
      }

      // Validate question pool configuration
      const totalQuestionsFromSubjects = questionPool.subjects.reduce((sum, subject) => 
        sum + subject.count, 0);

      if (totalQuestionsFromSubjects <= 0) {
        toast.error("Question pool must include at least one question");
        return;
      }

      if (totalQuestionsFromSubjects > filteredQuestions.length) {
        toast.error(`Cannot select more questions than available (${filteredQuestions.length} available)`);
        return;
      }

      onSubmit({
        ...data,
        useQuestionPool: true,
        questionPool
      });
    } else {
      onSubmit({
        ...data,
        useQuestionPool: false
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto px-4">
        <div className="space-y-6">
          <ExamHeaderFields 
            form={form} 
            courses={courses} 
            courseIdFixed={courseIdFixed} 
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter exam description"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ExamSettingsFields 
            form={form} 
            onUseQuestionPoolChange={setUseQuestionPool} 
          />

          <ExamDateFields form={form} />
        </div>

        {!useQuestionPool && (
          <QuestionSelectionSection
            form={form}
            questionsBySubject={questionsBySubject}
            selectedCourseId={selectedCourseId}
          />
        )}

        {useQuestionPool && (
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="text-lg font-medium">Question Pool Configuration</h3>
            <QuestionPoolConfig 
              subjects={subjects} 
              initialPool={questionPool}
              onPoolChange={setQuestionPool} 
            />
          </div>
        )}

        <div className="flex justify-end sticky bottom-0 bg-white py-4 border-t mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Exam"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExamForm;
