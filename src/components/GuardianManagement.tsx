import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Crown, Mail, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Profile, StudentGuardian, User } from "../types";
import { InvitationManagement } from "./InvitationManagement";

interface GuardianManagementProps {
  user: User;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onGuardiansChanged?: () => void;
}

export function GuardianManagement({
  user,
  studentId,
  studentName,
  onClose,
  onGuardiansChanged,
}: GuardianManagementProps) {
  const [activeTab, setActiveTab] = useState<"guardians" | "invitations">(
    "guardians",
  );
  const [loading, setLoading] = useState(true);
  const [guardians, setGuardians] = useState<
    (StudentGuardian & { guardian: Profile })[]
  >([]);
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_guardians")
        .select(
          `
          *,
          guardian:profiles(*)
        `,
        )
        .eq("student_id", studentId);

      if (error) throw error;

      if (data) {
        setGuardians(data as (StudentGuardian & { guardian: Profile })[]);
      }
    } catch (err) {
      console.error("Error loading guardians:", err);
      setError("Failed to load guardians");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadGuardians();
  }, [loadGuardians]);

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if the email exists in profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", newGuardianEmail)
        .eq("role", "guardian")
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          setError(`No guardian account found with email ${newGuardianEmail}`);
        } else {
          throw profileError;
        }
        return;
      }

      // Check if this guardian is already associated with this student
      const { data: existingData, error: existingError } = await supabase
        .from("student_guardians")
        .select("*")
        .eq("student_id", studentId)
        .eq("guardian_id", profileData.id);

      if (existingError) throw existingError;

      if (existingData && existingData.length > 0) {
        setError("This guardian is already associated with this student");
        return;
      }

      // Add the guardian to the student
      const { error: insertError } = await supabase
        .from("student_guardians")
        .insert([
          {
            student_id: studentId,
            guardian_id: profileData.id,
            is_primary: guardians.length === 0, // Make primary if first guardian
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(
        `Guardian ${profileData.name || profileData.email} added successfully`,
      );
      setNewGuardianEmail("");
      await loadGuardians();

      if (onGuardiansChanged) {
        onGuardiansChanged();
      }
    } catch (err) {
      console.error("Error adding guardian:", err);
      setError("Failed to add guardian");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuardian = async (guardianId: string) => {
    if (!confirm("Are you sure you want to remove this guardian?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from("student_guardians")
        .delete()
        .eq("student_id", studentId)
        .eq("guardian_id", guardianId);

      if (error) throw error;

      setSuccess("Guardian removed successfully");
      await loadGuardians();

      if (onGuardiansChanged) {
        onGuardiansChanged();
      }
    } catch (err) {
      console.error("Error removing guardian:", err);
      setError("Failed to remove guardian");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryGuardian = async (guardianId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, set all guardians for this student to non-primary
      const { error: updateError1 } = await supabase
        .from("student_guardians")
        .update({ is_primary: false })
        .eq("student_id", studentId);

      if (updateError1) throw updateError1;

      // Then set the selected guardian as primary
      const { error: updateError2 } = await supabase
        .from("student_guardians")
        .update({ is_primary: true })
        .eq("student_id", studentId)
        .eq("guardian_id", guardianId);

      if (updateError2) throw updateError2;

      setSuccess("Primary guardian updated successfully");
      await loadGuardians();

      if (onGuardiansChanged) {
        onGuardiansChanged();
      }
    } catch (err) {
      console.error("Error setting primary guardian:", err);
      setError("Failed to update primary guardian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Manage Access for {studentName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`flex items-center px-4 py-2 ${
              activeTab === "guardians"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("guardians")}
          >
            <Users size={16} className="mr-2" />
            Current Guardians
          </button>
          <button
            className={`flex items-center px-4 py-2 ${
              activeTab === "invitations"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("invitations")}
          >
            <Mail size={16} className="mr-2" />
            Invitations
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
            {success}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "guardians" ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Current Guardians
              </h3>
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : guardians.length === 0 ? (
                <p className="text-gray-600 italic">No guardians found.</p>
              ) : (
                <div className="space-y-2">
                  {guardians.map((sg) => (
                    <div
                      key={sg.id}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {sg.is_primary && (
                          <Crown size={16} className="text-yellow-500" />
                        )}
                        <span className="font-medium">
                          {sg.guardian.name || sg.guardian.email}
                        </span>
                        <span className="text-sm text-gray-500">
                          {sg.guardian.email}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!sg.is_primary && (
                          <button
                            onClick={() =>
                              handleSetPrimaryGuardian(sg.guardian_id)
                            }
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="Set as primary guardian"
                          >
                            <Crown size={16} />
                          </button>
                        )}
                        {guardians.length > 1 && sg.guardian_id !== user.id && (
                          <button
                            onClick={() => handleRemoveGuardian(sg.guardian_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove guardian"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Add Existing Guardian
              </h3>
              <form onSubmit={handleAddGuardian} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={newGuardianEmail}
                      onChange={(e) => setNewGuardianEmail(e.target.value)}
                      placeholder="Guardian's email address"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newGuardianEmail}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <PlusCircle size={16} />
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  The guardian must already have an account in the system with
                  the role of "guardian".
                </p>
              </form>
            </div>
          </div>
        ) : (
          <InvitationManagement
            studentId={studentId}
            studentName={studentName}
          />
        )}
      </div>
    </div>
  );
}
