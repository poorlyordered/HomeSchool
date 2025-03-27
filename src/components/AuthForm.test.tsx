import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "./AuthForm";
import { signIn, signUp, validateInvitation } from "../lib/auth";

// Mock invitation token for tests that need it
let mockInvitationToken: string | null = null;

// Mock the auth functions
jest.mock("../lib/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  validateInvitation: jest.fn(),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useSearchParams: jest.fn(() => [
    {
      get: jest.fn((param) => {
        if (param === "invitation" && mockInvitationToken) {
          return mockInvitationToken;
        }
        return null;
      }),
    },
  ]),
}));

describe("AuthForm Component", () => {
  jest.useFakeTimers(); // Add timer mocking
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockInvitationToken = null;
    // Reset window.location.href
    window.location.href = "";
  });

  describe("Sign In Mode", () => {
    beforeEach(() => {
      render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />);
    });

    it("renders sign in form correctly", () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();

      // Role selection should not be present in sign in mode
      expect(screen.queryByText(/role/i)).not.toBeInTheDocument();
    });

    it("handles successful sign in", async () => {
      // Mock successful sign in
      (signIn as jest.Mock).mockResolvedValueOnce({ user: { id: "123" } });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      // Wait for the sign in process to complete
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("test@example.com", "password123");
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Error message should not be displayed
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("handles sign in error", async () => {
      // Mock sign in error
      const errorMessage = "Invalid credentials";
      (signIn as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      // Wait for the error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe("Sign Up Mode", () => {
    beforeEach(() => {
      render(<AuthForm mode="signup" onSuccess={mockOnSuccess} />);
    });

    it("renders sign up form correctly", () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/guardian/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/student/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it("handles successful sign up", async () => {
      // Mock successful sign up
      (signUp as jest.Mock).mockResolvedValueOnce({ user: { id: "123" } });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "newuser@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "John Doe" },
      });

      // Select role (guardian is default)
      expect(screen.getByLabelText(/guardian/i)).toBeChecked();

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

      // Wait for the sign up process to complete
      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          "newuser@example.com",
          "password123",
          "guardian",
          "John Doe",
        );
        // onSuccess should not be called for sign up (verification required)
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      // Verification message should be displayed
      await waitFor(() => {
        expect(
          screen.getByText(/verification email sent/i),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /go to sign in/i }),
        ).toBeInTheDocument();
      });
    });

    it("allows changing role selection", async () => {
      // Change role to student
      fireEvent.click(screen.getByLabelText(/student/i));
      expect(screen.getByLabelText(/student/i)).toBeChecked();
      expect(screen.getByLabelText(/guardian/i)).not.toBeChecked();

      // Mock successful sign up
      (signUp as jest.Mock).mockResolvedValueOnce({ user: { id: "123" } });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "student@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Student Name" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

      // Wait for the sign up process to complete
      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          "student@example.com",
          "password123",
          "student",
          "Student Name",
        );
      });
    });

    it("handles sign up error", async () => {
      // Mock sign up error
      const errorMessage = "Email already in use";
      (signUp as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Existing User" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

      // Wait for the error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe("With Invitation Token", () => {
    beforeEach(() => {
      mockInvitationToken = "mock-invitation-token";
    });

    it("validates invitation token on load", async () => {
      // Mock successful invitation validation
      (validateInvitation as jest.Mock).mockResolvedValueOnce({
        valid: true,
        invitation: {
          email: "invited@example.com",
          role: "guardian",
        },
      });

      render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />);

      // Check for loading state
      expect(screen.getByText("Validating invitation...")).toBeInTheDocument();

      // Wait for validation to complete
      await waitFor(() => {
        expect(
          screen.queryByText("Validating invitation..."),
        ).not.toBeInTheDocument();
      });

      // Check that the invitation details are displayed
      expect(
        screen.getByText(/You've been invited to join as a/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/guardian/i)).toBeInTheDocument();
      expect(screen.getByText(/invited@example.com/i)).toBeInTheDocument();

      // Check that the email field is pre-filled
      expect(screen.getByLabelText(/email/i)).toHaveValue(
        "invited@example.com",
      );
    });

    it("handles invalid invitation token", async () => {
      // Mock invalid invitation validation
      (validateInvitation as jest.Mock).mockResolvedValueOnce({
        valid: false,
        message: "Invalid invitation token",
      });

      render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />);

      // Wait for validation to complete
      await waitFor(() => {
        expect(
          screen.queryByText("Validating invitation..."),
        ).not.toBeInTheDocument();
      });

      // Check that the error message is displayed
      expect(screen.getByText("Invalid invitation token")).toBeInTheDocument();
    });

    it("handles sign in with invitation token", async () => {
      // Mock successful invitation validation
      (validateInvitation as jest.Mock).mockResolvedValueOnce({
        valid: true,
        invitation: {
          email: "invited@example.com",
          role: "guardian",
        },
      });

      // Mock successful sign in
      (signIn as jest.Mock).mockResolvedValueOnce({ user: { id: "123" } });

      render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />);

      // Wait for validation to complete
      await waitFor(() => {
        expect(
          screen.queryByText("Validating invitation..."),
        ).not.toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      // Wait for the sign in process to complete
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith(
          "invited@example.com",
          "password123",
        );
      });

      // Verify that onSuccess was not called, which indicates redirection happened
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
