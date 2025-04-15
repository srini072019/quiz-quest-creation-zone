
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { Subject } from "@/types/subject.types";

interface QuestionTableHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterSubject: string;
  onFilterChange: (value: string) => void;
  subjects: Subject[];
}

const QuestionTableHeader = ({
  searchQuery,
  onSearchChange,
  filterSubject,
  onFilterChange,
  subjects,
}: QuestionTableHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-grow">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full md:w-72">
        <Select value={filterSubject} onValueChange={onFilterChange}>
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
  );
};

export default QuestionTableHeader;
