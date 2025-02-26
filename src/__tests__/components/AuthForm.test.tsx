import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "../../components/AuthForm";
import { signIn, signUp } from "../../lib/auth";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}));

describe("AuthForm Component", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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
      await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
      await userEvent.type(screen.getByLabelText(/password/i), "password123");

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
      await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
      await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");

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
      await userEvent.type(
        screen.getByLabelText(/email/i),
        "newuser@example.com",
      );
      await userEvent.type(screen.getByLabelText(/password/i), "password123");

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
      await userEvent.type(
        screen.getByLabelText(/email/i),
        "student@example.com",
      );
      await userEvent.type(screen.getByLabelText(/password/i), "password123");

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

      // Wait for the sign up process to complete
      await waitFor(() => {
        expect(signUp).toHaveBeenCalledWith(
          "student@example.com",
          "password123",
          "student",
        );
      });
    });

    it("handles sign up error", async () => {
      // Mock sign up error
      const errorMessage = "Email already in use";
      (signUp as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      // Fill in the form
      await userEvent.type(
        screen.getByLabelText(/email/i),
        "existing@example.com",
      );
      await userEvent.type(screen.getByLabelText(/password/i), "password123");

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

      // Wait for the error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
