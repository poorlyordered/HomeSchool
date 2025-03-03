import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentDashboard } from "../../components/StudentDashboard";
import { signOut } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import type { User } from "../../types";

// Mock dependencies
jest.mock("../../lib/auth", () => ({
  signOut: jest.fn(),
}));

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

// Mock child components
jest.mock("../../components/AccountSettings", () => ({
  AccountSettings: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="account-settings-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock window.location
const originalLocation = window.location;
beforeAll(() => {
  // @ts-expect-error - Intentionally modifying window.location for testing
  delete window.location;
  window.location = { href: "" } as Location;
});

afterAll(() => {
  window.location = originalLocation;
});

describe("StudentDashboard Component", () => {
  // Mock user data
  const mockUser: User = {
    id: "user-123",
    email: "student@example.com",
    profile: {
      id: "profile-123",
      email: "student@example.com",
      role: "student",
      name: "Student Name",
      created_at: "2025-01-01",
    },
  };

  // Mock student data
  const mockStudentData = {
    id: "student-123",
    info: {
      id: "S001",
      name: "Student Name",
      birthDate: "2010-01-01",
      graduationDate: "2028-05-15",
    },
    school: {
      id: "school-123",
      name: "Test School",
      address: "123 School St",
      phone: "555-1234",
      created_at: "2025-01-01",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset window.location.href
    window.location.href = "";
  });

  it("renders loading state initially", () => {
    // Mock Supabase response to not resolve immediately
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue(new Promise(() => {})),
        }),
      }),
    });

    render(<StudentDashboard user={mockUser} />);

    // Check for loading spinner
    const spinnerElement = document.querySelector(".animate-spin");
    expect(spinnerElement).not.toBeNull();
  });

  it("shows no student record message when no data is found", async () => {
    // Mock Supabase response for no student data
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
    });

    render(<StudentDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Check for no student record message
    expect(screen.getByText(/No Student Record Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please contact your guardian to set up your student profile/i,
      ),
    ).toBeInTheDocument();
  });

  it("displays student and school information correctly", async () => {
    // Mock Supabase response with student data
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStudentData }),
        }),
      }),
    });

    render(<StudentDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Check for school information
    expect(screen.getByText(mockStudentData.school.name)).toBeInTheDocument();
    expect(
      screen.getByText(mockStudentData.school.address),
    ).toBeInTheDocument();
    expect(screen.getByText(mockStudentData.school.phone)).toBeInTheDocument();

    // Check for student information
    expect(screen.getByText(mockStudentData.info.name)).toBeInTheDocument();
    expect(
      screen.getByText(`Student ID: ${mockStudentData.info.id}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Expected Graduation: ${mockStudentData.info.graduationDate}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Date of Birth: ${mockStudentData.info.birthDate}`),
    ).toBeInTheDocument();

    // Check for course history and test scores sections
    expect(screen.getByText("Course History")).toBeInTheDocument();
    expect(screen.getByText("Standardized Test Scores")).toBeInTheDocument();
  });

  it("opens account settings modal when Account Settings button is clicked", async () => {
    // Mock Supabase response with student data
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStudentData }),
        }),
      }),
    });

    render(<StudentDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Click the Account Settings button
    const settingsButton = screen.getByText(/Account Settings/i);
    await userEvent.click(settingsButton);

    // Check that the account settings modal is displayed
    expect(screen.getByTestId("account-settings-modal")).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText("Close");
    await userEvent.click(closeButton);

    // Check that the modal is closed
    expect(
      screen.queryByTestId("account-settings-modal"),
    ).not.toBeInTheDocument();
  });

  it("logs out when Log Out button is clicked", async () => {
    // Mock Supabase response with student data
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStudentData }),
        }),
      }),
    });

    // Mock successful signOut
    (signOut as jest.Mock).mockResolvedValue(undefined);

    render(<StudentDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Click the Log Out button
    const logoutButton = screen.getByText(/Log Out/i);
    await userEvent.click(logoutButton);

    // Check that signOut was called
    expect(signOut).toHaveBeenCalled();

    // Check that window.location.href was updated
    expect(window.location.href).toBe("/");
  });

  it("handles error during logout", async () => {
    // Mock Supabase response with student data
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStudentData }),
        }),
      }),
    });

    // Mock error during signOut
    const mockError = new Error("Logout failed");
    (signOut as jest.Mock).mockRejectedValue(mockError);

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<StudentDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    // Click the Log Out button
    const logoutButton = screen.getByText(/Log Out/i);
    await userEvent.click(logoutButton);

    // Check that signOut was called
    expect(signOut).toHaveBeenCalled();

    // Check that the error was logged
    expect(consoleSpy).toHaveBeenCalledWith("Error signing out:", mockError);

    // Restore console.error
    consoleSpy.mockRestore();
  });
});
