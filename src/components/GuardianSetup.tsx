import React, { useState } from "react";
import { School } from "lucide-react";
import { supabase } from "../lib/supabase";

interface GuardianSetupProps {
  onComplete: () => void;
}

export function GuardianSetup({ onComplete }: GuardianSetupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Create school record
      const { error: schoolError } = await supabase
        .from("schools")
        .insert([
          {
            guardian_id: user.id,
            name: formData.schoolName,
            address: formData.schoolAddress,
            phone: formData.schoolPhone,
          },
        ])
        .select()
        .single();

      if (schoolError) throw schoolError;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <School className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set Up Your Homeschool
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get your homeschool information set up
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="schoolName"
                className="block text-sm font-medium text-gray-700"
              >
                School Name
              </label>
              <div className="mt-1">
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schoolName: e.target.value,
                    }))
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="schoolAddress"
                className="block text-sm font-medium text-gray-700"
              >
                School Address
              </label>
              <div className="mt-1">
                <input
                  id="schoolAddress"
                  name="schoolAddress"
                  type="text"
                  required
                  value={formData.schoolAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schoolAddress: e.target.value,
                    }))
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="schoolPhone"
                className="block text-sm font-medium text-gray-700"
              >
                School Phone
              </label>
              <div className="mt-1">
                <input
                  id="schoolPhone"
                  name="schoolPhone"
                  type="tel"
                  required
                  pattern="[0-9-+() ]+"
                  value={formData.schoolPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      schoolPhone: e.target.value,
                    }))
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
