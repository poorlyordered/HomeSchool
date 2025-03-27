import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InvitationManagement } from "./InvitationManagement";
import * as auth from "../lib/auth";
import { Invitation, SchoolGuardian } from "../types";

// Mock the auth module
jest.mock("../lib/auth");
const mockedAuth = auth as jest.Mocked<typeof auth>;

describe("InvitationManagement", () => {
  const mockStudentId = "student-123";
  const mockStudentName = "Test Student";
  const mockSchoolId = "school-123";
  const mockOnClose = jest.fn();
  
  const mockInvitations: Invitation[] = [
    {
      id: "inv-1",
      email: "guardian1@example.com",
      role: "guardian",
      student_id: mockStudentId,
      inviter_id: "inviter-1",
      token: "token-1",
      status: "pending",
      created_at: "2025-03-27T12:00:00Z",
      expires_at: "2025-03-29T12:00:00Z",
    },
    {
      id: "inv-2",
      email: "student1@example.com",
      role: "student",
      student_id: mockStudentId,
      inviter_id: "inviter-1",
      token: "token-2",
      status: "accepted",
      created_at: "2025-03-26T12:00:00Z",
      expires_at: "2025-03-28T12:00:00Z",
    },
  ];

  const mockSchoolGuardians: SchoolGuardian[] = [
    {
      id: "sg-1",
      school_id: mockSchoolId,
      email: "schoolguardian1@example.com",
      is_registered: true,
      created_at: "2025-03-27T12:00:00Z",
    },
    {
      id: "sg-2",
      school_id: mockSchoolId,
      email: "schoolguardian2@example.com",
      is_registered: false,
      created_at: "2025-03-27T12:30:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getInvitationsByStudent.mockResolvedValue(mockInvitations);
    mockedAuth.getSchoolGuardians.mockResolvedValue(mockSchoolGuardians);
    mockedAuth.createInvitation.mockResolvedValue({ success: true, invitation: mockInvitations[0] });
    mockedAuth.resendInvitation.mockResolvedValue({ success: true, invitation: mockInvitations[0] });
    mockedAuth.deleteInvitation.mockResolvedValue({ success: true });
  });

  it("renders the component with title", () => {
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    expect(screen.getByText(`Invitations for ${mockStudentName}`)).toBeInTheDocument();
  });

  it("loads and displays invitations", async () => {
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    // Should show loading indicator initially
    expect(screen.getByRole("status")).toBeInTheDocument();
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(mockedAuth.getInvitationsByStudent).toHaveBeenCalledWith(mockStudentId);
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
      expect(screen.getByText("student1@example.com")).toBeInTheDocument();
      expect(screen.getAllByText("guardian")[0]).toBeInTheDocument();
      expect(screen.getAllByText("student")[0]).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
      expect(screen.getByText("accepted")).toBeInTheDocument();
    });
  });

  it("shows empty state when no invitations are found", async () => {
    mockedAuth.getInvitationsByStudent.mockResolvedValue([]);
    
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    await waitFor(() => {
      expect(screen.getByText("No invitations found.")).toBeInTheDocument();
    });
  });

  it("creates a new invitation successfully", async () => {
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("Send New Invitation")).toBeInTheDocument();
    });
    
    // Fill in the email and submit
    const emailInput = screen.getByPlaceholderText("Enter email address");
    fireEvent.change(emailInput, { target: { value: "newinvite@example.com" } });
    
    const sendButton = screen.getByRole("button", { name: /send invitation/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockedAuth.createInvitation).toHaveBeenCalledWith("newinvite@example.com", "guardian", mockStudentId);
      expect(screen.getByText("Invitation sent to newinvite@example.com")).toBeInTheDocument();
    });
  });

  it("loads and displays school guardians when schoolId is provided", async () => {
    render(
      <InvitationManagement 
        studentId={mockStudentId} 
        studentName={mockStudentName} 
        schoolId={mockSchoolId} 
      />
    );
    
    // Wait for school guardians to load
    await waitFor(() => {
      expect(mockedAuth.getSchoolGuardians).toHaveBeenCalledWith(mockSchoolId);
      expect(screen.getByText("Select School Guardian")).toBeInTheDocument();
      
      // Check if the dropdown contains the school guardians
      const dropdown = screen.getByRole("combobox");
      expect(dropdown).toBeInTheDocument();
      
      // Open the dropdown and check options
      fireEvent.click(dropdown);
      expect(screen.getByText("-- Select a school guardian --")).toBeInTheDocument();
      expect(screen.getByText("schoolguardian1@example.com (Registered)")).toBeInTheDocument();
      expect(screen.getByText("schoolguardian2@example.com (Not Registered)")).toBeInTheDocument();
    });
  });

  it("selects a school guardian and fills the email field", async () => {
    render(
      <InvitationManagement 
        studentId={mockStudentId} 
        studentName={mockStudentName} 
        schoolId={mockSchoolId} 
      />
    );
    
    // Wait for school guardians to load
    await waitFor(() => {
      expect(screen.getByText("Select School Guardian")).toBeInTheDocument();
    });
    
    // Select a school guardian from the dropdown
    const dropdown = screen.getByRole("combobox");
    fireEvent.change(dropdown, { target: { value: "sg-1" } });
    
    // Check if the email field is filled with the selected guardian's email
    const emailInput = screen.getByPlaceholderText("Enter email address");
    expect(emailInput).toHaveValue("schoolguardian1@example.com");
    
    // Submit the form
    const sendButton = screen.getByRole("button", { name: /send invitation/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockedAuth.createInvitation).toHaveBeenCalledWith(
        "schoolguardian1@example.com", 
        "guardian", 
        mockStudentId
      );
    });
  });

  it("resends an invitation", async () => {
    // Mock window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
    });
    
    // Find and click the resend button for the pending invitation
    const resendButton = screen.getByTitle("Resend invitation");
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(mockedAuth.resendInvitation).toHaveBeenCalledWith("inv-1");
      expect(screen.getByText("Invitation resent successfully")).toBeInTheDocument();
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("deletes an invitation", async () => {
    // Mock window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first invitation
    const deleteButtons = screen.getAllByTitle("Delete invitation");
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockedAuth.deleteInvitation).toHaveBeenCalledWith("inv-1");
      expect(screen.getByText("Invitation deleted successfully")).toBeInTheDocument();
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <InvitationManagement 
        studentId={mockStudentId} 
        studentName={mockStudentName} 
        onClose={mockOnClose} 
      />
    );
    
    const closeButton = screen.getByRole("button", { name: "×" });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles error when loading invitations fails", async () => {
    mockedAuth.getInvitationsByStudent.mockRejectedValue(new Error("Failed to load invitations"));
    
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to load invitations")).toBeInTheDocument();
    });
  });

  it("handles error when creating invitation fails", async () => {
    mockedAuth.createInvitation.mockResolvedValue({ 
      success: false, 
      message: "An invitation for this email already exists" 
    });
    
    render(<InvitationManagement studentId={mockStudentId} studentName={mockStudentName} />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText("Send New Invitation")).toBeInTheDocument();
    });
    
    // Fill in the email and submit
    const emailInput = screen.getByPlaceholderText("Enter email address");
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });
    
    const sendButton = screen.getByRole("button", { name: /send invitation/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockedAuth.createInvitation).toHaveBeenCalledWith("existing@example.com", "guardian", mockStudentId);
      expect(screen.getByText("An invitation for this email already exists")).toBeInTheDocument();
    });
  });
});
