
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { X, Upload, AlertTriangle, FileSpreadsheet, Check } from "lucide-react";
import { Subject } from "@/types/subject.types";
import { QuestionFormData } from "@/types/question.types";
import { useImportQuestions } from "@/hooks/useImportQuestions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ImportQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onImport: (questions: QuestionFormData[]) => Promise<void>;
  isLoading?: boolean;
}

const ImportQuestionsDialog = ({
  open,
  onOpenChange,
  subjects,
  onImport,
  isLoading: importLoading = false
}: ImportQuestionsDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");
  const {
    isLoading: parsingLoading,
    error,
    progress,
    parsedQuestions,
    handleFileUpload: processFile,
    resetState
  } = useImportQuestions(subjects);
  
  // Use either the passed in loading state or the internal parsing loading state
  const isLoading = importLoading || parsingLoading;
  
  const onDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processFile(file);
      setActiveTab("review");
    }
  };
  
  const handleImport = async () => {
    if (parsedQuestions.length > 0) {
      await onImport(parsedQuestions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Import questions from a spreadsheet file (Excel, CSV).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={parsedQuestions.length === 0}
            >
              Review ({parsedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="py-4">
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-60 bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Upload Spreadsheet File</p>
                      <p className="text-xs text-gray-500">
                        Upload XLSX, XLS, or CSV file with your questions
                      </p>
                    </div>
                    <Button variant="outline" className="mt-2" disabled={isLoading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  <label className="cursor-pointer absolute inset-0">
                    <input 
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
                
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-wrap text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Format Requirements</h4>
                <p className="text-sm text-gray-500">
                  Your spreadsheet should have the following columns:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                  <li><strong>question</strong> - The text of the question</li>
                  <li><strong>type</strong> - Question type (multiple_choice, true_false, multiple_answer)</li>
                  <li><strong>subject</strong> - The subject name (must match existing subject)</li>
                  <li><strong>difficulty</strong> - easy, medium, or hard (optional, defaults to medium)</li>
                  <li><strong>options</strong> - Options for answers (separate by semicolon or new line)</li>
                  <li><strong>correctAnswers</strong> - Text that identifies correct options</li>
                  <li><strong>explanation</strong> - Explanation of the answer (optional)</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="py-4">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {parsedQuestions.length} Questions Ready to Import
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={isLoading || parsedQuestions.length === 0}
                  >
                    {isLoading ? (
                      "Importing..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Import Questions
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">Question</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Subject</th>
                        <th className="px-4 py-2 text-left">Difficulty</th>
                        <th className="px-4 py-2 text-left">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedQuestions.map((question, index) => {
                        const subject = subjects.find(s => s.id === question.subjectId);
                        return (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 max-w-[300px] truncate">{question.text}</td>
                            <td className="px-4 py-2">{question.type}</td>
                            <td className="px-4 py-2">{subject?.title || ''}</td>
                            <td className="px-4 py-2">{question.difficultyLevel}</td>
                            <td className="px-4 py-2">{question.options.length} options</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportQuestionsDialog;
