import { renderHook, act, waitFor } from "@testing-library/react";
import { useCourseManagement } from "../../hooks/useCourseManagement";
import { supabase } from "../../lib/supabase";
import type { StandardCourse } from "../../types";

// Mock dependencies
jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  },
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
];

describe("useCourseManagement Hook", () => {
  // Mock props
  const mockProps = {
    studentId: "student-123",
    onClose: jest.fn(),
    onCourseAdded: jest.fn(),
  };

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
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("loads standard courses on initialization", async () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Initial state should show loading
    expect(result.current.loadingCourses).toBe(true);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Check that courses were loaded
    expect(result.current.standardCourses).toEqual(mockStandardCourses);

    // Check that categories were extracted
    expect(result.current.categories).toEqual(["Mathematics", "Science"]);
  });

  it("filters courses based on search query", async () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Set search query
    act(() => {
      result.current.setSearchQuery("Algebra");
    });

    // Check that courses are filtered
    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].name).toBe("Algebra I");
  });

  it("filters courses based on selected category", async () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Set category filter
    act(() => {
      result.current.setSelectedCategory("Science");
    });

    // Check that courses are filtered
    expect(result.current.filteredCourses).toHaveLength(1);
    expect(result.current.filteredCourses[0].name).toBe("Biology");
  });

  it("handles course selection", async () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Select a course
    act(() => {
      result.current.handleCourseSelect(mockStandardCourses[0]);
    });

    // Check that the selected course is set
    expect(result.current.selectedCourse).toEqual(mockStandardCourses[0]);

    // Check that the form data is updated
    expect(result.current.formData.name).toBe("Algebra I");

    // Check that the RPC function was called
    expect(supabase.rpc).toHaveBeenCalledWith("increment_course_popularity", {
      course_id: mockStandardCourses[0].id,
    });
  });

  it("submits the form successfully", async () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Update form data
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        name: "Test Course",
        academicYear: "2025-2026",
      });
    });

    // Submit the form
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // Check that the form was submitted
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("courses");
    expect(mockCoursesTable.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        student_id: mockProps.studentId,
        name: "Test Course",
        academic_year: "2025-2026",
      }),
    ]);

    // Check that the success notification is shown
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("success");

    // Check that onCourseAdded was called
    expect(mockProps.onCourseAdded).toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    // Mock insert to return an error
    mockCoursesTable.insert.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Update form data
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        name: "Test Course",
        academicYear: "2025-2026",
      });
    });

    // Submit the form
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // Check that the error notification is shown
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain("Database error");

    // Check that onCourseAdded was not called
    expect(mockProps.onCourseAdded).not.toHaveBeenCalled();
  });

  it("handles timeout for long-running operations", async () => {
    // Mock insert to never resolve
    mockCoursesTable.insert.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Wait for courses to load
    await waitFor(() => {
      expect(result.current.loadingCourses).toBe(false);
    });

    // Update form data
    act(() => {
      result.current.setFormData({
        ...result.current.formData,
        name: "Test Course",
        academicYear: "2025-2026",
      });
    });

    // Submit the form
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;
    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    // Check that loading is true
    expect(result.current.loading).toBe(true);

    // Fast-forward time to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Check that timeout error notification is displayed
    expect(result.current.notification.show).toBe(true);
    expect(result.current.notification.type).toBe("error");
    expect(result.current.notification.message).toContain(
      "Operation timed out",
    );

    // Check that loading is reset
    expect(result.current.loading).toBe(false);
  });

  it("generates academic year options correctly", () => {
    const { result } = renderHook(() => useCourseManagement(mockProps));

    // Mock the current year
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => new Date(2025, 0, 1).getTime());

    // Generate academic year options
    const options = result.current.generateAcademicYearOptions();

    // Check that options are generated correctly
    expect(options).toEqual([
      "2023-2024",
      "2024-2025",
      "2025-2026",
      "2026-2027",
    ]);

    // Restore Date.now
    Date.now = originalDateNow;
  });
});
