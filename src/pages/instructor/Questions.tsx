
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Upload } from "lucide-react";
import InstructorLayout from "@/layouts/InstructorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSubjects } from "@/hooks/useSubjects";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  console.log("Rendering Questions Page");
  const { subjects, fetchSubjects } = useSubjects();
  const { questions, createQuestion, isLoading } = useQuestions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateQuestion = async (data: any) => {
    await createQuestion(data);
    setIsCreateDialogOpen(false);
  };

  const handleImportQuestions = async (questionsData: QuestionFormData[]) => {
    setImportLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process questions one by one
      for (const questionData of questionsData) {
        try {
          await createQuestion(questionData);
          successCount++;
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
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error in batch import:", error);
      toast.error("Failed to import questions");
      return Promise.reject(error);
    } finally {
      setImportLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchQuery === "" || 
                         question.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "" || question.subjectId === filterSubject;
    
    if (currentTab === "all") return matchesSearch && matchesSubject;
    
    return matchesSearch && matchesSubject;
  });

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
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search questions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-72">
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <SelectValue placeholder="Filter by subject" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subjects">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <QuestionTable questions={filteredQuestions} subjects={subjects} />
          </CardContent>
        </Card>
      </div>
      
      <ImportQuestionsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        subjects={subjects}
        onImport={handleImportQuestions}
      />
    </InstructorLayout>
  );
};

export default QuestionsPage;
