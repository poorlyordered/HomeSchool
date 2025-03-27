import { useState } from "react";
import { signOut } from "../../lib/auth";
import type { User } from "../../types";

interface GuardianDashboardProps {
  user: User;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  const [loading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Guardian Dashboard
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Welcome, {user.profile.name || user.email}
          </p>
          <p className="mt-2 text-md text-gray-500">
            This is a simplified guardian dashboard.
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
