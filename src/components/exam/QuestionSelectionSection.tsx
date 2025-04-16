
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/types/exam.types";

interface QuestionsBySubject {
  subject: Subject;
  questions: Question[];
}

interface QuestionSelectionSectionProps {
  form: UseFormReturn<ExamFormData>;
  questionsBySubject: Record<string, QuestionsBySubject>;
  selectedCourseId: string;
}

const QuestionSelectionSection = ({
  form,
  questionsBySubject,
  selectedCourseId,
}: QuestionSelectionSectionProps) => {
  return (
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
            <div className="space-y-4 border rounded-lg p-4 max-h-[50vh] overflow-y-auto">
              {Object.values(questionsBySubject).map(({ subject, questions: subjectQuestions }) => (
                <div key={subject.id} className="space-y-2">
                  <h4 className="font-medium">
                    {subject.title} ({subjectQuestions.length} questions)
                  </h4>
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
  );
};

export default QuestionSelectionSection;
