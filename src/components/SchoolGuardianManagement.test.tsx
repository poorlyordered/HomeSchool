import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SchoolGuardianManagement } from "./SchoolGuardianManagement";
import * as auth from "../lib/auth";
import { SchoolGuardian } from "../types";

// Mock the auth module
jest.mock("../lib/auth");
const mockedAuth = auth as jest.Mocked<typeof auth>;

describe("SchoolGuardianManagement", () => {
  const mockSchoolId = "school-123";
  const mockOnClose = jest.fn();
  
  const mockSchoolGuardians: SchoolGuardian[] = [
    {
      id: "sg-1",
      school_id: mockSchoolId,
      email: "guardian1@example.com",
      is_registered: true,
      created_at: "2025-03-27T12:00:00Z",
    },
    {
      id: "sg-2",
      school_id: mockSchoolId,
      email: "guardian2@example.com",
      is_registered: false,
      created_at: "2025-03-27T12:30:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.getSchoolGuardians.mockResolvedValue(mockSchoolGuardians);
    mockedAuth.addSchoolGuardian.mockResolvedValue({ success: true, message: "Guardian added successfully" });
    mockedAuth.removeSchoolGuardian.mockResolvedValue({ success: true, message: "Guardian removed successfully" });
  });

  it("renders the component with title", () => {
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    expect(screen.getByText("School Guardians")).toBeInTheDocument();
  });

  it("loads and displays school guardians", async () => {
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    // Should show loading indicator initially
    expect(screen.getByRole("status")).toBeInTheDocument();
    
    // Wait for guardians to load
    await waitFor(() => {
      expect(mockedAuth.getSchoolGuardians).toHaveBeenCalledWith(mockSchoolId);
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
      expect(screen.getByText("guardian2@example.com")).toBeInTheDocument();
      expect(screen.getByText("Registered")).toBeInTheDocument();
      expect(screen.getByText("Not Registered")).toBeInTheDocument();
    });
  });

  it("shows empty state when no guardians are found", async () => {
    mockedAuth.getSchoolGuardians.mockResolvedValue([]);
    
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    await waitFor(() => {
      expect(screen.getByText("No school guardians found.")).toBeInTheDocument();
    });
  });

  it("adds a new guardian successfully", async () => {
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    // Wait for guardians to load
    await waitFor(() => {
      expect(screen.getByText("Add Guardian to School")).toBeInTheDocument();
    });
    
    // Fill in the email and submit
    const emailInput = screen.getByPlaceholderText("Enter email address");
    fireEvent.change(emailInput, { target: { value: "newguardian@example.com" } });
    
    const addButton = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockedAuth.addSchoolGuardian).toHaveBeenCalledWith(mockSchoolId, "newguardian@example.com");
      expect(screen.getByText("Guardian added successfully")).toBeInTheDocument();
    });
  });

  it("shows error when adding guardian fails", async () => {
    mockedAuth.addSchoolGuardian.mockResolvedValue({ 
      success: false, 
      message: "This guardian is already associated with this school" 
    });
    
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    // Wait for guardians to load
    await waitFor(() => {
      expect(screen.getByText("Add Guardian to School")).toBeInTheDocument();
    });
    
    // Fill in the email and submit
    const emailInput = screen.getByPlaceholderText("Enter email address");
    fireEvent.change(emailInput, { target: { value: "existingguardian@example.com" } });
    
    const addButton = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockedAuth.addSchoolGuardian).toHaveBeenCalledWith(mockSchoolId, "existingguardian@example.com");
      expect(screen.getByText("This guardian is already associated with this school")).toBeInTheDocument();
    });
  });

  it("removes a guardian successfully", async () => {
    // Mock window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    // Wait for guardians to load
    await waitFor(() => {
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
    });
    
    // Find and click the remove button for the first guardian
    const removeButtons = screen.getAllByTitle("Remove guardian from school");
    fireEvent.click(removeButtons[0]);
    
    await waitFor(() => {
      expect(mockedAuth.removeSchoolGuardian).toHaveBeenCalledWith("sg-1");
      expect(screen.getByText("Guardian removed successfully")).toBeInTheDocument();
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("does not remove guardian when confirmation is canceled", async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);
    
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    // Wait for guardians to load
    await waitFor(() => {
      expect(screen.getByText("guardian1@example.com")).toBeInTheDocument();
    });
    
    // Find and click the remove button for the first guardian
    const removeButtons = screen.getAllByTitle("Remove guardian from school");
    fireEvent.click(removeButtons[0]);
    
    // Verify removeSchoolGuardian was not called
    expect(mockedAuth.removeSchoolGuardian).not.toHaveBeenCalled();
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it("calls onClose when close button is clicked", () => {
    render(<SchoolGuardianManagement schoolId={mockSchoolId} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole("button", { name: "×" });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles error when loading guardians fails", async () => {
    mockedAuth.getSchoolGuardians.mockRejectedValue(new Error("Failed to load guardians"));
    
    render(<SchoolGuardianManagement schoolId={mockSchoolId} />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to load school guardians")).toBeInTheDocument();
    });
  });
});
