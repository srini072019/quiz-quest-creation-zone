
const ImportTemplateInfo = () => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Format Requirements</h4>
      <p className="text-sm text-gray-500">
        Your spreadsheet should have the following columns:
      </p>
      <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
        <li><strong>question</strong> - The text of the question</li>
        <li><strong>type</strong> - Question type (multiple_choice, true_false, multiple_answer)</li>
        <li><strong>subject</strong> - The subject name (must match existing subject)</li>
        <li><strong>difficulty</strong> - easy, medium, or hard (optional, defaults to medium)</li>
        <li><strong>options</strong> - Options for answers (separate by semicolon or new line)</li>
        <li><strong>correctAnswers</strong> - Text that identifies correct options</li>
        <li><strong>explanation</strong> - Explanation of the answer (optional)</li>
      </ul>
    </div>
  );
};

export default ImportTemplateInfo;
