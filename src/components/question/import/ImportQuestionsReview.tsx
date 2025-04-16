
import { QuestionFormData } from "@/types/question.types";
import { Subject } from "@/types/subject.types";

interface ImportQuestionsReviewProps {
  questions: QuestionFormData[];
  subjects: Subject[];
}

const ImportQuestionsReview = ({ questions, subjects }: ImportQuestionsReviewProps) => {
  return (
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
            {questions.map((question, index) => {
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
  );
};

export default ImportQuestionsReview;
