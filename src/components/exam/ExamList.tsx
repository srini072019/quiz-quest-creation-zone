
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2, Clock, Archive, FileText } from "lucide-react";
import { Exam, ExamStatus } from "@/types/exam.types";
import { useExams } from "@/hooks/useExams";
import { Course } from "@/types/course.types";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types/question.types";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExamListProps {
  courseId: string;
  courses: Course[];
  questions: Question[];
}

const ExamList = ({ courseId, courses, questions }: ExamListProps) => {
  const { exams: allExams, deleteExam, publishExam, archiveExam, isLoading } = useExams(courseId);

  const exams = allExams.filter(exam => exam.courseId === courseId);
  const draftExams = exams.filter(exam => exam.status === ExamStatus.DRAFT);
  const publishedExams = exams.filter(exam => exam.status === ExamStatus.PUBLISHED);
  const archivedExams = exams.filter(exam => exam.status === ExamStatus.ARCHIVED);

  const handleDeleteExam = async (id: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      await deleteExam(id);
    }
  };

  const handlePublishExam = async (id: string) => {
    await publishExam(id);
  };

  const handleArchiveExam = async (id: string) => {
    if (confirm("Are you sure you want to archive this exam?")) {
      await archiveExam(id);
    }
  };

  const getStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case ExamStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case ExamStatus.PUBLISHED:
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case ExamStatus.ARCHIVED:
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return null;
    }
  };

  const renderExamCard = (exam: Exam) => (
    <Card key={exam.id}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{exam.title}</CardTitle>
              {getStatusBadge(exam.status)}
            </div>
            <CardDescription>{exam.description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            {exam.status === ExamStatus.DRAFT && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/instructor/exams/${exam.id}/edit`}>
                    <Edit size={16} />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handlePublishExam(exam.id)}>
                  <FileText size={16} />
                </Button>
              </>
            )}
            {exam.status === ExamStatus.PUBLISHED && (
              <Button variant="ghost" size="icon" onClick={() => handleArchiveExam(exam.id)}>
                <Archive size={16} />
              </Button>
            )}
            {exam.status === ExamStatus.DRAFT && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteExam(exam.id)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{exam.timeLimit} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{exam.questions.length} questions</span>
          </div>
          {exam.startDate && (
            <div>
              <span className="font-medium">Starts:</span> {formatDate(exam.startDate)}
            </div>
          )}
          {exam.endDate && (
            <div>
              <span className="font-medium">Ends:</span> {formatDate(exam.endDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exams</h2>
        <Button size="sm" className="flex items-center gap-1" asChild>
          <Link to="/instructor/exams/create">
            <Plus size={16} />
            <span>Create Exam</span>
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="drafts">Drafts ({draftExams.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedExams.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedExams.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drafts" className="space-y-3">
          {draftExams.length > 0 ? (
            draftExams.map(renderExamCard)
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                No draft exams found. Create your first exam.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="published" className="space-y-3">
          {publishedExams.length > 0 ? (
            publishedExams.map(renderExamCard)
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                No published exams found.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-3">
          {archivedExams.length > 0 ? (
            archivedExams.map(renderExamCard)
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                No archived exams found.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamList;
