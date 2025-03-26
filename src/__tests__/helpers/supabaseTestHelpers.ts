/**
 * Supabase Test Helpers
 *
 * This file provides helper functions for working with the Supabase mock in tests.
 * It re-exports the functions from the mock implementation and adds additional
 * convenience functions for common testing patterns.
 */

import {
  supabase,
  resetSupabaseMocks,
  mockTableData,
  mockTableError,
  mockRpcData,
} from "../../lib/__mocks__/supabase";

// Re-export the basic helpers
export { resetSupabaseMocks, mockTableData, mockTableError, mockRpcData };

// Define types for our helper functions
type SupabaseData = Record<string, unknown>;
// We're re-exporting mockTableError which uses this type
export type SupabaseError = {
  message: string;
  code?: string;
  details?: string;
};

/**
 * Setup common mock implementations for a test
 *
 * This function sets up the most commonly used mock implementations
 * for Supabase in a single call, making test setup more concise.
 */
export const setupCommonMocks = (): void => {
  resetSupabaseMocks();

  // Setup common mock implementations that most tests will need
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: {
      session: { user: { id: "test-user-id", email: "test@example.com" } },
    },
    error: null,
  });
};

/**
 * Mock a successful profile query
 *
 * @param userId The user ID to mock the profile for
 * @param profileData The profile data to return
 */
export const mockProfileData = (
  userId: string,
  profileData: SupabaseData,
): void => {
  mockTableData("profiles", profileData);

  // Setup the eq method to filter by user ID
  const mockEq = jest.fn().mockReturnValue({
    single: jest.fn().mockResolvedValue({ data: profileData, error: null }),
  });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: mockEq,
      };
    }
    return supabase;
  });

  // Ensure the eq method is called with the correct user ID
  mockEq.mockImplementation((field: string, value: string) => {
    if (field === "id" && value === userId) {
      return {
        single: jest.fn().mockResolvedValue({ data: profileData, error: null }),
      };
    }
    return {
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
  });
};

/**
 * Mock a successful students query
 *
 * @param guardianId The guardian ID to mock students for
 * @param studentsData The students data to return
 */
export const mockStudentsData = (
  guardianId: string,
  studentsData: SupabaseData[],
): void => {
  mockTableData("student_guardians", studentsData);

  // Setup the eq method to filter by guardian ID
  const mockEq = jest.fn().mockReturnValue({
    then: jest.fn().mockResolvedValue({ data: studentsData, error: null }),
  });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "student_guardians") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: mockEq,
      };
    }
    return supabase;
  });

  // Ensure the eq method is called with the correct guardian ID
  mockEq.mockImplementation((field: string, value: string) => {
    if (field === "guardian_id" && value === guardianId) {
      return {
        then: jest.fn().mockResolvedValue({ data: studentsData, error: null }),
      };
    }
    return {
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
  });
};

/**
 * Mock a successful courses query
 *
 * @param studentId The student ID to mock courses for
 * @param coursesData The courses data to return
 */
export const mockCoursesData = (
  studentId: string,
  coursesData: SupabaseData[],
): void => {
  mockTableData("courses", coursesData);

  // Setup the eq method to filter by student ID
  const mockEq = jest.fn().mockReturnValue({
    then: jest.fn().mockResolvedValue({ data: coursesData, error: null }),
  });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "courses") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: mockEq,
      };
    }
    return supabase;
  });

  // Ensure the eq method is called with the correct student ID
  mockEq.mockImplementation((field: string, value: string) => {
    if (field === "student_id" && value === studentId) {
      return {
        then: jest.fn().mockResolvedValue({ data: coursesData, error: null }),
      };
    }
    return {
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
  });
};

/**
 * Mock a successful test scores query
 *
 * @param studentId The student ID to mock test scores for
 * @param testScoresData The test scores data to return
 */
export const mockTestScoresData = (
  studentId: string,
  testScoresData: SupabaseData[],
): void => {
  mockTableData("test_scores", testScoresData);

  // Setup the eq method to filter by student ID
  const mockEq = jest.fn().mockReturnValue({
    then: jest.fn().mockResolvedValue({ data: testScoresData, error: null }),
  });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "test_scores") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: mockEq,
      };
    }
    return supabase;
  });

  // Ensure the eq method is called with the correct student ID
  mockEq.mockImplementation((field: string, value: string) => {
    if (field === "student_id" && value === studentId) {
      return {
        then: jest
          .fn()
          .mockResolvedValue({ data: testScoresData, error: null }),
      };
    }
    return {
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
  });
};

/**
 * Mock a successful standard courses query
 *
 * @param standardCoursesData The standard courses data to return
 */
export const mockStandardCoursesData = (
  standardCoursesData: SupabaseData[],
): void => {
  mockTableData("standard_courses", standardCoursesData);
};
