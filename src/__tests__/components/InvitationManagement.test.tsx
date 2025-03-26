import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { InvitationManagement } from "../../components/InvitationManagement";
import {
  createInvitation,
  resendInvitation,
  deleteInvitation,
  getInvitationsByStudent,
} from "../../lib/auth";
import { handleAndDisplayError } from "../../lib/errorHandling";
import type { Invitation } from "../../types";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  createInvitation: jest.fn(),
  resendInvitation: jest.fn(),
  deleteInvitation: jest.fn(),
  getInvitationsByStudent: jest.fn(),
}));

// Mock the error handling
jest.mock("../../lib/errorHandling", () => ({
  handleAndDisplayError: jest.fn(),
}));

// Mock window.confirm
const originalConfirm = window.confirm;
beforeAll(() => {
  window.confirm = jest.fn();
});

afterAll(() => {
  window.confirm = originalConfirm;
});

describe("InvitationManagement Component", () => {
  jest.useFakeTimers(); // Add timer mocking
  const mockStudentId = "student-1";
  const mockStudentName = "John Doe";
  const mockOnClose = jest.fn();

  // Mock invitation data
  const mockInvitations: Invitation[] = [
    {
      id: "inv-1",
      email: "guardian@example.com",
      role: "guardian",
      student_id: mockStudentId,
      inviter_id: "user-123",
      token: "token-1",
      status: "pending",
      created_at: "2025-01-01T00:00:00Z",
      expires_at: "2025-01-03T00:00:00Z",
    },
    {
      id: "inv-2",
      email: "student@example.com",
      role: "student",
      student_id: mockStudentId,
      inviter_id: "user-123",
      token: "token-2",
      status: "accepted",
      created_at: "2025-01-02T00:00:00Z",
      expires_at: "2025-01-04T00:00:00Z",
    },
    {
      id: "inv-3",
      email: "expired@example.com",
      role: "guardian",
      student_id: mockStudentId,
      inviter_id: "user-123",
      token: "token-3",
      status: "expired",
      created_at: "2025-01-03T00:00:00Z",
      expires_at: "2025-01-05T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful invitations loading
    (getInvitationsByStudent as jest.Mock).mockResolvedValue(mockInvitations);
  });

  it("renders loading state initially", async () => {
    // Mock invitations data to not resolve immediately
    (getInvitationsByStudent as jest.Mock).mockReturnValue(
      new Promise(() => {}),
    );

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Check for loading state
    expect(
      screen.getByText(`Invitations for ${mockStudentName}`),
    ).toBeInTheDocument();

    // Check for loading spinner
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("displays invitations list after loading", async () => {
    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Check for invitation information
    expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    expect(screen.getByText("student@example.com")).toBeInTheDocument();
    expect(screen.getByText("expired@example.com")).toBeInTheDocument();

    // Check for status badges
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("accepted")).toBeInTheDocument();
    expect(screen.getByText("expired")).toBeInTheDocument();
  });

  it("displays empty state when no invitations are found", async () => {
    // Mock empty invitations list
    (getInvitationsByStudent as jest.Mock).mockResolvedValue([]);

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("No invitations found.")).toBeInTheDocument();
    });
  });

  it("allows creating a new invitation", async () => {
    // Mock successful invitation creation
    (createInvitation as jest.Mock).mockResolvedValue({
      success: true,
      invitation: {
        id: "inv-4",
        email: "newinvite@example.com",
        role: "guardian",
      },
    });

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "newinvite@example.com" },
    });

    // Select role (guardian is default)
    const roleSelect = screen.getByLabelText(/role/i);
    expect(roleSelect).toHaveValue("guardian");

    // Submit the form by clicking the submit button
    const submitButton = screen.getByText(/send invitation/i);
    fireEvent.click(submitButton);

    // Check that createInvitation was called with the correct arguments
    expect(createInvitation).toHaveBeenCalledWith(
      "newinvite@example.com",
      "guardian",
      mockStudentId,
    );

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText(/Invitation sent to newinvite@example.com/i),
      ).toBeInTheDocument();
    });

    // Check that getInvitationsByStudent was called again to refresh the list
    expect(getInvitationsByStudent).toHaveBeenCalledTimes(2);
  });

  it("handles error when creating an invitation", async () => {
    // Mock error when creating invitation
    (createInvitation as jest.Mock).mockResolvedValue({
      success: false,
      message: "Failed to create invitation",
    });

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "error@example.com" },
    });

    // Submit the form by clicking the submit button
    const submitButton = screen.getByText(/send invitation/i);
    fireEvent.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to create invitation"),
      ).toBeInTheDocument();
    });
  });

  it("allows resending an invitation", async () => {
    // Mock successful invitation resend
    (resendInvitation as jest.Mock).mockResolvedValue({
      success: true,
      message: "Invitation resent successfully",
    });

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Find and click the resend button for the pending invitation
    const resendButton = screen.getByTitle("Resend invitation");
    fireEvent.click(resendButton);

    // Check that resendInvitation was called with the correct arguments
    expect(resendInvitation).toHaveBeenCalledWith("inv-1");

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText("Invitation resent successfully"),
      ).toBeInTheDocument();
    });

    // Check that getInvitationsByStudent was called again to refresh the list
    expect(getInvitationsByStudent).toHaveBeenCalledTimes(2);
  });

  it("allows deleting an invitation", async () => {
    // Mock confirm to return true
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Mock successful invitation deletion
    (deleteInvitation as jest.Mock).mockResolvedValue({
      success: true,
      message: "Invitation deleted successfully",
    });

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Find and click the delete button for the first invitation
    const deleteButtons = screen.getAllByTitle("Delete invitation");
    fireEvent.click(deleteButtons[0]);

    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this invitation?",
    );

    // Check that deleteInvitation was called with the correct arguments
    expect(deleteInvitation).toHaveBeenCalledWith("inv-1");

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText("Invitation deleted successfully"),
      ).toBeInTheDocument();
    });

    // Check that getInvitationsByStudent was called again to refresh the list
    expect(getInvitationsByStudent).toHaveBeenCalledTimes(2);
  });

  it("cancels invitation deletion when confirm is declined", async () => {
    // Mock confirm to return false
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Find and click the delete button for the first invitation
    const deleteButtons = screen.getAllByTitle("Delete invitation");
    fireEvent.click(deleteButtons[0]);

    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this invitation?",
    );

    // Check that deleteInvitation was not called
    expect(deleteInvitation).not.toHaveBeenCalled();
  });

  it("handles error when loading invitations fails", async () => {
    // Mock error when loading invitations
    (getInvitationsByStudent as jest.Mock).mockRejectedValue(
      new Error("Failed to load invitations"),
    );

    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
      />,
    );

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load invitations"),
      ).toBeInTheDocument();
    });

    // Check that handleAndDisplayError was called
    expect(handleAndDisplayError).toHaveBeenCalled();
  });

  it("closes the modal when close button is clicked", async () => {
    render(
      <InvitationManagement
        studentId={mockStudentId}
        studentName={mockStudentName}
        onClose={mockOnClose}
      />,
    );

    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian@example.com")).toBeInTheDocument();
    });

    // Click the close button
    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
