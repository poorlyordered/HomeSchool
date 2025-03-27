import React, { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Users } from "lucide-react";
import type { SchoolGuardian } from "../types";
import { 
  addSchoolGuardian, 
  removeSchoolGuardian, 
  getSchoolGuardians 
} from "../lib/auth";
import { handleAndDisplayError } from "../lib/errorHandling";

interface SchoolGuardianManagementProps {
  schoolId: string;
  onClose?: () => void;
}

export function SchoolGuardianManagement({
  schoolId,
  onClose,
}: SchoolGuardianManagementProps) {
  const [loading, setLoading] = useState(true);
  const [guardians, setGuardians] = useState<SchoolGuardian[]>([]);
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const guardianData = await getSchoolGuardians(schoolId);
      setGuardians(guardianData);
    } catch (err) {
      handleAndDisplayError(err, "SchoolGuardianManagement.loadGuardians");
      setError("Failed to load school guardians");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadGuardians();
  }, [loadGuardians]);

  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await addSchoolGuardian(schoolId, newGuardianEmail);

      if (result.success) {
        setSuccess(`Guardian ${newGuardianEmail} added to school successfully`);
        setNewGuardianEmail("");
        await loadGuardians();
      } else {
        setError(result.message || "Failed to add guardian to school");
      }
    } catch (err) {
      handleAndDisplayError(err, "SchoolGuardianManagement.handleAddGuardian");
      setError("Failed to add guardian to school");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGuardian = async (guardianId: string) => {
    if (!confirm("Are you sure you want to remove this guardian from the school?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await removeSchoolGuardian(guardianId);

      if (result.success) {
        setSuccess("Guardian removed from school successfully");
        await loadGuardians();
      } else {
        setError(result.message || "Failed to remove guardian from school");
      }
    } catch (err) {
      handleAndDisplayError(err, "SchoolGuardianManagement.handleRemoveGuardian");
      setError("Failed to remove guardian from school");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">School Guardians</h2>
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
        <h3 className="text-lg font-medium mb-2">Add Guardian to School</h3>
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
            Add guardians to your school. They will be available for selection when sending invitations to students.
          </p>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Current School Guardians</h3>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : guardians.length === 0 ? (
          <p className="text-gray-600 italic">No school guardians found.</p>
        ) : (
          <div className="space-y-2">
            {guardians.map((guardian) => (
              <div
                key={guardian.id}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  <span className="font-medium">{guardian.email}</span>
                  <span className="text-sm text-gray-500">
                    {guardian.is_registered ? "Registered" : "Not Registered"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemoveGuardian(guardian.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove guardian from school"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
