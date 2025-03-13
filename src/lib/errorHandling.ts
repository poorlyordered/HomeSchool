import { toast } from "react-hot-toast";

/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  AUTHENTICATION = "authentication",
  NETWORK = "network",
  VALIDATION = "validation",
  SERVER = "server",
  DATABASE = "database",
  PERMISSION = "permission",
  NOT_FOUND = "not_found",
  UNKNOWN = "unknown",
}

/**
 * Standard error structure for the application
 */
export interface AppError {
  type: ErrorType;
  message: string;
  technical?: string;
  actionable?: string;
  originalError?: unknown;
}

/**
 * Handles an error by categorizing it and returning a standardized AppError
 * @param error The error to handle
 * @param context Optional context information (e.g., component name)
 * @returns A standardized AppError
 */
export const handleError = (error: unknown, context?: string): AppError => {
  // Default to unknown error
  const appError: AppError = {
    type: ErrorType.UNKNOWN,
    message: "An unexpected error occurred",
    technical: context ? `[${context}] Unknown error` : "Unknown error",
    actionable: "Please try again or contact support if the issue persists",
    originalError: error,
  };

  // Handle Error objects
  if (error instanceof Error) {
    appError.technical = error.message;

    // Check for network errors
    if (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("connection")
    ) {
      appError.type = ErrorType.NETWORK;
      appError.message = "Network connection issue";
      appError.actionable =
        "Please check your internet connection and try again";
    }
  }

  // Handle Supabase errors
  if (typeof error === "object" && error !== null) {
    const supabaseError = error as {
      code?: string;
      message?: string;
      details?: string;
    };

    // Authentication errors
    if (
      supabaseError.code === "auth/invalid-email" ||
      supabaseError.code === "auth/wrong-password" ||
      supabaseError.code === "auth/user-not-found" ||
      supabaseError.message?.includes("auth")
    ) {
      appError.type = ErrorType.AUTHENTICATION;
      appError.message = "Authentication failed";
      appError.actionable = "Please check your credentials and try again";
    }

    // Database errors
    else if (
      supabaseError.code?.startsWith("PGRST") ||
      supabaseError.message?.includes("database") ||
      supabaseError.code?.includes("23")
    ) {
      appError.type = ErrorType.DATABASE;
      appError.message = "Database operation failed";
      appError.actionable = "Please try again later";
    }

    // Permission errors
    else if (
      supabaseError.code === "42501" ||
      supabaseError.message?.includes("permission") ||
      supabaseError.message?.includes("access")
    ) {
      appError.type = ErrorType.PERMISSION;
      appError.message = "You do not have permission to perform this action";
      appError.actionable =
        "Please contact an administrator if you need access";
    }

    // Not found errors
    else if (
      supabaseError.code === "404" ||
      supabaseError.message?.includes("not found")
    ) {
      appError.type = ErrorType.NOT_FOUND;
      appError.message = "The requested resource was not found";
      appError.actionable = "Please check your request and try again";
    }

    // Server errors
    else if (
      supabaseError.code?.startsWith("5") ||
      supabaseError.message?.includes("server")
    ) {
      appError.type = ErrorType.SERVER;
      appError.message = "Server error occurred";
      appError.actionable = "Please try again later";
    }

    // Update technical details if available
    if (supabaseError.message) {
      appError.technical = supabaseError.message;
    }
    if (supabaseError.details) {
      appError.technical += ` (${supabaseError.details})`;
    }
  }

  // Handle validation errors
  if (
    typeof error === "object" &&
    error !== null &&
    "validationErrors" in error
  ) {
    appError.type = ErrorType.VALIDATION;
    appError.message = "Validation failed";
    appError.technical = JSON.stringify(
      (error as { validationErrors: unknown }).validationErrors,
    );
    appError.actionable = "Please check your input and try again";
  }

  return appError;
};

/**
 * Displays an error to the user using the toast notification system
 * @param error The AppError to display
 */
export const displayError = (error: AppError): void => {
  const message = `${error.message}${error.actionable ? ` ${error.actionable}` : ""}`;

  toast.error(message, {
    duration: 5000,
    position: "top-center",
  });

  // Log detailed error to console with timestamp
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error details:`, {
    type: error.type,
    message: error.message,
    technical: error.technical,
    actionable: error.actionable,
    originalError: error.originalError,
  });
};

/**
 * Utility function to handle and display an error in one step
 * @param error The error to handle and display
 * @param context Optional context information (e.g., component name)
 * @returns The handled AppError
 */
export const handleAndDisplayError = (
  error: unknown,
  context?: string,
): AppError => {
  const appError = handleError(error, context);
  displayError(appError);
  return appError;
};

/**
 * Creates a try/catch wrapper for async functions
 * @param fn The async function to wrap
 * @param errorHandler Optional custom error handler
 * @param context Optional context information (e.g., component name)
 * @returns A wrapped function that handles errors
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler?: (error: AppError) => void,
  context?: string,
): (...args: Args) => Promise<T | undefined> {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = handleError(error, context);

      if (errorHandler) {
        errorHandler(appError);
      } else {
        displayError(appError);
      }

      return undefined;
    }
  };
}

/**
 * Validates form data against a schema
 * @param data The data to validate
 * @param schema The validation schema
 * @returns An object with validation result
 */
export const validateForm = <T>(
  data: T,
  schema: { validateSync: (data: T, options: { abortEarly: boolean }) => void },
): {
  isValid: boolean;
  errors?: Record<string, string>;
} => {
  try {
    schema.validateSync(data, { abortEarly: false });
    return { isValid: true };
  } catch (error: unknown) {
    const errors: Record<string, string> = {};

    const validationError = error as {
      inner?: Array<{ path?: string; message: string }>;
    };
    if (validationError.inner && Array.isArray(validationError.inner)) {
      validationError.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }

    return { isValid: false, errors };
  }
};
