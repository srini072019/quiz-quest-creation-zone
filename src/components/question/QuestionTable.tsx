
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { DifficultyLevel, Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Settings2, Eye, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import QuestionPreview from "./QuestionPreview";
import QuestionForm from "./QuestionForm";
import { useQuestions } from "@/hooks/useQuestions";

interface QuestionTableProps {
  questions: Question[];
  subjects: Subject[];
}

const QuestionTable = ({ questions, subjects }: QuestionTableProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { updateQuestion, deleteQuestion, isLoading } = useQuestions();
  
  // Add missing state for table filtering and visibility
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const handleEdit = async (data: any) => {
    if (selectedQuestion) {
      await updateQuestion(selectedQuestion.id, data);
      setIsEditOpen(false);
      setSelectedQuestion(null);
      toast.success("Question updated successfully");
    }
  };

  const handleDelete = async () => {
    if (selectedQuestion) {
      await deleteQuestion(selectedQuestion.id);
      setIsDeleteDialogOpen(false);
      setSelectedQuestion(null);
      toast.success("Question deleted successfully");
    }
  };

  const getSubjectTitle = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.title : 'Unknown Subject';
  };

  const getDifficultyBadgeClass = (difficulty: DifficultyLevel) => {
    switch(difficulty) {
      case DifficultyLevel.EASY: 
        return "text-green-700 bg-green-100";
      case DifficultyLevel.MEDIUM: 
        return "text-orange-700 bg-orange-100";
      case DifficultyLevel.HARD: 
        return "text-red-700 bg-red-100";
      default: 
        return "text-gray-700 bg-gray-100";
    }
  };

  const columns: ColumnDef<Question>[] = [
    {
      id: "index",
      header: "No.",
      cell: ({ row }) => row.index + 1,
    },
    {
      id: "subject",
      header: "Subject",
      accessorFn: (row) => getSubjectTitle(row.subjectId),
      cell: ({ row }) => getSubjectTitle(row.original.subjectId),
    },
    {
      accessorKey: "text",
      header: "Question Text",
      cell: ({ row }) => {
        const text = row.original.text;
        return text.length > 60 ? `${text.substring(0, 60)}...` : text;
      },
    },
    {
      accessorKey: "difficultyLevel",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.original.difficultyLevel;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeClass(difficulty)}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const question = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedQuestion(question);
                  setIsPreviewOpen(true);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View question
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedQuestion(question);
                  setIsEditOpen(true);
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit question
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => {
                    setSelectedQuestion(question);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete question
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: questions,
    columns,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      rowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter questions..."
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="ml-auto w-full md:w-1/3"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          {selectedQuestion && (
            <QuestionPreview question={selectedQuestion} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl">
          {selectedQuestion && (
            <QuestionForm
              subjects={subjects}
              onSubmit={handleEdit}
              isSubmitting={isLoading}
              initialData={{
                text: selectedQuestion.text,
                type: selectedQuestion.type,
                subjectId: selectedQuestion.subjectId,
                difficultyLevel: selectedQuestion.difficultyLevel,
                explanation: selectedQuestion.explanation,
                options: selectedQuestion.options,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionTable;
