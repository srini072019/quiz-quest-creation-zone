
import { useState } from "react";
import { Question, QuestionType } from "@/types/question.types";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuestionPreviewProps {
  question: Question;
}

const QuestionPreview = ({ question }: QuestionPreviewProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const handleSingleOptionChange = (value: string) => {
    setSelectedOptions([value]);
  };

  const handleMultipleOptionChange = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleCheckAnswer = () => {
    // This is just a preview, so we'll show the correct answers
    const correctOptions = question.options
      .filter(option => option.isCorrect)
      .map(option => option.id);
      
    setSelectedOptions(correctOptions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{question.text}</h3>
            </div>
            
            {question.type === QuestionType.MULTIPLE_CHOICE && (
              <RadioGroup 
                value={selectedOptions[0] || ""} 
                onValueChange={handleSingleOptionChange}
              >
                {question.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center space-x-2 p-2 rounded ${
                      selectedOptions.includes(option.id) && option.isCorrect 
                        ? "bg-green-50 border border-green-200" 
                        : selectedOptions.includes(option.id) && !option.isCorrect
                        ? "bg-red-50 border border-red-200"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === QuestionType.MULTIPLE_ANSWER && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center space-x-2 p-2 rounded ${
                      selectedOptions.includes(option.id) && option.isCorrect 
                        ? "bg-green-50 border border-green-200" 
                        : selectedOptions.includes(option.id) && !option.isCorrect
                        ? "bg-red-50 border border-red-200"
                        : ""
                    }`}
                  >
                    <Checkbox 
                      id={option.id} 
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => handleMultipleOptionChange(option.id)}
                    />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </div>
            )}

            {question.type === QuestionType.TRUE_FALSE && (
              <RadioGroup 
                value={selectedOptions[0] || ""} 
                onValueChange={handleSingleOptionChange}
              >
                {question.options.map((option) => (
                  <div 
                    key={option.id} 
                    className={`flex items-center space-x-2 p-2 rounded ${
                      selectedOptions.includes(option.id) && option.isCorrect 
                        ? "bg-green-50 border border-green-200" 
                        : selectedOptions.includes(option.id) && !option.isCorrect
                        ? "bg-red-50 border border-red-200"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </CardContent>
      </Card>

      {question.explanation && selectedOptions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-1">Explanation:</h4>
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleCheckAnswer}>
          Show Answer
        </Button>
      </div>
    </div>
  );
};

export default QuestionPreview;
