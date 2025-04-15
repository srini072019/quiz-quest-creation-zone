
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subject } from "@/types/subject.types";
import { DifficultyLevel } from "@/types/question.types";
import { QuestionPool, QuestionPoolCondition } from "@/types/question-pool.types";
import { Plus, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface QuestionPoolConfigProps {
  subjects: Subject[];
  initialPool?: QuestionPool;
  onPoolChange: (pool: QuestionPool) => void;
}

const QuestionPoolConfig = ({
  subjects,
  initialPool,
  onPoolChange,
}: QuestionPoolConfigProps) => {
  const [pool, setPool] = useState<QuestionPool>(
    initialPool || {
      id: uuidv4(),
      name: "Default Pool",
      description: "Randomized question pool",
      conditions: [{ count: 5 }],
    }
  );

  const handleNameChange = (name: string) => {
    const updatedPool = { ...pool, name };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const handleDescriptionChange = (description: string) => {
    const updatedPool = { ...pool, description };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const handleAddCondition = () => {
    const updatedPool = {
      ...pool,
      conditions: [...pool.conditions, { count: 1 }],
    };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = pool.conditions.filter((_, i) => i !== index);
    const updatedPool = {
      ...pool,
      conditions: updatedConditions,
    };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const handleConditionChange = (index: number, field: keyof QuestionPoolCondition, value: any) => {
    const updatedConditions = [...pool.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value,
    };
    
    const updatedPool = {
      ...pool,
      conditions: updatedConditions,
    };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  const handleSubjectChange = (index: number, value: string[]) => {
    const updatedConditions = [...pool.conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      subjectIds: value,
    };
    
    const updatedPool = {
      ...pool,
      conditions: updatedConditions,
    };
    setPool(updatedPool);
    onPoolChange(updatedPool);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="pool-name">Pool Name</Label>
          <Input
            id="pool-name"
            placeholder="Enter pool name"
            value={pool.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pool-description">Description</Label>
          <Input
            id="pool-description"
            placeholder="Enter pool description"
            value={pool.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Conditions</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCondition}
          >
            <Plus size={16} className="mr-1" /> Add Condition
          </Button>
        </div>

        {pool.conditions.map((condition, index) => (
          <Card key={index}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                Condition {index + 1}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCondition(index)}
                  disabled={pool.conditions.length <= 1}
                >
                  <Trash size={14} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`condition-${index}-difficulty`}>
                    Difficulty
                  </Label>
                  <Select
                    value={condition.difficultyLevel}
                    onValueChange={(value) =>
                      handleConditionChange(index, "difficultyLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={undefined}>Any difficulty</SelectItem>
                      <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                      <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={DifficultyLevel.HARD}>Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`condition-${index}-subjects`}>Subjects</Label>
                  <Select
                    value={condition.subjectIds?.[0]}
                    onValueChange={(value) =>
                      handleSubjectChange(index, [value])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={undefined}>Any subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`condition-${index}-count`}>
                    Number of Questions
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    id={`condition-${index}-count`}
                    value={condition.count}
                    onChange={(e) =>
                      handleConditionChange(index, "count", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuestionPoolConfig;
