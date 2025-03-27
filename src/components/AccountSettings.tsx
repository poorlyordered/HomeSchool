import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Check, School } from "lucide-react";
import { supabase } from "../lib/supabase";
import { updatePassword, updateEmail, deleteAccount } from "../lib/auth";
import type { User } from "../types";

interface AccountSettingsProps {
  user: User;
  onClose: () => void;
}

type Tab = "profile" | "school" | "security" | "delete";

export function AccountSettings({ user, onClose }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email change state
  const [newEmail, setNewEmail] = useState("");

  // Account deletion state
  const [confirmDelete, setConfirmDelete] = useState("");

  // School data state
  const [schoolData, setSchoolData] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    // Load user profile data
    async function loadProfile() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        if (data?.name) {
          setName(data.name);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    // Load school data
    async function loadSchool() {
      try {
        const { data } = await supabase
          .from("schools")
          .select("*")
          .eq("guardian_id", user.id)
          .single();

        if (data) {
          setSchoolData({
            id: data.id,
            name: data.name,
            address: data.address,
            phone: data.phone,
          });
        }
      } catch (error) {
        console.error("Error loading school data:", error);
      }
    }

    loadProfile();

    // Only load school data if user is a guardian
    if (user.profile.role === "guardian") {
      loadSchool();
    }
  }, [user.id, user.profile.role]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("schools")
        .update({
          name: schoolData.name,
          address: schoolData.address,
          phone: schoolData.phone,
        })
        .eq("id", schoolData.id);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "School information updated successfully!",
      });
    } catch (error) {
      console.error("Error updating school information:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An error occurred while updating school information",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      setLoading(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Current password is incorrect",
      });
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate email
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      setLoading(false);
      return;
    }

    try {
      await updateEmail(newEmail);
      setMessage({
        type: "success",
        text: "Verification email sent! Please check your inbox and click the verification link.",
      });
      setNewEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Email already in use",
      });
      console.error("Error changing email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate confirmation
    if (confirmDelete !== user.email) {
      setMessage({ type: "error", text: "Email address does not match" });
      setLoading(false);
      return;
    }

    try {
      await deleteAccount();
      // The user will be redirected to the sign-in page by the auth state change listener
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to delete account",
      });
      console.error("Error deleting account:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          {user.profile.role === "guardian" && (
            <button
              className={`px-6 py-3 font-medium text-sm ${activeTab === "school" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("school")}
            >
              School
            </button>
          )}
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "security" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${activeTab === "delete" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("delete")}
          >
            Delete Account
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-md flex items-start gap-2 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {message.type === "success" ? (
                <Check size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-3 py-2"
                />
                <p className="mt-1 text-sm text-gray-500">
                  To change your email address, go to the Security tab.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={user.profile.role}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-3 py-2"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "school" && user.profile.role === "guardian" && (
            <form onSubmit={handleUpdateSchool} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <School size={24} className="text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  School Information
                </h3>
              </div>

              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-sm font-medium text-gray-700"
                >
                  School Name
                </label>
                <input
                  type="text"
                  id="schoolName"
                  value={schoolData.name}
                  onChange={(e) =>
                    setSchoolData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="schoolAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  School Address
                </label>
                <input
                  type="text"
                  id="schoolAddress"
                  value={schoolData.address}
                  onChange={(e) =>
                    setSchoolData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="schoolPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  School Phone
                </label>
                <input
                  type="tel"
                  id="schoolPhone"
                  value={schoolData.phone}
                  onChange={(e) =>
                    setSchoolData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <form
                onSubmit={handleChangePassword}
                className="space-y-4 border-b pb-8"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Change Password
                </h3>

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Password must be at least 8 characters long.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>

              <form onSubmit={handleChangeEmail} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Change Email
                </h3>

                <div>
                  <label
                    htmlFor="currentEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Email
                  </label>
                  <input
                    type="email"
                    id="currentEmail"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-3 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Email
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You will need to verify your new email address before the
                    change takes effect.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Verification Email"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "delete" && (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-red-800">
                  Delete Account
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  Warning: This action is permanent and cannot be undone. All
                  your data will be permanently deleted.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmDelete"
                  className="block text-sm font-medium text-gray-700"
                >
                  To confirm, please type your email address: {user.email}
                </label>
                <input
                  type="email"
                  id="confirmDelete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 px-3 py-2"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || confirmDelete !== user.email}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
