import { useState, useCallback } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { TestScoreManagement } from "./TestScoreManagement";
import type { TestScore } from "../types";

interface TestScoresProps {
  studentId: string;
  scores: TestScore[];
  onEditScore: (score: TestScore) => void;
  onDeleteScore: (id: string) => void;
}

export function TestScores({
  studentId,
  scores,
  onEditScore,
  onDeleteScore,
}: TestScoresProps) {
  const [showTestScoreManagement, setShowTestScoreManagement] = useState(false);

  // Move useCallback hooks to the top level
  const handleClose = useCallback(() => setShowTestScoreManagement(false), []);
  const handleScoreAdded = useCallback(() => {
    setShowTestScoreManagement(false);
    // Let parent know to refresh scores
    window.dispatchEvent(new CustomEvent("refreshTestScores"));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Standardized Test Scores
        </h2>
        <button
          onClick={() => setShowTestScoreManagement(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Add Score
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scores.map((score) => (
          <div key={score.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{score.type}</h3>
                <p className="text-sm text-gray-600">{score.date}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditScore(score)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => onDeleteScore(score.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Score:</span>
                <span>{score.scores.total}</span>
              </div>
              {score.scores.sections.map((section, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span>{section.name}:</span>
                  <span>{section.score}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showTestScoreManagement && (
        <TestScoreManagement
          studentId={studentId}
          onClose={handleClose}
          onScoreAdded={handleScoreAdded}
        />
      )}
    </div>
  );
}
