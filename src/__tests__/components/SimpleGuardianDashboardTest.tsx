import { render } from "@testing-library/react";
import { GuardianDashboard } from "../../components/GuardianDashboard";
import type { User } from "../../types";

// Mock the TranscriptPDF component to avoid TypeScript errors
jest.mock("../../components/TranscriptPDF", () => ({
  TranscriptPDF: () => null,
}));

// Minimal mocks for essential dependencies
jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] }),
    }),
  },
}));

// Minimal mock for auth
jest.mock("../../lib/auth", () => ({
  signOut: jest.fn(),
}));

// Minimal mock for PDF generation
jest.mock("@react-pdf/renderer", () => ({
  pdf: jest.fn().mockReturnValue({
    toBlob: jest.fn().mockResolvedValue(new Blob()),
  }),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  StyleSheet: {
    create: jest.fn().mockReturnValue({}),
  },
  Font: {
    register: jest.fn(),
  },
}));

// Mock child components
jest.mock("../../components/StudentManagement", () => ({
  StudentManagement: ({
    onClose,
  }: {
    onClose: () => void;
    onStudentsChanged?: () => void;
  }) => (
    <div data-testid="student-management-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../../components/AccountSettings", () => ({
  AccountSettings: ({ onClose }: { onClose: () => void; user?: User }) => (
    <div data-testid="account-settings-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../../components/GuardianSetup", () => ({
  GuardianSetup: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="guardian-setup">
      <button onClick={onComplete}>Complete Setup</button>
    </div>
  ),
}));

jest.mock("../../components/CourseList", () => ({
  CourseList: () => <div data-testid="course-list" />,
}));

jest.mock("../../components/TestScores", () => ({
  TestScores: () => <div data-testid="test-scores" />,
}));

jest.mock("../../components/Notification", () => ({
  Notification: () => <div data-testid="notification" />,
}));

describe("GuardianDashboard - Minimal Test", () => {
  const mockUser: User = {
    id: "user-123",
    email: "guardian@example.com",
    profile: {
      id: "profile-123",
      email: "guardian@example.com",
      role: "guardian",
      name: "Guardian Name",
      created_at: "2025-01-01",
    },
  };

  // Minimal test - just check if it renders without crashing
  it("renders without crashing", () => {
    // Using try/catch to prevent test from failing if render fails
    try {
      render(<GuardianDashboard user={mockUser} />);
      expect(true).toBe(true); // If we get here, render succeeded
    } catch (error) {
      console.error("Render failed:", error);
      throw error;
    }
  });
});
