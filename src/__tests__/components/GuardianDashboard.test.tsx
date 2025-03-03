import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuardianDashboard } from "../../components/GuardianDashboard";
import { signOut } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { pdf } from "@react-pdf/renderer";
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
    limit: jest.fn().mockReturnThis(),
  },
}));

jest.mock("@react-pdf/renderer", () => ({
  pdf: jest.fn(),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: {
    create: jest.fn().mockReturnValue({}),
  },
  Font: {
    register: jest.fn(),
  },
}));

// Mock child components
jest.mock("../../components/StudentManagement", () => ({
  StudentManagement: ({
    onClose,
    onStudentsChanged,
  }: {
    onClose: () => void;
    onStudentsChanged: () => void;
  }) => (
    <div data-testid="student-management-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={onStudentsChanged}>Update Students</button>
    </div>
  ),
}));

jest.mock("../../components/AccountSettings", () => ({
  AccountSettings: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="account-settings-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../../components/GuardianSetup", () => ({
  GuardianSetup: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="guardian-setup">
      <button onClick={onComplete}>Complete Setup</button>
    </div>
  ),
}));

jest.mock("../../components/CourseList", () => ({
  CourseList: ({
    courses,
    onEditCourse,
    onDeleteCourse,
  }: {
    courses: { id: string; name: string }[];
    onEditCourse: (course: { id: string; name: string }) => void;
    onDeleteCourse: (id: string) => void;
    studentId: string;
  }) => (
    <div data-testid="course-list">
      <span>Courses: {courses.length}</span>
      <button onClick={() => onEditCourse({ id: "1", name: "Test Course" })}>
        Edit Course
      </button>
      <button onClick={() => onDeleteCourse("1")}>Delete Course</button>
    </div>
  ),
}));

jest.mock("../../components/TestScores", () => ({
  TestScores: ({
    scores,
    onEditScore,
    onDeleteScore,
  }: {
    scores: { id: string; type: string }[];
    onEditScore: (score: { id: string; type: string }) => void;
    onDeleteScore: (id: string) => void;
    studentId: string;
  }) => (
    <div data-testid="test-scores">
      <span>Test Scores: {scores.length}</span>
      <button onClick={() => onEditScore({ id: "1", type: "SAT" })}>
        Edit Score
      </button>
      <button onClick={() => onDeleteScore("1")}>Delete Score</button>
    </div>
  ),
}));

jest.mock("../../components/TranscriptPDF", () => ({
  TranscriptPDF: () => <div>PDF Content</div>,
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

// Skip these tests due to issues with React 18's createRoot API in the test environment
describe.skip("GuardianDashboard Component", () => {
  // Mock user data
  const mockUser: User = {
    id: "user-123",
    email: "guardian@example.com",
    profile: {
      id: "profile-123",
      email: "guardian@example.com",
      role: "guardian",
      name: "Guardian Name",
      created_at: "2025-01-01",
    },
  };

  // Mock school data
  const mockSchool = {
    id: "school-123",
    name: "Test School",
    address: "123 School St",
    phone: "555-1234",
    created_at: "2025-01-01",
  };

  // Mock student data
  const mockStudents = [
    {
      id: "student-1",
      student_id: "S001",
      name: "Student One",
      birth_date: "2010-01-01",
      graduation_date: "2028-05-15",
    },
    {
      id: "student-2",
      student_id: "S002",
      name: "Student Two",
      birth_date: "2012-02-02",
      graduation_date: "2030-05-15",
    },
  ];

  // Mock student guardians data
  const mockStudentGuardians = [
    {
      student_id: "student-1",
      is_primary: true,
      students: mockStudents[0],
    },
    {
      student_id: "student-2",
      is_primary: false,
      students: mockStudents[1],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset window.location.href
    window.location.href = "";

    // Mock PDF blob and URL creation
    const mockBlob = new Blob(["PDF content"], { type: "application/pdf" });
    (pdf as jest.Mock).mockReturnValue({
      toBlob: jest.fn().mockResolvedValue(mockBlob),
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue("blob:pdf-url");
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement and related methods
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  it("renders loading state initially", () => {
    // Mock Supabase response to not resolve immediately
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(new Promise(() => {})),
        }),
      }),
    });

    render(<GuardianDashboard user={mockUser} />);

    // Check for loading spinner
    const spinnerElement = document.querySelector(".animate-spin");
    expect(spinnerElement).not.toBeNull();
  });

  it("shows setup screen when no school data is found", async () => {
    // Mock Supabase response for schools
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete and setup screen to appear
    await waitFor(() => {
      expect(screen.getByTestId("guardian-setup")).toBeInTheDocument();
    });

    // Test completing setup
    const completeButton = screen.getByText("Complete Setup");
    await userEvent.click(completeButton);

    // Verify needsSetup state was updated
    expect(screen.queryByTestId("guardian-setup")).not.toBeInTheDocument();
  });

  it("shows empty state when no students are found", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [] }),
          }),
        };
      } else if (table === "students") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [] }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Check for empty state message
    expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please add a student to get started/i),
    ).toBeInTheDocument();

    // Check for Add Student button
    const addButton = screen.getByText(/Add Student/i);
    expect(addButton).toBeInTheDocument();

    // Test clicking Add Student button
    await userEvent.click(addButton);
    expect(screen.getByTestId("student-management-modal")).toBeInTheDocument();
  });

  it("displays school and student information correctly", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Check for school information
    expect(screen.getByText(mockSchool.name)).toBeInTheDocument();
    expect(screen.getByText(mockSchool.address)).toBeInTheDocument();
    expect(screen.getByText(mockSchool.phone)).toBeInTheDocument();

    // Check for guardian information
    expect(
      screen.getByText(`Guardian: ${mockUser.profile.name}`),
    ).toBeInTheDocument();

    // Check for student information (should display the primary student by default)
    expect(screen.getByText(mockStudents[0].name)).toBeInTheDocument();
    expect(
      screen.getByText(`Student ID: ${mockStudents[0].student_id}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Expected Graduation: ${mockStudents[0].graduation_date}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Date of Birth: ${mockStudents[0].birth_date}`),
    ).toBeInTheDocument();

    // Check for student selector (should be visible with multiple students)
    expect(screen.getByLabelText(/Select Student/i)).toBeInTheDocument();
  });

  it("allows selecting a different student", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Get the student selector
    const studentSelector = screen.getByLabelText(/Select Student/i);

    // Change the selected student
    await userEvent.selectOptions(studentSelector, "student-2");

    // Check that the second student's information is displayed
    expect(screen.getByText(mockStudents[1].name)).toBeInTheDocument();
    expect(
      screen.getByText(`Student ID: ${mockStudents[1].student_id}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Expected Graduation: ${mockStudents[1].graduation_date}`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Date of Birth: ${mockStudents[1].birth_date}`),
    ).toBeInTheDocument();
  });

  it("opens student management modal when Manage Students button is clicked", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Click the Manage Students button
    const manageButton = screen.getByText(/Manage Students/i);
    await userEvent.click(manageButton);

    // Check that the student management modal is displayed
    expect(screen.getByTestId("student-management-modal")).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText("Close");
    await userEvent.click(closeButton);

    // Check that the modal is closed
    expect(
      screen.queryByTestId("student-management-modal"),
    ).not.toBeInTheDocument();
  });

  it("opens account settings modal when Account Settings button is clicked", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

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
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    // Mock successful signOut
    (signOut as jest.Mock).mockResolvedValue(undefined);

    render(<GuardianDashboard user={mockUser} />);

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

  it("generates and downloads a PDF transcript when Download button is clicked", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Click the Download Transcript button
    const downloadButton = screen.getByText(/Download Official Transcript/i);
    await userEvent.click(downloadButton);

    // Check that pdf was called
    expect(pdf).toHaveBeenCalled();

    // Check that URL.createObjectURL was called
    expect(global.URL.createObjectURL).toHaveBeenCalled();

    // Check that a link was created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a");
    const mockLink = document.createElement("a");
    expect(mockLink.download).toContain("_transcript.pdf");
    expect(mockLink.click).toHaveBeenCalled();

    // Check that the link was removed and URL revoked
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("reloads students when student management updates occur", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Open student management modal
    const manageButton = screen.getByText(/Manage Students/i);
    await userEvent.click(manageButton);

    // Clear mock counts to track new calls
    jest.clearAllMocks();

    // Trigger student update
    const updateButton = screen.getByText("Update Students");
    await userEvent.click(updateButton);

    // Check that Supabase was queried again to reload students
    expect(supabase.from).toHaveBeenCalledWith("student_guardians");
  });

  it("handles course and test score management", async () => {
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "schools") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [mockSchool] }),
            }),
          }),
        };
      } else if (table === "student_guardians") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockStudentGuardians,
              error: null,
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
    });

    render(<GuardianDashboard user={mockUser} />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinnerElement = document.querySelector(".animate-spin");
      expect(spinnerElement).toBeNull();
    });

    // Check for course list and test scores components
    expect(screen.getByTestId("course-list")).toBeInTheDocument();
    expect(screen.getByTestId("test-scores")).toBeInTheDocument();

    // Test course deletion
    const deleteCourseButton = screen.getByText("Delete Course");
    await userEvent.click(deleteCourseButton);

    // Test test score deletion
    const deleteScoreButton = screen.getByText("Delete Score");
    await userEvent.click(deleteScoreButton);

    // Test course editing (should log to console)
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const editCourseButton = screen.getByText("Edit Course");
    await userEvent.click(editCourseButton);
    expect(consoleSpy).toHaveBeenCalledWith("Edit course", expect.anything());

    // Test test score editing (should log to console)
    const editScoreButton = screen.getByText("Edit Score");
    await userEvent.click(editScoreButton);
    expect(consoleSpy).toHaveBeenCalledWith("Edit score", expect.anything());

    consoleSpy.mockRestore();
  });
});
