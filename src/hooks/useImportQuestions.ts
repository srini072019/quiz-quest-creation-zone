
import { useState } from "react";
import { toast } from "sonner";
import { read, utils } from "xlsx";
import { QuestionFormData, QuestionType, DifficultyLevel } from "@/types/question.types";
import { Subject } from "@/types/subject.types";

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

  const mapQuestionType = (typeString: string): QuestionType | null => {
    const lowerType = typeString.toLowerCase().trim();
    
    if (lowerType === "multiple choice" || lowerType === "multiple_choice") {
      return QuestionType.MULTIPLE_CHOICE;
    } else if (lowerType === "true false" || lowerType === "true/false" || lowerType === "true_false") {
      return QuestionType.TRUE_FALSE;
    } else if (lowerType === "multiple answer" || lowerType === "multiple_answer") {
      return QuestionType.MULTIPLE_ANSWER;
    }
    
    return null;
  };

  const mapDifficultyLevel = (difficultyString: string): DifficultyLevel => {
    const lowerDifficulty = difficultyString.toLowerCase().trim();
    
    if (lowerDifficulty === "easy") {
      return DifficultyLevel.EASY;
    } else if (lowerDifficulty === "hard") {
      return DifficultyLevel.HARD;
    }
    
    return DifficultyLevel.MEDIUM; // Default to medium
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
              const questionType = mapQuestionType(row.type);
              if (!questionType) {
                errors.push(`Row ${index + 1}: Invalid question type: ${row.type}`);
                return;
              }
              
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
                difficultyLevel: mapDifficultyLevel(row.difficulty || "medium"),
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

  return {
    isLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload,
    resetState,
  };
};
