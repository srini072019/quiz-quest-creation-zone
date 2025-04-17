
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
          const jsonData = utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          
          // Remove header row
          const headers = jsonData.shift() as string[];
          
          const questions: QuestionFormData[] = [];
          const errors: string[] = [];
          
          jsonData.forEach((row: any, index: number) => {
            try {
              // Map columns to our expected format
              const rowData = {
                subject: row[headers.indexOf('Subject')],
                type: row[headers.indexOf('Question Type')],
                question: row[headers.indexOf('Question Text')],
                options: [
                  row[headers.indexOf('Option A')],
                  row[headers.indexOf('Option B')],
                  row[headers.indexOf('Option C')],
                  row[headers.indexOf('Option D')]
                ].filter(opt => opt !== ""),
                correctAnswers: row[headers.indexOf('Correct Option')],
                difficulty: row[headers.indexOf('Difficulty')] || "" // Handle case when difficulty is empty
              };
              
              // Validate required fields
              if (!rowData.subject || !rowData.type || !rowData.question) {
                errors.push(`Row ${index + 2}: Missing required fields`);
                return;
              }
              
              // Find subject ID
              const subjectId = findSubjectId(rowData.subject);
              if (!subjectId) {
                errors.push(`Row ${index + 2}: Subject not found: ${rowData.subject}`);
                return;
              }
              
              // Map question type
              const questionType = mapToQuestionType(rowData.type);
              
              // Parse options and correct answers
              const options = rowData.options.map((option, optIndex) => ({
                id: crypto.randomUUID(),
                text: option,
                isCorrect: isOptionCorrect(rowData.correctAnswers, optIndex)
              }));
              
              if (options.length === 0) {
                errors.push(`Row ${index + 2}: No valid options found`);
                return;
              }
              
              if (!options.some(opt => opt.isCorrect)) {
                errors.push(`Row ${index + 2}: No correct answer specified`);
                return;
              }
              
              // Create question object with the provided difficulty (not defaulting to medium)
              const question: QuestionFormData = {
                text: rowData.question,
                type: questionType,
                subjectId,
                difficultyLevel: mapToDifficultyLevel(rowData.difficulty), // Use the provided difficulty
                options,
                explanation: ""
              };
              
              questions.push(question);
              
            } catch (err) {
              errors.push(`Row ${index + 2}: ${(err as Error).message}`);
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
      // Create template data with the specified format
      const template = [
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "multiple_choice",
          "Question Text": "What is the capital of France?",
          "Option A": "Paris",
          "Option B": "London",
          "Option C": "Berlin",
          "Option D": "Madrid",
          "Correct Option": "A",
          Difficulty: "easy"
        },
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "true_false",
          "Question Text": "The Earth is flat.",
          "Option A": "True",
          "Option B": "False",
          "Option C": "",
          "Option D": "",
          "Correct Option": "B",
          Difficulty: "medium"
        },
        {
          Subject: subjects.length > 0 ? subjects[0].title : "Enter Subject Name",
          "Question Type": "multiple_answer",
          "Question Text": "Which of the following are mammals?",
          "Option A": "Dog",
          "Option B": "Fish",
          "Option C": "Cat",
          "Option D": "Spider",
          "Correct Option": "A, C",
          Difficulty: "hard"
        }
      ];

      // Convert to worksheet
      const ws = utils.json_to_sheet(template);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Questions Template");

      // Set column widths
      const colWidths = [
        { wch: 20 },  // Subject
        { wch: 15 },  // Question Type
        { wch: 40 },  // Question Text
        { wch: 20 },  // Option A
        { wch: 20 },  // Option B
        { wch: 20 },  // Option C
        { wch: 20 },  // Option D
        { wch: 15 },  // Correct Option
        { wch: 12 }   // Difficulty
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

  const isOptionCorrect = (correctAnswers: string, optionIndex: number): boolean => {
    if (!correctAnswers) return false;
    
    // Convert to uppercase letters or numbers
    const correctOptions = correctAnswers.split(/[,;]/)
      .map(opt => opt.trim().toUpperCase());
    
    // Check if the option matches any of the correct options
    const optionLabels = ['A', 'B', 'C', 'D'];
    return correctOptions.includes(optionLabels[optionIndex]) || 
           correctOptions.includes(`${optionIndex + 1}`);
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
