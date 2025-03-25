import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { signIn, signUp, validateInvitation } from "../lib/auth";
import { handleAndDisplayError } from "../lib/errorHandling";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitation");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"guardian" | "student">("guardian");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingInvitation, setValidatingInvitation] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    role: "guardian" | "student";
  } | null>(null);

  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!invitationToken) return;

      setValidatingInvitation(true);
      try {
        const result = await validateInvitation(invitationToken);

        if (result.valid && result.invitation) {
          setInvitationDetails({
            email: result.invitation.email,
            role: result.invitation.role,
          });
          setEmail(result.invitation.email);
          setRole(result.invitation.role);
        } else {
          setError(result.message || "Invalid invitation token");
        }
      } catch (err) {
        handleAndDisplayError(err, "AuthForm.validateToken");
        setError("Failed to validate invitation");
      } finally {
        setValidatingInvitation(false);
      }
    }

    validateToken();
  }, [invitationToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, role, name);
        setVerificationSent(true);
        setError("Account created! Please check your email for verification.");
      } else {
        await signIn(email, password);

        // If there's an invitation token, redirect to the invitation page
        if (invitationToken) {
          window.location.href = `/invite/${invitationToken}`;
          return;
        }

        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      handleAndDisplayError(err, "AuthForm.handleSubmit");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validatingInvitation) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-gray-600">Validating invitation...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {invitationDetails && (
        <div className="p-3 bg-blue-50 text-blue-800 rounded-md mb-4">
          <p>
            You've been invited to join as a{" "}
            <span className="font-semibold">{invitationDetails.role}</span>.
          </p>
          <p className="mt-1">
            Please {mode === "signin" ? "sign in" : "create an account"} with{" "}
            <span className="font-semibold">{invitationDetails.email}</span> to
            accept the invitation.
          </p>
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {mode === "signup" && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      )}

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="mt-1 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="guardian"
                checked={role === "guardian"}
                onChange={(e) => setRole(e.target.value as "guardian")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Guardian</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="student"
                checked={role === "student"}
                onChange={(e) => setRole(e.target.value as "student")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Student</span>
            </label>
          </div>
        </div>
      )}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {mode === "signin" && (
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <a
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      )}

      {mode === "signin" && (
        <div className="flex items-center justify-center mt-2">
          <div className="text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div className="flex items-center justify-center mt-2">
          <div className="text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <a
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </div>
        </div>
      )}

      {verificationSent ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Verification email sent! Please check your inbox and click the
            verification link.
          </p>
          <button
            type="button"
            onClick={() => (window.location.href = "/signin")}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Sign In
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      )}
    </form>
  );
}
