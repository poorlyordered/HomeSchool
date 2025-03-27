import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validateInvitation, acceptInvitation } from "../lib/auth";
import type { User, Invitation } from "../types";

interface InvitationAcceptProps {
  user: User | null;
}

export function InvitationAccept({ user }: InvitationAcceptProps) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  useEffect(() => {
    async function checkInvitation() {
      if (!token) {
        setError("Invalid invitation link. No token provided.");
        setLoading(false);
        return;
      }

      try {
        const result = await validateInvitation(token);
        if (!result.valid) {
          setError(result.message || "Invalid invitation");
        } else if (result.invitation) {
          setInvitation(result.invitation);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while validating the invitation",
        );
      } finally {
        setLoading(false);
      }
    }

    checkInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const result = await acceptInvitation(token, user.id);
      if (result.success) {
        // Redirect to dashboard on success
        navigate("/");
      } else {
        setError(result.message || "Failed to accept invitation");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while accepting the invitation",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const handleSignIn = () => {
    navigate(`/signin?invitation=${token}`);
  };

  const handleCreateAccount = () => {
    navigate(`/signup?invitation=${token}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Validating Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we validate your invitation...
          </p>
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invitation Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGoToHome}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invitation Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No invitation details found. Please check your link and try again.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGoToHome}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in and can accept the invitation
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Accept Invitation
          </h2>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8">
            <p className="text-center mb-6">
              You have been invited to join{" "}
              {invitation.student?.name || "a student"}'s homeschool account as
              a <span className="font-semibold">{invitation.role}</span>.
            </p>

            <p className="text-center mb-6">
              Your email ({user.email}) is already logged in. Would you like to
              accept this invitation?
            </p>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleAcceptInvitation}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Accept Invitation
              </button>
              <button
                onClick={handleGoToHome}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is not logged in, show options to sign in or create account
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Invitation
        </h2>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-8">
          <p className="text-center mb-6">
            You have been invited to join{" "}
            {invitation.student?.name || "a student"}'s homeschool account as a{" "}
            <span className="font-semibold">{invitation.role}</span>.
          </p>

          <p className="text-center mb-6">
            Please sign in or create an account to accept this invitation.
          </p>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
            <button
              onClick={handleCreateAccount}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
            <button
              onClick={handleGoToHome}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
