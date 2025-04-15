
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DifficultyLevel, Question } from "@/types/question.types";
import { Subject } from "@/types/subject.types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreHorizontal } from "lucide-react"

interface QuestionTableProps {
  questions: Question[];
  subjects: Subject[];
}

const QuestionTable = ({ questions, subjects }: QuestionTableProps) => {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")

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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(question.id)}
                >
                  Copy question ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View question</DropdownMenuItem>
                <DropdownMenuItem>Edit question</DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>Delete question</DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        your question from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
    </div>
  );
};

export default QuestionTable;
