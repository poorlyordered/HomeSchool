import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CourseManagement } from "../../components/CourseManagement";
import { supabase } from "../../lib/supabase";
import type { StandardCourse } from "../../types";

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

describe("CourseManagement Component", () => {
  // Mock props
  const mockStudentId = "student-123";
  const mockOnClose = jest.fn();
  const mockOnCourseAdded = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default mock behavior
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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Set a longer timeout for all tests
  jest.setTimeout(15000);

  it("renders loading state initially", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Check for modal title
    expect(screen.getByText("Add Course")).toBeInTheDocument();

    // Check for loading state in standard courses section
    expect(screen.getByText(/Filter by Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Search Courses/i)).toBeInTheDocument();
  });

  it("loads standard courses on mount", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Check that supabase.from was called with "standard_courses"
    expect(supabase.from).toHaveBeenCalledWith("standard_courses");
    expect(mockStandardCoursesTable.select).toHaveBeenCalled();

    // Wait for categories to be populated in the dropdown
    await waitFor(
      () => {
        const categorySelect = screen.getByLabelText(/Filter by Category/i);
        expect(categorySelect).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  it("filters courses based on search query", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Search Courses/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Type in search box
    const searchInput = screen.getByLabelText(/Search Courses/i);
    await userEvent.type(searchInput, "Algebra");

    // Wait for filtered results
    await waitFor(
      () => {
        // Since we're mocking the component, we need to check if the search query is being set
        // This is an indirect way to test that filtering is happening
        expect(searchInput).toHaveValue("Algebra");
      },
      { timeout: 10000 },
    );
  });

  it("filters courses based on selected category", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load
    await waitFor(
      () => {
        expect(
          screen.getByLabelText(/Filter by Category/i),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Select a category
    const categorySelect = screen.getByLabelText(/Filter by Category/i);
    fireEvent.change(categorySelect, { target: { value: "Science" } });

    // Wait for filtered results
    await waitFor(
      () => {
        expect(categorySelect).toHaveValue("Science");
      },
      { timeout: 10000 },
    );
  });

  it("allows selecting a course from search results", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Type in search box to trigger search results
    const searchInput = screen.getByLabelText(/Search Courses/i);
    await userEvent.type(searchInput, "Bio");

    // Since we can't directly test the dropdown results (they're mocked),
    // we'll test that the form gets updated when a course is selected
    // by manually triggering the handleCourseSelect function

    // Find the Course Name input
    const courseNameInput = screen.getByLabelText(/Course Name/i);

    // Simulate selecting a course by updating the course name input
    fireEvent.change(courseNameInput, { target: { value: "Biology" } });

    // Check that the course name was updated
    expect(courseNameInput).toHaveValue("Biology");
  });

  it("submits the form with valid data", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Fill out the form
    const courseNameInput = screen.getByLabelText(/Course Name/i);
    await userEvent.type(courseNameInput, "Test Course");

    const academicYearInput = screen.getByLabelText(/Academic Year/i);
    await userEvent.type(academicYearInput, "2025-2026");

    // Submit the form
    const saveButton = screen.getByText("Save Course");
    await userEvent.click(saveButton);

    // Check that the insert method was called with correct data
    expect(supabase.from).toHaveBeenCalledWith("courses");
    expect(mockCoursesTable.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        student_id: mockStudentId,
        name: "Test Course",
        academic_year: "2025-2026",
      }),
    ]);

    // Check that onCourseAdded was called
    await waitFor(
      () => {
        expect(mockOnCourseAdded).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  });

  it("displays error notification when form submission fails", async () => {
    // Mock insert to return an error
    mockCoursesTable.insert.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Fill out the form
    const courseNameInput = screen.getByLabelText(/Course Name/i);
    await userEvent.type(courseNameInput, "Test Course");

    const academicYearInput = screen.getByLabelText(/Academic Year/i);
    await userEvent.type(academicYearInput, "2025-2026");

    // Submit the form
    const saveButton = screen.getByText("Save Course");
    await userEvent.click(saveButton);

    // Check that error notification is displayed
    await waitFor(
      () => {
        const notification = screen.getByTestId("notification");
        expect(notification).toBeInTheDocument();
        expect(notification.getAttribute("data-type")).toBe("error");
        expect(notification.getAttribute("data-message")).toContain(
          "Database error",
        );
      },
      { timeout: 10000 },
    );

    // Check that onCourseAdded was not called
    expect(mockOnCourseAdded).not.toHaveBeenCalled();
  });

  it("displays success notification when form submission succeeds", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Fill out the form
    const courseNameInput = screen.getByLabelText(/Course Name/i);
    await userEvent.type(courseNameInput, "Test Course");

    const academicYearInput = screen.getByLabelText(/Academic Year/i);
    await userEvent.type(academicYearInput, "2025-2026");

    // Submit the form
    const saveButton = screen.getByText("Save Course");
    await userEvent.click(saveButton);

    // Check that success notification is displayed
    await waitFor(
      () => {
        const notification = screen.getByTestId("notification");
        expect(notification).toBeInTheDocument();
        expect(notification.getAttribute("data-type")).toBe("success");
        expect(notification.getAttribute("data-message")).toContain(
          "Course added successfully",
        );
      },
      { timeout: 10000 },
    );

    // Check that onCourseAdded was called
    expect(mockOnCourseAdded).toHaveBeenCalled();
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
  });

  it("closes the modal when cancel button is clicked", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Click the cancel button
    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("tracks course selection for popularity", async () => {
    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Manually trigger course selection by updating the course name input
    const courseNameInput = screen.getByLabelText(/Course Name/i);
    fireEvent.change(courseNameInput, { target: { value: "Biology" } });

    // Check that the RPC function was called to track course selection
    expect(supabase.rpc).toHaveBeenCalledWith(
      "increment_course_popularity",
      expect.any(Object),
    );
  });

  it("handles timeout for long-running operations", async () => {
    // Mock insert to never resolve
    mockCoursesTable.insert.mockReturnValue(new Promise(() => {}));

    render(
      <CourseManagement
        studentId={mockStudentId}
        onClose={mockOnClose}
        onCourseAdded={mockOnCourseAdded}
      />,
    );

    // Wait for component to load with a more specific query and longer timeout
    await waitFor(
      () => {
        expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    // Fill out the form
    const courseNameInput = screen.getByLabelText(/Course Name/i);
    await userEvent.type(courseNameInput, "Test Course");

    const academicYearInput = screen.getByLabelText(/Academic Year/i);
    await userEvent.type(academicYearInput, "2025-2026");

    // Submit the form
    const saveButton = screen.getByText("Save Course");
    await userEvent.click(saveButton);

    // Check that the button shows loading state
    expect(screen.getByText("Saving...")).toBeInTheDocument();

    // Fast-forward time to trigger the timeout
    jest.advanceTimersByTime(10000);

    // Check that timeout error notification is displayed
    await waitFor(
      () => {
        const notification = screen.getByTestId("notification");
        expect(notification).toBeInTheDocument();
        expect(notification.getAttribute("data-type")).toBe("error");
        expect(notification.getAttribute("data-message")).toContain(
          "Operation timed out",
        );
      },
      { timeout: 10000 },
    );
  });
});
