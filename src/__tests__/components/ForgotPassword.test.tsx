import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ForgotPassword } from "../../components/ForgotPassword";
import { requestPasswordReset } from "../../lib/auth";
import { useNavigate } from "react-router-dom";

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  requestPasswordReset: jest.fn(),
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("ForgotPassword Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("renders the form correctly", () => {
    render(<ForgotPassword />);

    // Check for form elements
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Back to sign in/i)).toBeInTheDocument();
  });

  it("handles form submission with valid email", async () => {
    // Mock successful password reset request
    (requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

    render(<ForgotPassword />);

    // Fill in email
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Check loading state
    expect(
      screen.getByRole("button", { name: /Sending/i }),
    ).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith("test@example.com");
      expect(
        screen.getByText(/Password reset instructions sent to your email!/i),
      ).toBeInTheDocument();
    });

    // Check for success state
    expect(
      screen.getByText(
        /Password reset email sent! Please check your inbox and follow the instructions./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Return to Sign In/i }),
    ).toBeInTheDocument();
  });

  it("handles error during password reset request", async () => {
    // Mock error during password reset request
    const errorMessage = "User not found";
    (requestPasswordReset as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    render(<ForgotPassword />);

    // Fill in email
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "nonexistent@example.com" },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify form is still visible
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    ).toBeInTheDocument();
  });

  it("navigates to sign in page when back button is clicked", () => {
    render(<ForgotPassword />);

    // Click the back to sign in button
    fireEvent.click(screen.getByText(/Back to sign in/i));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("navigates to sign in page when return button is clicked after success", async () => {
    // Mock successful password reset request
    (requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

    render(<ForgotPassword />);

    // Fill in email
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Wait for success state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Return to Sign In/i }),
      ).toBeInTheDocument();
    });

    // Click the return to sign in button
    fireEvent.click(screen.getByRole("button", { name: /Return to Sign In/i }));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("validates email input", async () => {
    render(<ForgotPassword />);

    // Submit form without entering email
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Check that the form validation prevents submission (requestPasswordReset not called)
    await waitFor(() => {
      expect(requestPasswordReset).not.toHaveBeenCalled();
    });

    // Fill in invalid email format
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "invalid-email" },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Check that the form validation prevents submission (requestPasswordReset not called)
    await waitFor(() => {
      expect(requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("clears notification when close button is clicked", async () => {
    // Mock successful password reset request
    (requestPasswordReset as jest.Mock).mockResolvedValue(undefined);

    render(<ForgotPassword />);

    // Fill in email
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(
      screen.getByRole("button", { name: /Send reset instructions/i }),
    );

    // Wait for notification to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Password reset instructions sent to your email!/i),
      ).toBeInTheDocument();
    });

    // Find and click the close button in the notification
    // The close button doesn't have a text label, so we need to find it by its SVG icon
    const closeButton = document.querySelector(".fixed.top-4.right-4 button");
    if (closeButton) {
      fireEvent.click(closeButton);
    } else {
      throw new Error("Close button not found in notification");
    }

    // Check that notification is removed
    await waitFor(() => {
      expect(
        screen.queryByText(/Password reset instructions sent to your email!/i),
      ).not.toBeInTheDocument();
    });
  });
});
