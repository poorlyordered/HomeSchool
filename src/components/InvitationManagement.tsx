import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Send, Trash2 } from "lucide-react";
import type { Invitation } from "../types";
import {
  createInvitation,
  resendInvitation,
  deleteInvitation,
  getInvitationsByStudent,
} from "../lib/auth";
import { handleAndDisplayError } from "../lib/errorHandling";

interface InvitationManagementProps {
  studentId: string;
  studentName: string;
  onClose?: () => void;
}

export function InvitationManagement({
  studentId,
  studentName,
  onClose,
}: InvitationManagementProps) {
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [role, setRole] = useState<"guardian" | "student">("guardian");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const invitationData = await getInvitationsByStudent(studentId);
      setInvitations(invitationData);
    } catch (err) {
      handleAndDisplayError(err, "InvitationManagement.loadInvitations");
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createInvitation(newEmail, role, studentId);

      if (result.success) {
        setSuccess(`Invitation sent to ${newEmail}`);
        setNewEmail("");
        await loadInvitations();
      } else {
        setError(result.message || "Failed to create invitation");
      }
    } catch (err) {
      handleAndDisplayError(err, "InvitationManagement.handleCreateInvitation");
      setError("Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resendInvitation(invitationId);

      if (result.success) {
        setSuccess("Invitation resent successfully");
        await loadInvitations();
      } else {
        setError(result.message || "Failed to resend invitation");
      }
    } catch (err) {
      handleAndDisplayError(err, "InvitationManagement.handleResendInvitation");
      setError("Failed to resend invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteInvitation(invitationId);

      if (result.success) {
        setSuccess("Invitation deleted successfully");
        await loadInvitations();
      } else {
        setError(result.message || "Failed to delete invitation");
      }
    } catch (err) {
      handleAndDisplayError(err, "InvitationManagement.handleDeleteInvitation");
      setError("Failed to delete invitation");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Invitations for {studentName}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
      )}

      {success && (
        <div className="p-3 bg-green-50 text-green-800 rounded-md">
          {success}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Send New Invitation</h3>
        <form onSubmit={handleCreateInvitation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "guardian" | "student")
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="guardian">Guardian</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || !newEmail}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              Send Invitation
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Current Invitations</h3>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-gray-600 italic">No invitations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expires
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invitation.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {invitation.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          invitation.status,
                        )}`}
                      >
                        {invitation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invitation.expires_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {invitation.status === "pending" && (
                          <button
                            onClick={() =>
                              handleResendInvitation(invitation.id)
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Resend invitation"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete invitation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
