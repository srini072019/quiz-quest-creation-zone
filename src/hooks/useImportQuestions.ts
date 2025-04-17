
import { useState } from "react";
import { toast } from "sonner";
import { read, utils, writeFileXLSX } from "xlsx";
import { QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import { mapToQuestionType, mapToDifficultyLevel } from "@/utils/questionUtils";

interface SpreadsheetQuestion {
  question: string;
  type: string;
  subject: string;
  difficulty: string;
  explanation?: string;
  correctAnswers: string;
  options: string;
}

export const useImportQuestions = (subjects: Subject[]) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionFormData[]>([]);

  const resetState = () => {
    setError(null);
    setProgress(0);
    setParsedQuestions([]);
  };

  const validateRequiredFields = (row: any): string | null => {
    const requiredFields = ["question", "type", "subject", "options"];
    for (const field of requiredFields) {
      if (!row[field]) {
        return `Missing required field: ${field}`;
      }
    }
    return null;
  };

  const findSubjectId = (subjectName: string): string | null => {
    const subject = subjects.find(s => 
      s.title.toLowerCase().trim() === subjectName.toLowerCase().trim()
    );
    return subject ? subject.id : null;
  };

  const parseOptions = (optionsString: string, correctAnswers: string, type: QuestionType) => {
    // Split options by line break or semicolon
    const optionsList = optionsString
      .split(/[;\n]/)
      .map(option => option.trim())
      .filter(option => option.length > 0);

    // For true/false, ensure we have only 'true' and 'false' options
    if (type === QuestionType.TRUE_FALSE) {
      return [
        { id: crypto.randomUUID(), text: "True", isCorrect: correctAnswers.toLowerCase().includes("true") },
        { id: crypto.randomUUID(), text: "False", isCorrect: correctAnswers.toLowerCase().includes("false") }
      ];
    }

    // For other question types, parse the options and mark correct ones
    return optionsList.map(option => {
      const isCorrect = correctAnswers
        .split(/[,;\n]/)
        .map(answer => answer.trim().toLowerCase())
        .some(answer => option.toLowerCase().includes(answer));

      return {
        id: crypto.randomUUID(),
        text: option,
        isCorrect
      };
    });
  };

  const parseFileData = async (file: File): Promise<QuestionFormData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error("Failed to read file");
          }
          
          const data = e.target.result;
          const workbook = read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = utils.sheet_to_json<SpreadsheetQuestion>(worksheet, { header: 2, defval: "" });
          
          const questions: QuestionFormData[] = [];
          const errors: string[] = [];
          
          jsonData.forEach((row, index) => {
            try {
              // Skip header row if it exists and was not properly parsed
              if (index === 0 && (row.question === "question" || !row.question)) {
                return;
              }
              
              // Validate required fields
              const validationError = validateRequiredFields(row);
              if (validationError) {
                errors.push(`Row ${index + 1}: ${validationError}`);
                return;
              }
              
              // Map question type
              const questionType = mapToQuestionType(row.type);
              
              // Find subject ID
              const subjectId = findSubjectId(row.subject);
              if (!subjectId) {
                errors.push(`Row ${index + 1}: Subject not found: ${row.subject}`);
                return;
              }
              
              // Parse options and correct answers
              const options = parseOptions(row.options, row.correctAnswers || "", questionType);
              if (options.length === 0) {
                errors.push(`Row ${index + 1}: No valid options found`);
                return;
              }
              
              if (!options.some(opt => opt.isCorrect)) {
                errors.push(`Row ${index + 1}: No correct answer specified`);
                return;
              }
              
              // Create question object
              const question: QuestionFormData = {
                text: row.question,
                type: questionType,
                subjectId,
                difficultyLevel: mapToDifficultyLevel(row.difficulty || "medium"),
                options,
                explanation: row.explanation || ""
              };
              
              questions.push(question);
              setProgress(Math.round(((index + 1) / jsonData.length) * 100));
              
            } catch (err) {
              errors.push(`Row ${index + 1}: ${(err as Error).message}`);
            }
          });
          
          if (errors.length > 0) {
            setError(`Found ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ''}`);
          }
          
          resolve(questions);
          
        } catch (err) {
          reject(`Failed to parse file: ${(err as Error).message}`);
        }
      };
      
      reader.onerror = () => {
        reject("Error reading file");
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    resetState();
    setIsLoading(true);
    
    try {
      const questions = await parseFileData(file);
      
      if (questions.length === 0) {
        toast.error("No valid questions found in the file");
        setIsLoading(false);
        return;
      }
      
      setParsedQuestions(questions);
      toast.success(`Successfully parsed ${questions.length} questions`);
      
    } catch (err) {
      console.error("Error parsing file:", err);
      setError(String(err));
      toast.error(`Error parsing file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    try {
      // Create template data with examples for each question type
      const template = [
        {
          question: "What is the capital of France?",
          type: "multiple_choice",
          subject: subjects.length > 0 ? subjects[0].title : "Enter a valid subject name",
          difficulty: "medium",
          options: "Paris;London;Berlin;Madrid",
          correctAnswers: "Paris",
          explanation: "Paris is the capital and largest city of France."
        },
        {
          question: "The Earth is flat.",
          type: "true_false",
          subject: subjects.length > 0 ? subjects[0].title : "Enter a valid subject name",
          difficulty: "easy",
          options: "True;False",
          correctAnswers: "False",
          explanation: "The Earth is approximately spherical in shape."
        },
        {
          question: "Which of the following are mammals?",
          type: "multiple_answer",
          subject: subjects.length > 0 ? subjects[0].title : "Enter a valid subject name",
          difficulty: "medium",
          options: "Dog;Fish;Cat;Spider",
          correctAnswers: "Dog;Cat",
          explanation: "Dogs and cats are mammals, while fish and spiders are not."
        }
      ];

      // Convert to worksheet
      const ws = utils.json_to_sheet(template);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Questions Template");

      // Set column widths
      const colWidths = [
        { wch: 35 }, // question
        { wch: 15 }, // type
        { wch: 20 }, // subject
        { wch: 10 }, // difficulty
        { wch: 30 }, // options
        { wch: 20 }, // correctAnswers
        { wch: 40 }  // explanation
      ];
      
      ws['!cols'] = colWidths;

      // Download the file
      writeFileXLSX(wb, "questions_import_template.xlsx");
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  return {
    isLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload,
    resetState,
    downloadTemplate
  };
};
