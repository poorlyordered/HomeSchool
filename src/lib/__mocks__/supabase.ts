/**
 * Standardized Supabase mock implementation
 *
 * This file provides a consistent way to mock Supabase across all tests.
 */

// Define basic types for our mock implementation
type SupabaseData = Record<string, unknown>;
type SupabaseError = { message: string; code?: string; details?: string };

// Create a basic mock of the Supabase client
export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockReturnThis(),
  auth: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    getSession: jest.fn(),
  },
};

// Helper functions for test files

/**
 * Reset all Supabase mocks to their initial state
 */
export const resetSupabaseMocks = (): void => {
  jest.clearAllMocks();
};

/**
 * Configure a mock table to return success data
 */
export const mockTableData = (
  tableName: string,
  data: SupabaseData | SupabaseData[],
): void => {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === tableName) {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data, error: null }),
      };
    }
    return supabase;
  });
};

/**
 * Configure a mock table to return an error
 */
export const mockTableError = (
  tableName: string,
  error: SupabaseError,
): void => {
  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === tableName) {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: null, error }),
      };
    }
    return supabase;
  });
};

/**
 * Configure a mock RPC function to return success data
 */
export const mockRpcData = (functionName: string, data: SupabaseData): void => {
  (supabase.rpc as jest.Mock).mockImplementation((name: string) => {
    if (name === functionName) {
      return {
        then: jest.fn().mockResolvedValue({ data, error: null }),
      };
    }
    return {
      then: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
  });
};
