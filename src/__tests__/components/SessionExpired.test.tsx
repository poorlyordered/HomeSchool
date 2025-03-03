import { render, screen } from "@testing-library/react";
import { SessionExpired } from "../../components/SessionExpired";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("SessionExpired Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("renders the session expired message", () => {
    render(<SessionExpired />);

    // Check for main heading
    expect(screen.getByText("Session Expired")).toBeInTheDocument();

    // Check for explanation text
    expect(
      screen.getByText(
        "Your session has expired due to inactivity. You will be redirected to the sign in page.",
      ),
    ).toBeInTheDocument();

    // Check for sign in button
    expect(
      screen.getByRole("button", { name: /Sign In Now/i }),
    ).toBeInTheDocument();
  });

  it("displays notification with error message", () => {
    render(<SessionExpired />);

    // Check for notification message
    expect(
      screen.getByText("Your session has expired. Please sign in again."),
    ).toBeInTheDocument();
  });

  it("redirects to sign in page after 3 seconds", async () => {
    // Mock setTimeout
    jest.useFakeTimers();

    render(<SessionExpired />);

    // Fast-forward timers to trigger redirect
    jest.advanceTimersByTime(3000);

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");

    jest.useRealTimers();
  });

  it("navigates to sign in page when button is clicked", async () => {
    const user = userEvent.setup();

    render(<SessionExpired />);

    // Click the sign in button
    await user.click(screen.getByRole("button", { name: /Sign In Now/i }));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("clears timeout when component unmounts", () => {
    // Mock setTimeout and clearTimeout
    jest.useFakeTimers();
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = render(<SessionExpired />);

    // Unmount the component
    unmount();

    // Check if clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    jest.useRealTimers();
    clearTimeoutSpy.mockRestore();
  });
});
