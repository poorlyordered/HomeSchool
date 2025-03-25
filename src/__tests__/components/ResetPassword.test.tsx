import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ResetPassword } from "../../components/ResetPassword";
import { resetPassword, validateResetToken } from "../../lib/auth";
import { useNavigate, useSearchParams } from "react-router-dom";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  resetPassword: jest.fn(),
  validateResetToken: jest.fn(),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("ResetPassword Component", () => {
  const mockNavigate = jest.fn();
  const mockSetSearchParams = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("shows loading state while validating token", () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return a promise that doesn't resolve immediately
    (validateResetToken as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<ResetPassword />);

    // Check for loading indicator
    expect(
      screen.getByText(/Validating your reset token/i),
    ).toBeInTheDocument();

    // Check for the spinner using class instead of role
    const loadingContainer = screen.getByText(
      /Validating your reset token/i,
    ).parentElement;
    expect(
      loadingContainer?.querySelector(".animate-spin"),
    ).toBeInTheDocument();
  });

  it("renders error message when token is missing", async () => {
    // Mock useSearchParams to return empty token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => null },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to resolve immediately for this test
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: false });

    render(<ResetPassword />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Check for error message
    expect(
      screen.getByText(/Invalid or missing reset token/i),
    ).toBeInTheDocument();

    // Check for request new link button
    const requestButton = screen.getByRole("button", {
      name: /Request New Reset Link/i,
    });
    expect(requestButton).toBeInTheDocument();
  });

  it("renders error message when token is invalid", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "invalid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return invalid result
    (validateResetToken as jest.Mock).mockResolvedValue({
      valid: false,
      message: "Invalid token. Please request a new password reset link.",
    });

    render(<ResetPassword />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Check for error message - updated to match the actual text in the component
    expect(
      screen.getByText(
        /Invalid or missing reset token. Please request a new password reset link./i,
      ),
    ).toBeInTheDocument();

    // Check for request new link button
    const requestButton = screen.getByRole("button", {
      name: /Request New Reset Link/i,
    });
    expect(requestButton).toBeInTheDocument();
  });

  it("renders the form when token is valid", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return valid result
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: true });

    render(<ResetPassword />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Check for form elements
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^Confirm New Password$/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i }),
    ).toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return valid result
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: true });

    render(<ResetPassword />);

    // Wait for validation to complete and form to appear
    await waitFor(() => {
      expect(screen.getByText("Reset your password")).toBeInTheDocument();
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Fill in non-matching passwords using more reliable selectors
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirmPassword",
    ) as HTMLInputElement;

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    // Check for error message
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();

    // Verify resetPassword was not called
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return valid result
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: true });

    render(<ResetPassword />);

    // Wait for validation to complete and form to appear
    await waitFor(() => {
      expect(screen.getByText("Reset your password")).toBeInTheDocument();
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Fill in short password using more reliable selectors
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirmPassword",
    ) as HTMLInputElement;

    fireEvent.change(passwordInput, {
      target: { value: "short" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "short" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    // Check for error message
    expect(
      screen.getByText(/Password must be at least 8 characters long/i),
    ).toBeInTheDocument();

    // Verify resetPassword was not called
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("handles successful password reset", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return valid result
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: true });

    // Mock successful password reset
    (resetPassword as jest.Mock).mockResolvedValue(undefined);

    // Mock setTimeout
    jest.useFakeTimers();

    render(<ResetPassword />);

    // Wait for validation to complete and form to appear
    await waitFor(() => {
      expect(screen.getByText("Reset your password")).toBeInTheDocument();
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Fill in valid passwords using more reliable selectors
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirmPassword",
    ) as HTMLInputElement;

    fireEvent.change(passwordInput, {
      target: { value: "validpassword123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "validpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    // Check loading state
    expect(
      screen.getByRole("button", { name: /Resetting/i }),
    ).toBeInTheDocument();

    // Wait for reset to complete and success message to appear
    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith("validpassword123");
      expect(
        screen.getByText(
          /Password reset successful! Redirecting to sign in page/i,
        ),
      ).toBeInTheDocument();
    });

    // Check for success notification
    expect(
      screen.getByText(
        /Password reset successful! You can now sign in with your new password./i,
      ),
    ).toBeInTheDocument();

    // Fast-forward timers to trigger redirect
    jest.advanceTimersByTime(3000);

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");

    jest.useRealTimers();
  });

  it("handles error during password reset", async () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to return valid result
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: true });

    // Mock error during password reset
    const errorMessage = "Invalid reset token";
    (resetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ResetPassword />);

    // Wait for validation to complete and form to appear
    await waitFor(() => {
      expect(screen.getByText("Reset your password")).toBeInTheDocument();
      expect(
        screen.queryByText(/Validating your reset token/i),
      ).not.toBeInTheDocument();
    });

    // Fill in valid passwords using more reliable selectors
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirmPassword",
    ) as HTMLInputElement;

    fireEvent.change(passwordInput, {
      target: { value: "validpassword123" },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "validpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify form is still visible
    const updatedPasswordInput = document.getElementById("password");
    const updatedConfirmPasswordInput =
      document.getElementById("confirmPassword");

    expect(updatedPasswordInput).toBeInTheDocument();
    expect(updatedConfirmPasswordInput).toBeInTheDocument();
  });

  it("navigates to forgot password page when request new link button is clicked", async () => {
    // Mock useSearchParams to return empty token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => null },
      mockSetSearchParams,
    ]);

    // Mock validateResetToken to resolve immediately for this test
    (validateResetToken as jest.Mock).mockResolvedValue({ valid: false });

    render(<ResetPassword />);

    // Click the request new link button
    fireEvent.click(
      screen.getByRole("button", { name: /Request New Reset Link/i }),
    );

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });
});
