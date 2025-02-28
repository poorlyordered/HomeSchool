import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ResetPassword } from "../../components/ResetPassword";
import { resetPassword } from "../../lib/auth";
import { useNavigate, useSearchParams } from "react-router-dom";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  resetPassword: jest.fn(),
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

  it("renders error message when token is missing", () => {
    // Mock useSearchParams to return empty token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => null },
      mockSetSearchParams,
    ]);

    render(<ResetPassword />);

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

  it("renders the form when token is present", () => {
    // Mock useSearchParams to return a token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => "valid-token" },
      mockSetSearchParams,
    ]);

    render(<ResetPassword />);

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

    render(<ResetPassword />);

    // Fill in non-matching passwords
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password$/i), {
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

    render(<ResetPassword />);

    // Fill in short password
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password$/i), {
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

    // Mock successful password reset
    (resetPassword as jest.Mock).mockResolvedValue(undefined);

    // Mock setTimeout
    jest.useFakeTimers();

    render(<ResetPassword />);

    // Fill in valid passwords
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "validpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password$/i), {
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

    // Mock error during password reset
    const errorMessage = "Invalid reset token";
    (resetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<ResetPassword />);

    // Fill in valid passwords
    fireEvent.change(screen.getByLabelText(/^New Password$/i), {
      target: { value: "validpassword123" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm New Password$/i), {
      target: { value: "validpassword123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify form is still visible
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^Confirm New Password$/i),
    ).toBeInTheDocument();
  });

  it("navigates to forgot password page when request new link button is clicked", () => {
    // Mock useSearchParams to return empty token
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: () => null },
      mockSetSearchParams,
    ]);

    render(<ResetPassword />);

    // Click the request new link button
    fireEvent.click(
      screen.getByRole("button", { name: /Request New Reset Link/i }),
    );

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });
});
