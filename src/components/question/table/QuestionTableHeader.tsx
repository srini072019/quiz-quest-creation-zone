
import React from "react";
import {
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";

const QuestionTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">No.</TableHead>
        <TableHead className="w-[180px]">Course Name</TableHead>
        <TableHead>Question Text</TableHead>
        <TableHead className="w-[100px] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default QuestionTableHeader;
