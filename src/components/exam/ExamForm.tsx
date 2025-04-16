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
import { Course } from "@/types/course.types";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import QuestionPoolConfig from "./QuestionPoolConfig";
import { QuestionPool } from "@/types/question-pool.types";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  courseId: z.string().min(1, "Course is required"),
  timeLimit: z.coerce.number().min(5, "Time limit must be at least 5 minutes"),
  passingScore: z.coerce.number().min(1, "Passing score is required").max(100, "Passing score cannot exceed 100%"),
  shuffleQuestions: z.boolean(),
  useQuestionPool: z.boolean().optional(),
  status: z.nativeEnum(ExamStatus),
  questions: z.array(z.string()).min(1, "At least one question is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
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
  onSubmit: (data: any) => void;
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
  const [questionPool, setQuestionPool] = useState<QuestionPool | undefined>(initialData?.questionPool);
  
  const form = useForm({
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
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
    },
  });

  const watchCourseId = form.watch("courseId");
  
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
  }, {} as Record<string, { subject: typeof subjects[0], questions: typeof questions }>);

  const handleSubmit = (data: z.infer<typeof examSchema>) => {
    if (useQuestionPool && questionPool) {
      onSubmit({
        ...data,
        useQuestionPool,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter exam title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={courseIdFixed}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Score (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="70"
                      min={1}
                      max={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExamStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={ExamStatus.PUBLISHED}>Published</SelectItem>
                        <SelectItem value={ExamStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="shuffleQuestions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Shuffle Questions</FormLabel>
                    <FormDescription>
                      Randomize the order of questions for each candidate
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useQuestionPool"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Use Question Pool</FormLabel>
                    <FormDescription>
                      Create a pool of questions and randomly select questions for each candidate
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={useQuestionPool}
                      onCheckedChange={(checked) => {
                        setUseQuestionPool(checked);
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the exam becomes available to candidates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date <
                          new Date(
                            form.getValues("startDate") || new Date().setHours(0, 0, 0, 0)
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the exam will no longer be available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {!useQuestionPool && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="questions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Questions</FormLabel>
                    <FormDescription>
                      Select questions from available subjects
                    </FormDescription>
                  </div>
                  <div className="space-y-4 border rounded-lg p-4">
                    {Object.values(questionsBySubject).map(({ subject, questions: subjectQuestions }) => (
                      <div key={subject.id} className="space-y-2">
                        <h4 className="font-medium">{subject.title} ({subjectQuestions.length} questions)</h4>
                        <div className="pl-4 space-y-2">
                          {subjectQuestions.map((question) => (
                            <FormField
                              key={question.id}
                              control={form.control}
                              name="questions"
                              render={({ field }) => (
                                <FormItem
                                  key={question.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 py-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(question.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, question.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== question.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-normal">
                                      {question.text}
                                    </FormLabel>
                                    <FormDescription>
                                      {question.difficultyLevel} - {question.options.length} options
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(questionsBySubject).length === 0 && (
                      <div className="py-4 text-center text-gray-500">
                        {selectedCourseId
                          ? "No questions available for this course's subjects"
                          : "Select a course to see available questions"}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
