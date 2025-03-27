import { render, screen, fireEvent } from "@testing-library/react";
import { TestScores } from "./TestScores";
import type { TestScore } from "../types";

// Mock TestScoreManagement component
jest.mock("./TestScoreManagement", () => ({
  TestScoreManagement: jest.fn(({ onClose, onScoreAdded }) => (
    <div data-testid="test-score-management">
      <button onClick={onClose}>Close</button>
      <button onClick={onScoreAdded}>Add Score</button>
    </div>
  )),
}));

// Mock window event handling
const mockDispatchEvent = jest.fn();
const originalDispatchEvent = window.dispatchEvent;

beforeAll(() => {
  window.dispatchEvent = mockDispatchEvent;
});

afterAll(() => {
  window.dispatchEvent = originalDispatchEvent;
});

describe("TestScores Component", () => {
  jest.useFakeTimers(); // Add timer mocking

  // Mock props
  const mockStudentId = "student-123";
  const mockOnEditScore = jest.fn();
  const mockOnDeleteScore = jest.fn();

  // Mock test scores
  const mockTestScores: TestScore[] = [
    {
      id: "score-1",
      type: "SAT",
      date: "2025-01-15",
      scores: {
        total: 1400,
        sections: [
          { name: "Math", score: 700 },
          { name: "Evidence-Based Reading and Writing", score: 700 },
        ],
      },
    },
    {
      id: "score-2",
      type: "ACT",
      date: "2025-02-20",
      scores: {
        total: 30,
        sections: [
          { name: "English", score: 28 },
          { name: "Math", score: 30 },
          { name: "Reading", score: 32 },
          { name: "Science", score: 30 },
        ],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with header and add button", () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={[]}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Check for header and add button
    expect(screen.getByText("Standardized Test Scores")).toBeInTheDocument();
    expect(screen.getByText("Add Score")).toBeInTheDocument();
  });

  it("displays empty state when no scores are available", () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={[]}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Check that no score cards are rendered
    const scoreCards = document.querySelectorAll(".border.rounded-lg");
    expect(scoreCards.length).toBe(0);
  });

  it("displays test scores correctly", () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Check that both score cards are rendered
    expect(screen.getByText("SAT")).toBeInTheDocument();
    expect(screen.getByText("ACT")).toBeInTheDocument();

    // Check for dates
    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
    expect(screen.getByText("2025-02-20")).toBeInTheDocument();

    // Check for total scores
    const totalScores = screen.getAllByText(/Total Score:/);
    expect(totalScores.length).toBe(2);

    // Check for section scores - use getAllByText and check count
    expect(screen.getAllByText(/Math:/)).toHaveLength(2); // One in SAT, one in ACT
    expect(
      screen.getByText(/Evidence-Based Reading and Writing:/),
    ).toBeInTheDocument();
    expect(screen.getByText(/English:/)).toBeInTheDocument();
    expect(screen.getByText(/Reading:/)).toBeInTheDocument();
    expect(screen.getByText(/Science:/)).toBeInTheDocument();

    // Check for section score values - use getAllByText for values that appear multiple times
    expect(screen.getAllByText("700")).toHaveLength(2);
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getAllByText("30")).toHaveLength(3); // Appears 3 times in the rendered output
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  it("opens TestScoreManagement modal when Add Score button is clicked", async () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Click the Add Score button
    const addButton = screen.getByText("Add Score");
    fireEvent.click(addButton);

    // Check that the TestScoreManagement modal is displayed
    expect(screen.getByTestId("test-score-management")).toBeInTheDocument();
  });

  it("closes TestScoreManagement modal when Close button is clicked", async () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Open the modal
    const addButton = screen.getByText("Add Score");
    fireEvent.click(addButton);

    // Check that the modal is displayed
    expect(screen.getByTestId("test-score-management")).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    // Check that the modal is closed
    expect(
      screen.queryByTestId("test-score-management"),
    ).not.toBeInTheDocument();
  });

  it("dispatches refreshTestScores event when score is added", async () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Open the modal - use a more specific selector
    const addButton = screen.getByRole("button", { name: /Add Score/i });
    fireEvent.click(addButton);

    // Add a score - use a more specific selector for the button in the modal
    fireEvent.click(
      screen.getByText("Add Score", {
        selector: 'div[data-testid="test-score-management"] button',
      }),
    );

    // Check that the event was dispatched
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "refreshTestScores",
      }),
    );

    // Check that the modal is closed
    expect(
      screen.queryByTestId("test-score-management"),
    ).not.toBeInTheDocument();
  });

  it("calls onEditScore when edit button is clicked", async () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Find and click the first edit button - use a more reliable approach
    const editButtons = document.querySelectorAll("button.text-blue-600");
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);
    } else {
      throw new Error("Edit button not found");
    }

    // Check that onEditScore was called with the correct score
    expect(mockOnEditScore).toHaveBeenCalledWith(mockTestScores[0]);
  });

  it("calls onDeleteScore when delete button is clicked", async () => {
    render(
      <TestScores
        studentId={mockStudentId}
        scores={mockTestScores}
        onEditScore={mockOnEditScore}
        onDeleteScore={mockOnDeleteScore}
      />,
    );

    // Find and click the first delete button - use a more reliable approach
    const deleteButtons = document.querySelectorAll("button.text-red-600");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    } else {
      throw new Error("Delete button not found");
    }

    // Check that onDeleteScore was called with the correct score ID
    expect(mockOnDeleteScore).toHaveBeenCalledWith(mockTestScores[0].id);
  });
});
