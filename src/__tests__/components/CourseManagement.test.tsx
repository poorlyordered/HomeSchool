import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseManagement } from "../../components/CourseManagement";
import { supabase } from "../../lib/supabase";
import type { StandardCourse, Course } from "../../types";

// Mock dependencies
jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  },
}));

// Mock Notification component
jest.mock("../../components/Notification", () => ({
  Notification: ({
    type,
    message,
    onClose,
  }: {
    type: "success" | "error" | "info";
    message: string;
    onClose: () => void;
  }) => (
    <div data-testid="notification" data-type={type} data-message={message}>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock the custom hook
jest.mock("../../hooks/useCourseManagement", () => ({
  useCourseManagement: jest.fn(),
}));

// Mock the sub-components
jest.mock("../../components/course/StandardCourseCatalog", () => ({
  StandardCourseCatalog: (props: {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filteredCourses: StandardCourse[];
    loadingCourses: boolean;
    onCourseSelect: (course: StandardCourse) => void;
    selectedCourse: StandardCourse | null;
    getCategoryCount: (category: string) => number;
  }) => (
    <div data-testid="standard-course-catalog">
      <button
        data-testid="mock-select-course"
        onClick={() => props.onCourseSelect(mockStandardCourses[0])}
      >
        Select Course
      </button>
      <input
        data-testid="mock-search-input"
        value={props.searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          props.onSearchChange(e.target.value)
        }
      />
      <select
        data-testid="mock-category-filter"
        value={props.selectedCategory}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          props.onCategoryChange(e.target.value)
        }
      >
        <option value="">All</option>
        <option value="Mathematics">Mathematics</option>
      </select>
    </div>
  ),
}));

jest.mock("../../components/course/CourseForm", () => ({
  CourseForm: (props: {
    formData: Omit<Course, "id">;
    onFormChange: (formData: Omit<Course, "id">) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    onCancel: () => void;
    generateAcademicYearOptions: () => string[];
  }) => (
    <form data-testid="course-form" onSubmit={props.onSubmit}>
      <input
        data-testid="mock-course-name"
        value={props.formData.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          props.onFormChange({ ...props.formData, name: e.target.value })
        }
      />
      <button
        data-testid="mock-submit-button"
        type="submit"
        disabled={props.loading}
      >
        {props.loading ? "Saving..." : "Save Course"}
      </button>
      <button
        data-testid="mock-cancel-button"
        type="button"
        onClick={props.onCancel}
      >
        Cancel
      </button>
    </form>
  ),
}));

jest.mock("../../components/common/NotificationManager", () => ({
  NotificationManager: (props: {
    notification: {
      show: boolean;
      type: "success" | "error" | "info";
      message: string;
    };
    onClose: () => void;
  }) =>
    props.notification.show ? (
      <div
        data-testid="notification-manager"
        data-type={props.notification.type}
        data-message={props.notification.message}
      >
        <button onClick={props.onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock standard courses
const mockStandardCourses: StandardCourse[] = [
  {
    id: "course-1",
    name: "Algebra I",
    category: "Mathematics",
    isSemester: false,
    source: "standard",
    recommendedGradeLevels: [9],
    popularityScore: 10,
    created_at: "2025-01-01",
  },
  {
    id: "course-2",
    name: "Biology",
    category: "Science",
    isSemester: false,
    source: "standard",
    recommendedGradeLevels: [9, 10],
    popularityScore: 8,
    created_at: "2025-01-01",
  },
  {
    id: "course-3",
    name: "World History",
    category: "Social Studies",
    isSemester: false,
    source: "standard",
    recommendedGradeLevels: [9, 10, 11],
    popularityScore: 6,
    created_at: "2025-01-01",
  },
  {
    id: "course-4",
    name: "English Literature",
    category: "English",
    isSemester: false,
    source: "standard",
    recommendedGradeLevels: [9, 10, 11, 12],
    popularityScore: 9,
    created_at: "2025-01-01",
  },
  {
    id: "course-5",
    name: "Chemistry",
    category: "Science",
    isSemester: false,
    source: "standard",
    recommendedGradeLevels: [10, 11],
    popularityScore: 7,
    created_at: "2025-01-01",
  },
];

describe("CourseManagement Component", () => {
  // Mock props
  const mockStudentId = "student-123";
  const mockOnClose = jest.fn();
  const mockOnCourseAdded = jest.fn();

  // Create mock objects for Supabase query builder
  const mockStandardCoursesTable = {
    select: jest.fn().mockReturnThis(),
  };

  const mockCoursesTable = {
    insert: jest.fn().mockReturnThis(),
  };

  const mockRpcFunction = {
    then: jest.fn().mockImplementation((callback) => {
      callback({ error: null });
      return { catch: jest.fn() };
    }),
  };

  // Mock hook implementation
  const mockUseCourseManagement = jest.requireMock(
    "../../hooks/useCourseManagement",
  ).useCourseManagement;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default mock behavior for Supabase
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === "standard_courses") {
        return mockStandardCoursesTable;
      }
      if (table === "courses") {
        return mockCoursesTable;
      }
      return {
        select: jest.fn().mockReturnThis(),
      };
    });

    // Mock standard courses loading
    mockStandardCoursesTable.select.mockResolvedValue({
      data: mockStandardCourses,
      error: null,
    });

    // Mock course insertion
    mockCoursesTable.insert.mockResolvedValue({
      data: { id: "new-course-id" },
      error: null,
    });

    // Mock RPC function for incrementing course popularity
    (supabase.rpc as jest.Mock).mockReturnValue(mockRpcFunction);

    // Setup default mock hook implementation
    mockUseCourseManagement.mockReturnValue({
      formData: {
        name: "",
        gradeLevel: 9,
        academicYear: "",
        semester: "Fall",
        creditHours: 1,
        grade: "A",
      },
      notification: {
        show: false,
        type: "success",
        message: "",
      },
      loading: false,
      standardCourses: mockStandardCourses,
      filteredCourses: [],
      selectedCourse: null,
      selectedCategory: "",
      categories: ["Mathematics", "Science", "Social Studies", "English"],
      categoryCounts: {
        Mathematics: 1,
        Science: 2,
        "Social Studies": 1,
        English: 1,
      },
      loadingCourses: false,
      searchQuery: "",
      setFormData: jest.fn(),
      setSearchQuery: jest.fn(),
      setSelectedCategory: jest.fn(),
      setNotification: jest.fn(),
      handleCourseSelect: jest.fn(),
      handleSubmit: jest.fn(),
      getCategoryCount: jest.fn().mockImplementation((category: string) => {
        const counts: Record<string, number> = {
          Mathematics: 1,
          Science: 2,
          "Social Studies": 1,
          English: 1,
        };
        return counts[category] || 0;
      }),
      generateAcademicYearOptions: jest
        .fn()
        .mockReturnValue(["2023-2024", "2024-2025", "2025-2026", "2026-2027"]),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the component with the hook data", () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Check that the hook was called with the correct props
    expect(mockUseCourseManagement).toHaveBeenCalledWith({
      studentId: mockStudentId,
      onClose: mockOnClose,
      onCourseAdded: mockOnCourseAdded,
    });

    // Check that the component renders correctly
    expect(screen.getByText("Add Course")).toBeInTheDocument();
    expect(screen.getByTestId("standard-course-catalog")).toBeInTheDocument();
    expect(screen.getByTestId("course-form")).toBeInTheDocument();
  });

  it("handles course selection", async () => {
    const mockHandleCourseSelect = jest.fn();
    mockUseCourseManagement.mockReturnValue({
      ...mockUseCourseManagement(),
      handleCourseSelect: mockHandleCourseSelect,
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Click the mock select course button
    await userEvent.click(screen.getByTestId("mock-select-course"));

    // Check that handleCourseSelect was called with the correct course
    expect(mockHandleCourseSelect).toHaveBeenCalledWith(mockStandardCourses[0]);
  }, 15000);

  it("handles form submission", async () => {
    const mockHandleSubmit = jest.fn((e) => {
      e.preventDefault();
    });

    mockUseCourseManagement.mockReturnValue({
      ...mockUseCourseManagement(),
      handleSubmit: mockHandleSubmit,
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Submit the form
    await userEvent.click(screen.getByTestId("mock-submit-button"));

    // Check that handleSubmit was called
    expect(mockHandleSubmit).toHaveBeenCalled();
  }, 15000);

  it("handles search query changes", async () => {
    const mockSetSearchQuery = jest.fn();

    mockUseCourseManagement.mockReturnValue({
      ...mockUseCourseManagement(),
      setSearchQuery: mockSetSearchQuery,
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Type in the search input
    await userEvent.type(screen.getByTestId("mock-search-input"), "Algebra");

    // Check that setSearchQuery was called with the correct value
    expect(mockSetSearchQuery).toHaveBeenCalledWith("Algebra");
  }, 15000);

  it("handles category filter changes", async () => {
    const mockSetSelectedCategory = jest.fn();

    mockUseCourseManagement.mockReturnValue({
      ...mockUseCourseManagement(),
      setSelectedCategory: mockSetSelectedCategory,
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Change the category filter
    fireEvent.change(screen.getByTestId("mock-category-filter"), {
      target: { value: "Mathematics" },
    });

    // Check that setSelectedCategory was called with the correct value
    expect(mockSetSelectedCategory).toHaveBeenCalledWith("Mathematics");
  });

  it("displays notifications when they are shown", () => {
    mockUseCourseManagement.mockReturnValue({
      ...mockUseCourseManagement(),
      notification: {
        show: true,
        type: "success",
        message: "Course added successfully!",
      },
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Check that the notification is displayed
    const notification = screen.getByTestId("notification-manager");
    expect(notification).toBeInTheDocument();
    expect(notification.getAttribute("data-type")).toBe("success");
    expect(notification.getAttribute("data-message")).toBe(
      "Course added successfully!",
    );
  });

  it("closes the modal when close button is clicked", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Click the close button
    const closeButton = screen.getByText("×");
    await userEvent.click(closeButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  }, 15000);
});
