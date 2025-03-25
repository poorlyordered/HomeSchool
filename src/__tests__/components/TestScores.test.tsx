import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestScores } from "../../components/TestScores";
import type { TestScore } from "../../types";

// Mock TestScoreManagement component
jest.mock("../../components/TestScoreManagement", () => ({
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

    // Check for section scores
    expect(screen.getByText("Math:")).toBeInTheDocument();
    expect(
      screen.getByText("Evidence-Based Reading and Writing:"),
    ).toBeInTheDocument();
    expect(screen.getByText("English:")).toBeInTheDocument();
    expect(screen.getByText("Reading:")).toBeInTheDocument();
    expect(screen.getByText("Science:")).toBeInTheDocument();

    // Check for section score values
    expect(screen.getByText("700")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
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
    await userEvent.click(addButton);

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
    await userEvent.click(addButton);

    // Check that the modal is displayed
    expect(screen.getByTestId("test-score-management")).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText("Close");
    await userEvent.click(closeButton);

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

    // Open the modal
    const addButton = screen.getByText("Add Score");
    await userEvent.click(addButton);

    // Add a score
    const addScoreButton = screen.getByText("Add Score");
    await userEvent.click(addScoreButton);

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

    // Find and click the first edit button
    const editButtons = screen.getAllByRole("button", { name: "" });
    // Filter to find the edit buttons (they contain the Pencil icon)
    const firstEditButton = editButtons.find((button) =>
      button.innerHTML.includes("Pencil"),
    );

    if (firstEditButton) {
      await userEvent.click(firstEditButton);
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

    // Find and click the first delete button
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    // Filter to find the delete buttons (they contain the Trash2 icon)
    const firstDeleteButton = deleteButtons.find((button) =>
      button.innerHTML.includes("Trash2"),
    );

    if (firstDeleteButton) {
      await userEvent.click(firstDeleteButton);
    } else {
      throw new Error("Delete button not found");
    }

    // Check that onDeleteScore was called with the correct score ID
    expect(mockOnDeleteScore).toHaveBeenCalledWith(mockTestScores[0].id);
  });
});
