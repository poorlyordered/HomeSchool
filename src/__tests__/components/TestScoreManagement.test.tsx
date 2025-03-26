import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestScoreManagement } from "../../components/TestScoreManagement";
import { supabase } from "../../lib/supabase";
import {
  resetSupabaseMocks,
  mockTableData,
  mockTableError,
} from "../helpers/supabaseTestHelpers";

// No need to mock supabase directly - it's automatically mocked via jest.config.cjs

jest.mock("../../lib/errorHandling", () => ({
  handleAndDisplayError: jest.fn(),
}));

describe("TestScoreManagement Component", () => {
  // Mock props
  const mockStudentId = "student-123";
  const mockOnClose = jest.fn();
  const mockOnScoreAdded = jest.fn();

  // Mock Supabase responses
  const mockTestScoreInsertResponse = {
    id: "test-score-123",
    student_id: mockStudentId,
    type: "SAT",
    date: "2025-03-15",
    total_score: 1400,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetSupabaseMocks();

    // Setup default mock behavior for test scores
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "test_scores") {
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: mockTestScoreInsertResponse,
              error: null,
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      } else if (table === "test_sections") {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return supabase;
    });
  });

  it("renders the component with SAT test type by default", () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Check for header and close button
    expect(screen.getByText("Add Test Score")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText("Test Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Test Date")).toBeInTheDocument();
    expect(screen.getByText("Test Sections")).toBeInTheDocument();

    // Check that SAT sections are displayed by default
    expect(screen.getByDisplayValue("Math")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Evidence-Based Reading and Writing"),
    ).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Test Score" }),
    ).toBeInTheDocument();
  });

  it("switches test sections when test type is changed", async () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Initially SAT sections should be displayed
    expect(screen.getByDisplayValue("Math")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Evidence-Based Reading and Writing"),
    ).toBeInTheDocument();

    // Change test type to ACT
    const testTypeSelect = screen.getByLabelText("Test Type");
    await userEvent.selectOptions(testTypeSelect, "ACT");

    // Check that ACT sections are now displayed
    expect(screen.getByDisplayValue("English")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Math")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Reading")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Science")).toBeInTheDocument();
  });

  it("validates section scores based on test type", async () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Fill in test date
    const dateInput = screen.getByLabelText("Test Date");
    await userEvent.type(dateInput, "2025-03-15");

    // Enter invalid score for SAT Math (above max 800)
    const scoreInputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(scoreInputs[0]);
    await userEvent.type(scoreInputs[0], "900");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: "Save Test Score" });
    await userEvent.click(saveButton);

    // Check for validation error
    await waitFor(() => {
      expect(
        screen.getByText(
          /Invalid score for Math. Score must be between 200 and 800./i,
        ),
      ).toBeInTheDocument();
    });

    // Change to ACT
    const testTypeSelect = screen.getByLabelText("Test Type");
    await userEvent.selectOptions(testTypeSelect, "ACT");

    // Enter invalid score for ACT English (above max 36)
    const actScoreInputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(actScoreInputs[0]);
    await userEvent.type(actScoreInputs[0], "40");

    // Submit the form
    await userEvent.click(saveButton);

    // Check for validation error
    await waitFor(() => {
      expect(
        screen.getByText(
          /Invalid score for English. Score must be between 1 and 36./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("submits the form with valid data", async () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Fill in test date
    const dateInput = screen.getByLabelText("Test Date");
    await userEvent.type(dateInput, "2025-03-15");

    // Enter valid scores for SAT
    const scoreInputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(scoreInputs[0]);
    await userEvent.type(scoreInputs[0], "700");
    await userEvent.clear(scoreInputs[1]);
    await userEvent.type(scoreInputs[1], "700");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: "Save Test Score" });
    await userEvent.click(saveButton);

    // Check that Supabase was called with correct data
    expect(supabase.from).toHaveBeenCalledWith("test_scores");
    expect(supabase.from("test_scores").insert).toHaveBeenCalledWith([
      {
        student_id: mockStudentId,
        type: "SAT",
        date: "2025-03-15",
        total_score: 1400,
      },
    ]);

    // Check that sections were inserted
    expect(supabase.from).toHaveBeenCalledWith("test_sections");
    expect(supabase.from("test_sections").insert).toHaveBeenCalledWith([
      {
        test_score_id: "test-score-123",
        name: "Math",
        score: 700,
      },
      {
        test_score_id: "test-score-123",
        name: "Evidence-Based Reading and Writing",
        score: 700,
      },
    ]);

    // Check that onScoreAdded was called
    expect(mockOnScoreAdded).toHaveBeenCalled();

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles error during test score insertion", async () => {
    // Mock test score insertion error using our helper
    mockTableError("test_scores", {
      message: "Failed to insert test score",
    });

    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Fill in test date
    const dateInput = screen.getByLabelText("Test Date");
    await userEvent.type(dateInput, "2025-03-15");

    // Enter valid scores for SAT
    const scoreInputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(scoreInputs[0]);
    await userEvent.type(scoreInputs[0], "700");
    await userEvent.clear(scoreInputs[1]);
    await userEvent.type(scoreInputs[1], "700");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: "Save Test Score" });
    await userEvent.click(saveButton);

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to insert test score"),
      ).toBeInTheDocument();
    });

    // Check that onScoreAdded was not called
    expect(mockOnScoreAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("handles error during test sections insertion", async () => {
    // Setup successful test score insertion using our helper
    mockTableData("test_scores", mockTestScoreInsertResponse);

    // Setup test sections insertion error
    mockTableError("test_sections", {
      message: "Failed to insert test sections",
    });

    // Setup delete functionality for cleanup
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "test_scores") {
        return {
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return supabase;
    });

    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Fill in test date
    const dateInput = screen.getByLabelText("Test Date");
    await userEvent.type(dateInput, "2025-03-15");

    // Enter valid scores for SAT
    const scoreInputs = screen.getAllByRole("spinbutton");
    await userEvent.clear(scoreInputs[0]);
    await userEvent.type(scoreInputs[0], "700");
    await userEvent.clear(scoreInputs[1]);
    await userEvent.type(scoreInputs[1], "700");

    // Submit the form
    const saveButton = screen.getByRole("button", { name: "Save Test Score" });
    await userEvent.click(saveButton);

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to insert test sections"),
      ).toBeInTheDocument();
    });

    // Check that test score was deleted due to sections error
    expect(supabase.from).toHaveBeenCalledWith("test_scores");
    expect(supabase.from("test_scores").delete).toHaveBeenCalled();
    expect(supabase.from("test_scores").delete().eq).toHaveBeenCalledWith(
      "id",
      "test-score-123",
    );

    // Check that onScoreAdded was not called
    expect(mockOnScoreAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("closes the modal when Cancel button is clicked", async () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Click the Cancel button
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("closes the modal when close (×) button is clicked", async () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Click the close button
    const closeButton = screen.getByRole("button", { name: "×" });
    await userEvent.click(closeButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows score range hints for each section", () => {
    render(
      <TestScoreManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onScoreAdded={mockOnScoreAdded}
      />,
    );

    // Check for SAT score range hints
    expect(screen.getByText("(200-800)")).toBeInTheDocument();

    // Change to ACT
    const testTypeSelect = screen.getByLabelText("Test Type");
    fireEvent.change(testTypeSelect, { target: { value: "ACT" } });

    // Check for ACT score range hints
    expect(screen.getAllByText("(1-36)").length).toBe(4);
  });
});
