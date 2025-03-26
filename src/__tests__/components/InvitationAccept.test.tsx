import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { InvitationAccept } from "../../components/InvitationAccept";
import { validateInvitation } from "../../lib/auth";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(() => ({ token: mockToken })),
  useNavigate: () => mockNavigate,
}));

// Mock the auth functions
jest.mock("../../lib/auth", () => ({
  validateInvitation: jest.fn(),
  acceptInvitation: jest.fn(),
}));

// Mock token and navigate function
let mockToken: string | undefined = "mock-token";
const mockNavigate = jest.fn();

describe("InvitationAccept Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = "mock-token";
    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders loading state initially", async () => {
    // Mock invitation validation to not resolve immediately
    (validateInvitation as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<InvitationAccept user={null} />);

    // Check for loading state
    expect(screen.getByText("Validating Invitation")).toBeInTheDocument();
    expect(
      screen.getByText("Please wait while we validate your invitation..."),
    ).toBeInTheDocument();

    // Check for loading spinner
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeInTheDocument();
  });

  it("handles missing token", async () => {
    // Set token to undefined
    mockToken = undefined;

    render(<InvitationAccept user={null} />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText("Invitation Error")).toBeInTheDocument();
    });

    // Check for error message
    expect(
      screen.getByText("Invalid invitation link. No token provided."),
    ).toBeInTheDocument();

    // Check for home button
    const homeButton = screen.getByRole("button", { name: "Go to Home" });
    expect(homeButton).toBeInTheDocument();

    // Click the home button
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("handles invalid invitation token", async () => {
    // Mock invalid invitation validation
    (validateInvitation as jest.Mock).mockResolvedValue({
      valid: false,
      message: "Invalid invitation token",
    });

    render(<InvitationAccept user={null} />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText("Invitation Error")).toBeInTheDocument();
    });

    // Check for error message
    expect(screen.getByText("Invalid invitation token")).toBeInTheDocument();
  });

  it("displays invitation details for non-logged in user", async () => {
    // Mock successful invitation validation
    (validateInvitation as jest.Mock).mockResolvedValue({
      valid: true,
      invitation: {
        email: "invited@example.com",
        role: "guardian",
        student: {
          name: "Student Name",
        },
      },
    });

    render(<InvitationAccept user={null} />);

    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText("Invitation")).toBeInTheDocument();
    });

    // Check for invitation details
    expect(
      screen.getByText(/You have been invited to join/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Student Name's/i)).toBeInTheDocument();

    // Find the role text by looking for the specific span
    const roleText = screen.getByText("guardian");
    expect(roleText).toBeInTheDocument();

    // Check for sign in and create account buttons
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });
});
