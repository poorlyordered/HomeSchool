import { FileDown } from "lucide-react";

interface TranscriptSectionProps {
  issueDate: string;
  administrator: string;
  onPreviewClick: () => void;
  isGenerating: boolean;
}

export function TranscriptSection({
  issueDate,
  administrator,
  onPreviewClick,
  isGenerating,
}: TranscriptSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Issue Date: {issueDate}</p>
          <p className="text-sm text-gray-600">
            Administrator: {administrator}
          </p>
        </div>
        <button
          onClick={onPreviewClick}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={isGenerating}
        >
          <FileDown size={20} />
          {isGenerating ? "Generating Preview..." : "Preview Transcript"}
        </button>
      </div>
    </div>
  );
}
