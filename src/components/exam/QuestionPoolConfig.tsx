
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Subject } from "@/types/subject.types";
import { DifficultyLevel } from "@/types/question.types";
import { QuestionPool, SubjectPoolItem } from "@/types/question-pool.types";

interface QuestionPoolConfigProps {
  subjects: Subject[];
  initialPool?: QuestionPool;
  onPoolChange: (pool: QuestionPool) => void;
}

const QuestionPoolConfig = ({ 
  subjects, 
  initialPool, 
  onPoolChange 
}: QuestionPoolConfigProps) => {
  const [pool, setPool] = useState<QuestionPool>(
    initialPool || {
      totalQuestions: 10,
      subjects: []
    }
  );

  // Add a subject to the pool
  const addSubject = () => {
    if (subjects.length === 0) return;
    
    // Find a subject not already in the pool
    const availableSubjects = subjects.filter(
      subject => !pool.subjects.some(poolSubject => poolSubject.subjectId === subject.id)
    );
    
    if (availableSubjects.length === 0) return;
    
    const newSubjectItem: SubjectPoolItem = {
      subjectId: availableSubjects[0].id,
      count: 5
    };
    
    const updatedPool = {
      ...pool,
      subjects: [...pool.subjects, newSubjectItem]
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  // Remove a subject from the pool
  const removeSubject = (index: number) => {
    const updatedSubjects = [...pool.subjects];
    updatedSubjects.splice(index, 1);
    
    const updatedPool = {
      ...pool,
      subjects: updatedSubjects
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  // Update subject or count in the pool
  const updateSubjectItem = (index: number, field: string, value: any) => {
    const updatedSubjects = [...pool.subjects];
    
    if (field === 'subjectId') {
      updatedSubjects[index].subjectId = value;
    } else if (field === 'count') {
      updatedSubjects[index].count = parseInt(value, 10);
    }
    
    const updatedPool = {
      ...pool,
      subjects: updatedSubjects
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  // Update total questions
  const updateTotalQuestions = (value: string) => {
    const total = parseInt(value, 10);
    if (isNaN(total) || total < 1) return;
    
    const updatedPool = {
      ...pool,
      totalQuestions: total
    };
    
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  useEffect(() => {
    // Initialize with first subject if pool is empty and subjects exist
    if (pool.subjects.length === 0 && subjects.length > 0) {
      const initialSubjectItem: SubjectPoolItem = {
        subjectId: subjects[0].id,
        count: 5
      };
      
      const updatedPool = {
        ...pool,
        subjects: [initialSubjectItem]
      };
      
      setPool(updatedPool);
      onPoolChange(updatedPool);
    }
  }, [subjects]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalQuestions">Total Questions</Label>
          <Input
            id="totalQuestions"
            type="number"
            min="1"
            value={pool.totalQuestions}
            onChange={(e) => updateTotalQuestions(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Number of questions to randomly select from the pool
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Subject Distribution</h4>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={addSubject}
            disabled={subjects.length === pool.subjects.length}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        </div>

        {pool.subjects.map((subjectItem, index) => (
          <div key={index} className="flex items-end gap-2 p-3 border rounded-md">
            <div className="flex-1">
              <Label htmlFor={`subject-${index}`}>Subject</Label>
              <Select
                value={subjectItem.subjectId}
                onValueChange={(value) => updateSubjectItem(index, 'subjectId', value)}
              >
                <SelectTrigger id={`subject-${index}`}>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter(subject => 
                      subject.id === subjectItem.subjectId || 
                      !pool.subjects.some(item => item.subjectId === subject.id)
                    )
                    .map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.title}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-24">
              <Label htmlFor={`count-${index}`}>Count</Label>
              <Input
                id={`count-${index}`}
                type="number"
                min="1"
                value={subjectItem.count}
                onChange={(e) => updateSubjectItem(index, 'count', e.target.value)}
              />
            </div>
            
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="mb-[2px]"
              onClick={() => removeSubject(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {pool.subjects.length === 0 && (
          <div className="text-center p-4 border rounded-md text-muted-foreground">
            No subjects added to the pool yet. Click "Add Subject" to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPoolConfig;
