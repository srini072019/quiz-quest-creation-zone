
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions } from "@/hooks/useQuestions";
import { useExams } from "@/hooks/useExams";
import { useExamSession } from "@/hooks/useExamSession";
import { useAuth } from "@/context/AuthContext";
import ExamTaking from "@/components/exam/ExamTaking";
import ExamResults from "@/components/exam/ExamResults";
import CandidateLayout from "@/layouts/CandidateLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExamResult, ExamSession } from "@/types/exam-session.types";
import { Question } from "@/types/question.types";
import { Exam } from "@/types/exam.types";
import { Loader2 } from "lucide-react";

const ExamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { getExam } = useExams();
  const { questions } = useQuestions();
  const { 
    startExam, 
    saveAnswer, 
    navigateQuestion, 
    submitExam, 
    getExamSession 
  } = useExamSession();

  const [isLoading, setIsLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const loadExam = async () => {
      if (!id) return;
      
      try {
        const examData = getExam(id);
        if (!examData) {
          toast.error("Exam not found");
          navigate(-1);
          return;
        }

        setExam(examData);

        // Get exam questions
        const examQuestionsList = questions.filter(q => 
          examData.questions.includes(q.id)
        );

        // Shuffle questions if the exam requires it
        let finalQuestions = [...examQuestionsList];
        if (examData.shuffleQuestions) {
          finalQuestions = finalQuestions.sort(() => Math.random() - 0.5);
        }
        
        setExamQuestions(finalQuestions);
      } catch (error) {
        console.error("Error loading exam:", error);
        toast.error("Failed to load exam");
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [id, getExam, questions, navigate]);

  const handleStartExam = async () => {
    if (!exam || !authState.user) return;

    try {
      const session = await startExam(
        exam.id,
        authState.user.id,
        exam.timeLimit
      );

      if (session) {
        setExamSession(session);
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam");
    }
  };

  const handleSaveAnswer = async (questionId: string, selectedOptions: string[]) => {
    if (!examSession) return false;
    
    return await saveAnswer(examSession.id, questionId, selectedOptions);
  };

  const handleNavigate = async (newIndex: number) => {
    if (!examSession) return false;
    
    const success = await navigateQuestion(examSession.id, newIndex);
    if (success) {
      // Update the session in state
      const updatedSession = getExamSession(examSession.id);
      if (updatedSession) {
        setExamSession(updatedSession);
      }
    }
    return success;
  };

  const handleSubmitExam = async () => {
    if (!examSession || !exam) return;
    
    try {
      const result = await submitExam(examSession.id, exam, examQuestions);
      if (result) {
        setExamResult(result);
        toast.success("Exam submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    }
  };

  if (isLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CandidateLayout>
    );
  }

  if (examResult) {
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">{exam?.title} - Results</h1>
          <ExamResults result={examResult} />
          <div className="mt-6 flex justify-end">
            <Button onClick={() => navigate("/candidate/exams")}>
              Back to Exams
            </Button>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  if (!examSession) {
    return (
      <CandidateLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">{exam?.title}</h1>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Time Limit</p>
                <p>{exam?.timeLimit} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Questions</p>
                <p>{examQuestions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passing Score</p>
                <p>{exam?.passingScore}%</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>You have {exam?.timeLimit} minutes to complete the exam.</li>
                <li>You must score at least {exam?.passingScore}% to pass.</li>
                <li>Read each question carefully before answering.</li>
                <li>You can navigate between questions during the exam.</li>
                <li>You can only submit the exam once.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleStartExam}>Start Exam</Button>
            </div>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <ExamTaking
        examSession={examSession}
        questions={examQuestions}
        onSaveAnswer={handleSaveAnswer}
        onNavigate={handleNavigate}
        onSubmit={handleSubmitExam}
      />
    </CandidateLayout>
  );
};

export default ExamPage;
