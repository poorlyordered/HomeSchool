import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { validateInvitation, acceptInvitation } from "../lib/auth";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { User } from "../types";

interface InvitationAcceptProps {
  user: User | null;
}

export function InvitationAccept({ user }: InvitationAcceptProps) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    role: string;
    studentName?: string;
  } | null>(null);

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError("Invalid invitation link. No token provided.");
        setValidating(false);
        return;
      }

      try {
        const result = await validateInvitation(token);

        if (!result.valid || !result.invitation) {
          setError(result.message || "Invalid invitation token");
          setValidating(false);
          return;
        }

        setInvitationDetails({
          email: result.invitation.email,
          role: result.invitation.role,
          studentName: result.invitation.student?.name,
        });
        setValidating(false);
      } catch (err) {
        handleAndDisplayError(err, "InvitationAccept.validateToken");
        setError("Failed to validate invitation");
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user) {
      // If not logged in, redirect to sign in page with invitation token
      navigate(`/signin?invitation=${token}`);
      return;
    }

    if (!token) {
      setError("Invalid invitation link. No token provided.");
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvitation(token, user.id);

      if (!result.success) {
        setError(result.message || "Failed to accept invitation");
        return;
      }

      setSuccess("Invitation accepted successfully");

      // Redirect to appropriate dashboard after a short delay
      setTimeout(() => {
        if (user.profile.role === "guardian") {
          navigate("/guardian-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      }, 2000);
    } catch (err) {
      handleAndDisplayError(err, "InvitationAccept.handleAcceptInvitation");
      setError("Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    if (!token) return;
    navigate(`/signup?invitation=${token}`);
  };

  if (validating) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Validating Invitation
        </h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Please wait while we validate your invitation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Invitation Error
        </h1>
        <div className="p-4 bg-red-50 text-red-800 rounded-md mb-4">
          {error}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!invitationDetails) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Invalid Invitation
        </h1>
        <p className="text-center mb-4 text-gray-600">
          The invitation link appears to be invalid or has expired.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Invitation</h1>

      {success ? (
        <div className="p-4 bg-green-50 text-green-800 rounded-md mb-4">
          {success}
        </div>
      ) : (
        <>
          <p className="mb-4">
            You have been invited to join{" "}
            {invitationDetails.studentName ? (
              <span className="font-semibold">
                {invitationDetails.studentName}'s
              </span>
            ) : (
              "a student's"
            )}{" "}
            account as a{" "}
            <span className="font-semibold">{invitationDetails.role}</span>.
          </p>

          <p className="mb-6">
            This invitation was sent to{" "}
            <span className="font-semibold">{invitationDetails.email}</span>.
          </p>

          {user ? (
            user.email === invitationDetails.email ? (
              <div className="space-y-4">
                <p className="text-gray-700">
                  You are currently logged in as{" "}
                  <span className="font-semibold">{user.email}</span>.
                </p>
                <button
                  onClick={handleAcceptInvitation}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Accept Invitation"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                  <p>
                    You are currently logged in as{" "}
                    <span className="font-semibold">{user.email}</span>, but
                    this invitation was sent to{" "}
                    <span className="font-semibold">
                      {invitationDetails.email}
                    </span>
                    .
                  </p>
                  <p className="mt-2">
                    Please log out and sign in with the email address this
                    invitation was sent to.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/logout")}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Log Out
                </button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                To accept this invitation, you need to either sign in or create
                a new account.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate(`/signin?invitation=${token}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
