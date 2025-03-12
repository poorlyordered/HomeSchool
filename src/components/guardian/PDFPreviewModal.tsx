import { PDFCustomizationOptions } from "../../hooks/usePdfGeneration";

interface PDFPreviewModalProps {
  show: boolean;
  url: string | null;
  options: PDFCustomizationOptions;
  onClose: () => void;
  onDownload: () => void;
  onOptionChange: (newOptions: PDFCustomizationOptions) => void;
}

export function PDFPreviewModal({
  show,
  url,
  options,
  onClose,
  onDownload,
  onOptionChange,
}: PDFPreviewModalProps) {
  if (!show || !url) return null;

  const handleOptionChange = (
    key: keyof PDFCustomizationOptions,
    value: boolean,
  ) => {
    onOptionChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Transcript Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <iframe
            src={url}
            className="w-full h-full border"
            title="PDF Preview"
          />
        </div>

        <div className="p-4 border-t flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeGPA"
                  checked={options.includeGPA}
                  onChange={(e) =>
                    handleOptionChange("includeGPA", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeGPA" className="text-sm text-gray-700">
                  Include GPA
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeTestScores"
                  checked={options.includeTestScores}
                  onChange={(e) =>
                    handleOptionChange("includeTestScores", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="includeTestScores"
                  className="text-sm text-gray-700"
                >
                  Include Test Scores
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
