
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Question, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QuestionPreview from "./QuestionPreview";
import QuestionForm from "./QuestionForm";
import { useQuestions } from "@/hooks/useQuestions";
import QuestionTableHeader from "./table/QuestionTableHeader";
import QuestionActions from "./table/QuestionActions";

interface QuestionTableProps {
  questions: Question[];
  subjects: Subject[];
}

const QuestionTable = ({ questions: initialQuestions, subjects }: QuestionTableProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all-subjects");
  const [questions, setQuestions] = useState(initialQuestions);
  const { updateQuestion, deleteQuestion, isLoading } = useQuestions();

  const getSubjectTitle = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.title : 'Unknown Subject';
  };

  const handleEditQuestion = async (data: any) => {
    if (selectedQuestion) {
      await updateQuestion(selectedQuestion.id, data);
      setIsEditOpen(false);
      setSelectedQuestion(null);
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    if (confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(question.id);
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== question.id)
      );
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchQuery === "" || 
      question.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "all-subjects" || question.subjectId === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div>
      <QuestionTableHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterSubject={filterSubject}
        onFilterChange={setFilterSubject}
        subjects={subjects}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Question Text</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <TableRow key={question.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{getSubjectTitle(question.subjectId)}</TableCell>
                  <TableCell>
                    {question.text.length > 60 
                      ? `${question.text.substring(0, 60)}...` 
                      : question.text}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${question.difficultyLevel === DifficultyLevel.EASY 
                        ? "bg-green-100 text-green-800"
                        : question.difficultyLevel === DifficultyLevel.MEDIUM
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"}`}
                    >
                      {question.difficultyLevel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <QuestionActions
                      question={question}
                      onView={() => {
                        setSelectedQuestion(question);
                        setIsPreviewOpen(true);
                      }}
                      onEdit={() => {
                        setSelectedQuestion(question);
                        setIsEditOpen(true);
                      }}
                      onDelete={() => handleDeleteQuestion(question)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          {selectedQuestion && (
            <QuestionPreview question={selectedQuestion} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the details of this question.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <QuestionForm
              subjects={subjects}
              onSubmit={handleEditQuestion}
              isSubmitting={isLoading}
              initialData={{
                text: selectedQuestion.text,
                type: selectedQuestion.type,
                subjectId: selectedQuestion.subjectId,
                difficultyLevel: selectedQuestion.difficultyLevel,
                explanation: selectedQuestion.explanation,
                options: selectedQuestion.options,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionTable;
