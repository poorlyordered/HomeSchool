import { GuardianDashboard } from "./guardian/GuardianDashboard";
// Import StudentDashboard directly from the component
// This is a workaround for TypeScript import issues
const StudentDashboard = ({ user }: { user: User }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Student Dashboard
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Welcome, {user.profile.name || user.email}
          </p>
          <p className="mt-2 text-md text-gray-500">
            This is a simplified student dashboard.
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={async () => {
              try {
                const { signOut } = await import("../lib/auth");
                await signOut();
                window.location.href = "/";
              } catch (error) {
                console.error("Error signing out:", error);
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
import type { User } from "../types";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  if (!user.profile) {
    return null;
  }

  return user.profile.role === "guardian" ? (
    <GuardianDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
}
