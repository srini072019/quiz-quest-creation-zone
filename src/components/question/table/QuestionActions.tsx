
import { Question } from "@/types/question.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings2, Eye, Pencil, Trash2 } from "lucide-react";

interface QuestionActionsProps {
  question: Question;
  onView: (question: Question) => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

const QuestionActions = ({ 
  question, 
  onView, 
  onEdit, 
  onDelete 
}: QuestionActionsProps) => {
  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(question)}>
            <Eye className="mr-2 h-4 w-4" />
            View question
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(question)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit question
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => onDelete(question)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete question
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuestionActions;
