
import { useState } from "react";
import { Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import QuestionActions from "./table/QuestionActions";
import QuestionTableHeader from "./table/QuestionTableHeader";

interface QuestionTableProps {
  questions: Question[];
  subjects: Subject[];
}

const QuestionTable = ({ questions, subjects }: QuestionTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);

  // Update filtered questions when search query or questions change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const filtered = questions.filter(question =>
      question.text.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredQuestions(filtered);
  };

  // Initialize filtered questions with all questions
  if (filteredQuestions.length !== questions.length && searchQuery === "") {
    setFilteredQuestions(questions);
  }

  // Get subject title by ID
  const getSubjectTitle = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.title : "Unknown Subject";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Question</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium max-w-[400px] truncate">
                    {question.text}
                  </TableCell>
                  <TableCell>{getSubjectTitle(question.subjectId)}</TableCell>
                  <TableCell>{question.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        question.difficultyLevel === "easy"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                          : question.difficultyLevel === "medium"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                          : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
                      }
                    >
                      {question.difficultyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <QuestionActions 
                      question={question} 
                      subjects={subjects}
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
    </div>
  );
};

export default QuestionTable;
