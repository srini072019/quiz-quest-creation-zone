
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet, Upload, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { read, utils, write } from "xlsx";
import { Subject } from "@/types/subject.types";
import { toast } from "sonner";
import { DifficultyLevel, QuestionFormData, QuestionType } from "@/types/question.types";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImportQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onImport: (questions: QuestionFormData[]) => Promise<void>;
}

interface SpreadsheetQuestion {
  Subject?: string;
  "Question Type"?: string;
  "Question Text"?: string;
  "Option 1"?: string;
  "Option 2"?: string;
  "Option 3"?: string;
  "Option 4"?: string;
  "Correct Option"?: string | number;
  "Difficulty Level"?: string | number;
  "Explanation"?: string;
}

const ImportQuestionsDialog = ({ 
  open, 
  onOpenChange, 
  subjects, 
  onImport 
}: ImportQuestionsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionFormData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  const resetState = () => {
    setError(null);
    setProgress(0);
    setParsedQuestions([]);
    setActiveTab("upload");
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setProgress(10);
      
      // Read the file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      setProgress(30);
      
      // Get the first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON
      const jsonData = utils.sheet_to_json<SpreadsheetQuestion>(worksheet);
      setProgress(50);
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the spreadsheet");
      }
      
      // Transform data to QuestionFormData
      const questionData: QuestionFormData[] = [];
      
      for (const row of jsonData) {
        try {
          const transformedQuestion = transformRowToQuestion(row, subjects);
          questionData.push(transformedQuestion);
        } catch (err) {
          console.error("Error transforming row:", err);
          // Continue processing other rows
        }
      }
      
      if (questionData.length === 0) {
        throw new Error("No valid questions found in the spreadsheet");
      }
      
      setProgress(80);
      setParsedQuestions(questionData);
      setProgress(100);
    } catch (err) {
      console.error("Error parsing spreadsheet:", err);
      setError(err instanceof Error ? err.message : "Failed to parse the spreadsheet");
    } finally {
      setIsLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const transformRowToQuestion = (row: SpreadsheetQuestion, subjects: Subject[]): QuestionFormData => {
    // Ensure Subject exists and is a string before trying to access toLowerCase
    if (!row.Subject) {
      throw new Error("Missing Subject in spreadsheet row");
    }
    
    const subjectName = String(row.Subject).trim();
    if (!subjectName) {
      throw new Error("Empty Subject in spreadsheet row");
    }
    
    // Find subject ID by title with safe string comparison
    const subject = subjects.find(s => 
      s.title.toLowerCase() === subjectName.toLowerCase()
    );
    
    if (!subject) {
      throw new Error(`Subject not found: ${subjectName}`);
    }
    
    // Determine question type with null check
    let questionType = QuestionType.MULTIPLE_CHOICE;
    if (row["Question Type"]) {
      const questionTypeStr = String(row["Question Type"]).toLowerCase();
      if (questionTypeStr.includes("true") || questionTypeStr.includes("false")) {
        questionType = QuestionType.TRUE_FALSE;
      } else if (questionTypeStr.includes("multiple answer")) {
        questionType = QuestionType.MULTIPLE_ANSWER;
      }
    }
    
    // Parse difficulty level with proper number handling
    let difficultyLevel = DifficultyLevel.MEDIUM;
    if (row["Difficulty Level"] !== undefined && row["Difficulty Level"] !== null) {
      if (typeof row["Difficulty Level"] === "number") {
        switch (row["Difficulty Level"]) {
          case 1:
            difficultyLevel = DifficultyLevel.EASY;
            break;
          case 2:
            difficultyLevel = DifficultyLevel.MEDIUM;
            break;
          case 3:
            difficultyLevel = DifficultyLevel.HARD;
            break;
        }
      } else if (typeof row["Difficulty Level"] === "string") {
        const difficultyStr = row["Difficulty Level"].toLowerCase();
        if (difficultyStr.includes("easy") || difficultyStr === "1") {
          difficultyLevel = DifficultyLevel.EASY;
        } else if (difficultyStr.includes("hard") || difficultyStr === "3") {
          difficultyLevel = DifficultyLevel.HARD;
        }
      }
    }
    
    // Create options and mark correct ones with proper null checks
    const options = [];
    
    // Helper function to safely check if an option is correct
    const isOptionCorrect = (optionValue: string | undefined, optionNumber: number | string): boolean => {
      if (optionValue === undefined) return false;
      
      if (row["Correct Option"] === undefined || row["Correct Option"] === null) return false;
      
      // Check if correct option is specified by number
      if (row["Correct Option"] === optionNumber || row["Correct Option"] === String(optionNumber)) {
        return true;
      }
      
      // Check if correct option is specified by text
      if (typeof row["Correct Option"] === "string" && typeof optionValue === "string") {
        return row["Correct Option"].toLowerCase() === optionValue.toLowerCase();
      }
      
      return false;
    };
    
    // Add each option that exists in the row with null checks
    if (row["Option 1"]) {
      options.push({ 
        id: uuidv4(), 
        text: String(row["Option 1"]), 
        isCorrect: isOptionCorrect(row["Option 1"], 1) 
      });
    }
    
    if (row["Option 2"]) {
      options.push({ 
        id: uuidv4(), 
        text: String(row["Option 2"]), 
        isCorrect: isOptionCorrect(row["Option 2"], 2) 
      });
    }
    
    if (row["Option 3"]) {
      options.push({ 
        id: uuidv4(), 
        text: String(row["Option 3"]), 
        isCorrect: isOptionCorrect(row["Option 3"], 3) 
      });
    }
    
    if (row["Option 4"]) {
      options.push({ 
        id: uuidv4(), 
        text: String(row["Option 4"]), 
        isCorrect: isOptionCorrect(row["Option 4"], 4) 
      });
    }
    
    if (questionType === QuestionType.TRUE_FALSE && options.length === 0) {
      // For true/false questions with no options specified
      const correctOption = row["Correct Option"];
      const isTrue = typeof correctOption === "string" && correctOption.toLowerCase() === "true";
      
      options.push({ id: uuidv4(), text: "True", isCorrect: isTrue });
      options.push({ id: uuidv4(), text: "False", isCorrect: !isTrue });
    }
    
    if (!row["Question Text"]) {
      throw new Error("Missing Question Text in spreadsheet");
    }
    
    return {
      text: String(row["Question Text"]),
      type: questionType,
      subjectId: subject.id,
      difficultyLevel,
      options,
      explanation: row["Explanation"] ? String(row["Explanation"]) : undefined
    };
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;
    
    setIsLoading(true);
    try {
      await onImport(parsedQuestions);
      toast.success(`Successfully imported ${parsedQuestions.length} questions`);
      handleOpenChange(false);
    } catch (err) {
      console.error("Error importing questions:", err);
      setError("Failed to import questions");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        "Subject": "Example Subject Name",
        "Question Type": "multiple_choice", // or "true_false" or "multiple_answer"
        "Question Text": "What is the capital of France?",
        "Option 1": "Paris",
        "Option 2": "London",
        "Option 3": "Berlin",
        "Option 4": "Madrid",
        "Correct Option": 1, // can be 1, 2, 3, 4 or the actual text of the option
        "Difficulty Level": "easy", // or "medium" or "hard" or 1, 2, 3
        "Explanation": "Paris is the capital and most populous city of France."
      },
      {
        "Subject": "Example Subject Name",
        "Question Type": "true_false",
        "Question Text": "The Earth is flat.",
        "Option 1": "True",
        "Option 2": "False",
        "Correct Option": "False",
        "Difficulty Level": "easy",
        "Explanation": "The Earth is approximately spherical in shape."
      }
    ];
    
    // Create worksheet
    const ws = utils.json_to_sheet(templateData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Template");
    
    // Generate and download
    const buf = write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_import_template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet with your questions or download a template to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {parsedQuestions.length === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="spreadsheet-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">XLSX or CSV (Excel spreadsheet)</p>
                    </div>
                    <input 
                      id="spreadsheet-upload" 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                  </label>
                </div>
                
                {isLoading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">Processing file...</p>
                  </div>
                )}

                <div className="text-center">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("template")}>
                    Need a template? Click here
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="font-medium">Preview:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {parsedQuestions.length} questions found in the spreadsheet.
                  </p>
                  <ul className="mt-2 text-sm list-disc pl-5">
                    {parsedQuestions.slice(0, 3).map((q, idx) => (
                      <li key={idx} className="truncate">
                        {q.text.substring(0, 50)}{q.text.length > 50 ? "..." : ""}
                      </li>
                    ))}
                    {parsedQuestions.length > 3 && (
                      <li className="italic">And {parsedQuestions.length - 3} more...</li>
                    )}
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => resetState()}>
                    Change File
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={isLoading}
                  >
                    {isLoading ? "Importing..." : "Import Questions"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="template" className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Template Format</h3>
              <p className="text-sm mb-3">
                Your spreadsheet should include these columns:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li><strong>Subject</strong>: Must match an existing subject name exactly</li>
                <li><strong>Question Type</strong>: "multiple_choice", "true_false", or "multiple_answer"</li>
                <li><strong>Question Text</strong>: The actual question</li>
                <li><strong>Option 1-4</strong>: Possible answers</li>
                <li><strong>Correct Option</strong>: Number (1-4) or the text of the correct option</li> 
                <li><strong>Difficulty Level</strong>: "easy", "medium", "hard" (or 1, 2, 3)</li>
                <li><strong>Explanation</strong>: Optional explanation for the answer</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download Template
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("upload")}>
                Back to Upload
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportQuestionsDialog;
