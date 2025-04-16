
import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjects } from "@/hooks/useSubjects";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "@/components/question/QuestionForm";
import QuestionTable from "@/components/question/QuestionTable";
import ImportQuestionsDialog from "@/components/question/ImportQuestionsDialog";
import { Badge } from "@/components/ui/badge";
import { useQuestions } from "@/hooks/useQuestions";
import { toast } from "sonner";
import { QuestionFormData } from "@/types/question.types";

const QuestionsPage = () => {
  const { subjects, fetchSubjects } = useSubjects();
  const { questions, createQuestion, isLoading, fetchQuestions } = useQuestions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    // Ensure questions are fetched when the component mounts
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async (data: any) => {
    const success = await createQuestion(data);
    if (success) {
      setIsCreateDialogOpen(false);
      // Refetch questions to update the list
      fetchQuestions();
    }
  };

  const handleImportQuestions = async (questionsData: QuestionFormData[]) => {
    setImportLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process questions one by one
      for (const questionData of questionsData) {
        try {
          const success = await createQuestion(questionData);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error("Error creating question:", err);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        toast.warning(`Imported ${successCount} questions with ${errorCount} errors`);
      } else {
        toast.success(`Successfully imported ${successCount} questions`);
      }
      
      // Explicitly refresh the questions list after import
      await fetchQuestions();
      
      setIsImportDialogOpen(false); // Close the dialog after import
      return Promise.resolve();
    } catch (error) {
      console.error("Error in batch import:", error);
      toast.error("Failed to import questions");
      return Promise.reject(error);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-gray-500 mt-1">Manage all your questions across subjects</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload size={18} />
              <span>Import</span>
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={18} />
                  <span>Create Question</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                  <DialogDescription>
                    Create a new question for your question bank.
                  </DialogDescription>
                </DialogHeader>
                <QuestionForm 
                  subjects={subjects}
                  onSubmit={handleCreateQuestion}
                  isSubmitting={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="bg-gray-50 dark:bg-gray-800">
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">
                    All Questions <Badge variant="outline" className="ml-2">{questions.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            {/* Table with built-in search and filter */}
            <QuestionTable questions={questions} subjects={subjects} />
          </CardContent>
        </Card>
      </div>
      
      <ImportQuestionsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        subjects={subjects}
        onImport={handleImportQuestions}
        isLoading={importLoading}
      />
    </InstructorLayout>
  );
};

export default QuestionsPage;
