import {
  handleError,
  displayError,
  handleAndDisplayError,
  withErrorHandling,
  validateForm,
  ErrorType,
  AppError,
} from "../../lib/errorHandling";
import { toast } from "react-hot-toast";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
  },
  error: jest.fn(),
}));

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("Error Handling Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleError", () => {
    it("should handle Error objects", () => {
      const error = new Error("Test error");
      const result = handleError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe("An unexpected error occurred");
      expect(result.technical).toBe("Test error");
      expect(result.originalError).toBe(error);
    });

    it("should detect network errors", () => {
      const error = new Error("Network connection failed");
      const result = handleError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.message).toBe("Network connection issue");
      expect(result.actionable).toBe(
        "Please check your internet connection and try again",
      );
    });

    it("should handle Supabase authentication errors", () => {
      const error = {
        code: "auth/invalid-email",
        message: "Invalid email format",
      };
      const result = handleError(error);

      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.message).toBe("Authentication failed");
      expect(result.technical).toBe("Invalid email format");
    });

    it("should handle validation errors", () => {
      const error = {
        validationErrors: {
          email: "Invalid email format",
          password: "Password too short",
        },
      };
      const result = handleError(error);

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.message).toBe("Validation failed");
      expect(result.actionable).toBe("Please check your input and try again");
    });
  });

  describe("displayError", () => {
    it("should display error using toast", () => {
      const appError: AppError = {
        type: ErrorType.UNKNOWN,
        message: "Test error",
        actionable: "Please try again",
      };

      displayError(appError);

      expect(toast.error).toHaveBeenCalledWith(
        "Test error Please try again",
        expect.any(Object),
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("handleAndDisplayError", () => {
    it("should handle and display error", () => {
      const error = new Error("Test error");
      const result = handleAndDisplayError(error);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe("withErrorHandling", () => {
    it("should return result when function succeeds", async () => {
      const successFn = jest.fn().mockResolvedValue("success");
      const wrappedFn = withErrorHandling(successFn);

      const result = await wrappedFn();

      expect(result).toBe("success");
      expect(successFn).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should handle error when function fails", async () => {
      const error = new Error("Function failed");
      const failingFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = withErrorHandling(failingFn);

      const result = await wrappedFn();

      expect(result).toBeUndefined();
      expect(failingFn).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalled();
    });

    it("should use custom error handler if provided", async () => {
      const error = new Error("Function failed");
      const failingFn = jest.fn().mockRejectedValue(error);
      const customErrorHandler = jest.fn();
      const wrappedFn = withErrorHandling(failingFn, customErrorHandler);

      await wrappedFn();

      expect(customErrorHandler).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe("validateForm", () => {
    it("should return isValid true when validation passes", () => {
      const data = { email: "test@example.com" };
      const schema = {
        validateSync: jest.fn(),
      };

      const result = validateForm(data, schema);

      expect(result.isValid).toBe(true);
      expect(schema.validateSync).toHaveBeenCalledWith(data, {
        abortEarly: false,
      });
    });

    it("should return validation errors when validation fails", () => {
      const data = { email: "invalid" };
      const validationError = {
        inner: [{ path: "email", message: "Invalid email format" }],
      };
      const schema = {
        validateSync: jest.fn().mockImplementation(() => {
          throw validationError;
        }),
      };

      const result = validateForm(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({ email: "Invalid email format" });
    });
  });
});
