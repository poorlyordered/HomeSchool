import { render, screen, waitFor } from "@testing-library/react";
import { EmailVerification } from "../../components/EmailVerification";
import { verifyEmail } from "../../lib/auth";
import { useNavigate } from "react-router-dom";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  verifyEmail: jest.fn(),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("EmailVerification Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("renders loading state initially", () => {
    // Mock verifyEmail to not resolve immediately
    (verifyEmail as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<EmailVerification />);

    // Check for loading indicator
    expect(screen.getByText("Verifying your email...")).toBeInTheDocument();
    // Check for spinner element (using a more reliable approach)
    const spinnerElement = document.querySelector(".animate-spin");
    expect(spinnerElement).not.toBeNull();
  });

  it("displays success message and redirects after successful verification", async () => {
    // Mock successful verification
    (verifyEmail as jest.Mock).mockResolvedValue({ success: true });

    // Mock setTimeout
    jest.useFakeTimers();

    render(<EmailVerification />);

    // Wait for verification to complete
    await waitFor(() => {
      expect(
        screen.getByText(
          /Email verified successfully! Redirecting to sign in page/i,
        ),
      ).toBeInTheDocument();
    });

    // Check for success notification
    expect(
      screen.getByText(/Email verified successfully! You can now sign in./i),
    ).toBeInTheDocument();

    // Fast-forward timers to trigger redirect
    jest.advanceTimersByTime(3000);

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");

    jest.useRealTimers();
  });

  it("displays error message when verification fails", async () => {
    // Mock failed verification
    (verifyEmail as jest.Mock).mockResolvedValue({
      success: false,
    });

    render(<EmailVerification />);

    // Wait for verification to complete
    await waitFor(() => {
      expect(
        screen.getByText(/Email verification failed/i),
      ).toBeInTheDocument();
    });

    // Check for error message
    expect(
      screen.getByText(
        /Email verification failed. Please try again or contact support./i,
      ),
    ).toBeInTheDocument();

    // Check for return to sign in button
    const returnButton = screen.getByRole("button", {
      name: /Return to Sign In/i,
    });
    expect(returnButton).toBeInTheDocument();
  });

  it("handles errors during verification process", async () => {
    // Mock error during verification
    const errorMessage = "Network error";
    (verifyEmail as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<EmailVerification />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Check for return to sign in button
    const returnButton = screen.getByRole("button", {
      name: /Return to Sign In/i,
    });
    expect(returnButton).toBeInTheDocument();
  });

  it("navigates to sign in page when return button is clicked", async () => {
    // Mock failed verification to show the return button
    (verifyEmail as jest.Mock).mockResolvedValue({
      success: false,
    });

    render(<EmailVerification />);

    // Wait for verification to complete and show the return button
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Return to Sign In/i }),
      ).toBeInTheDocument();
    });

    // Click the return button
    screen.getByRole("button", { name: /Return to Sign In/i }).click();

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});
