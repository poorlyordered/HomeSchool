import React, { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Upload,
  Search,
  Filter,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { GuardianManagement } from "./GuardianManagement";
import type { User } from "../types";

interface StudentData {
  id: string;
  student_id: string;
  name: string;
  birth_date: string;
  graduation_date: string;
}

interface StudentManagementProps {
  user: User;
  onClose: () => void;
  onStudentsChanged?: () => void; // New prop to notify parent when students change
}

export function StudentManagement({
  user,
  onClose,
  onStudentsChanged,
}: StudentManagementProps) {
  const [loading, setLoading] = useState(true);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState<string | null>(null);
  const [managingGuardiansForStudent, setManagingGuardiansForStudent] =
    useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGradYear, setFilterGradYear] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    birthDate: "",
    graduationDate: "",
  });
  const [students, setStudents] = useState<StudentData[]>([]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterGradYear || student.graduation_date.startsWith(filterGradYear);
    return matchesSearch && matchesFilter;
  });

  const loadStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        *,
        school:schools(*)
      `,
      )
      .eq("guardian_id", user.id);

    if (error) {
      console.error("Error loading students:", error);
      return;
    }

    setStudents(
      data?.map((student) => ({
        id: student.id,
        student_id: student.student_id,
        name: student.name,
        birth_date: student.birth_date,
        graduation_date: student.graduation_date,
      })) || [],
    );
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: school } = await supabase
      .from("schools")
      .select("id")
      .eq("guardian_id", user.id)
      .single();

    if (!school) {
      console.error("No school found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("students").insert([
      {
        guardian_id: user.id,
        school_id: school.id,
        student_id: formData.studentId,
        name: formData.name,
        birth_date: formData.birthDate,
        graduation_date: formData.graduationDate,
      },
    ]);

    if (error) {
      console.error("Error creating student:", error);
    } else {
      setIsAddingStudent(false);
      setFormData({
        name: "",
        studentId: "",
        birthDate: "",
        graduationDate: "",
      });
      await loadStudents();
      // Notify parent component that students have changed
      if (onStudentsChanged) {
        onStudentsChanged();
      }
    }
    setLoading(false);
  }

  async function handleDeleteStudent(studentId: string) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) {
      console.error("Error deleting student:", error);
    } else {
      await loadStudents();
      // Notify parent component that students have changed
      if (onStudentsChanged) {
        onStudentsChanged();
      }
    }
    setLoading(false);
  }

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingStudent) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .update({
          name: formData.name,
          student_id: formData.studentId,
          birth_date: formData.birthDate,
          graduation_date: formData.graduationDate,
        })
        .eq("id", isEditingStudent)
        .select();

      if (error) {
        console.error("Error updating student:", error);
        alert(`Failed to update student: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log("Student updated successfully:", data[0]);
        setIsEditingStudent(null);
        setFormData({
          name: "",
          studentId: "",
          birthDate: "",
          graduationDate: "",
        });
        await loadStudents();
        // Notify parent component that students have changed
        if (onStudentsChanged) {
          onStudentsChanged();
        }
      } else {
        console.error("No data returned after update");
        alert("Failed to update student: No data returned");
      }
    } catch (err) {
      console.error("Exception during student update:", err);
      alert(
        `An error occurred: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const startEditingStudent = (student: StudentData) => {
    setIsEditingStudent(student.id);
    setFormData({
      name: student.name,
      studentId: student.student_id,
      birthDate: student.birth_date,
      graduationDate: student.graduation_date,
    });
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result as string;
        const rows = csvData.split("\n").slice(1); // Skip header row

        setLoading(true);
        const { data: school } = await supabase
          .from("schools")
          .select("id")
          .eq("guardian_id", user.id)
          .single();

        if (!school) {
          console.error("No school found");
          setLoading(false);
          return;
        }

        for (const row of rows) {
          const [name, studentId, birthDate, graduationDate] = row
            .split(",")
            .map((field) => field.trim());
          if (!name || !studentId || !birthDate || !graduationDate) continue;

          await supabase.from("students").insert([
            {
              guardian_id: user.id,
              school_id: school.id,
              name,
              student_id: studentId,
              birth_date: birthDate,
              graduation_date: graduationDate,
            },
          ]);
        }

        await loadStudents();
        // Notify parent component that students have changed
        if (onStudentsChanged) {
          onStudentsChanged();
        }
      } catch (error) {
        console.error("Error importing students:", error);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Manage Students</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {!isAddingStudent ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle size={20} />
                  Add Student
                </button>
                <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload size={20} />
                  Bulk Import
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleBulkImport}
                  />
                </label>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Filter by grad year..."
                    value={filterGradYear}
                    onChange={(e) => setFilterGradYear(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.student_id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      ID: {student.student_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Birth Date: {student.birth_date} | Graduation:{" "}
                      {student.graduation_date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingStudent(student)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit student"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setManagingGuardiansForStudent({
                          id: student.id,
                          name: student.name,
                        })
                      }
                      className="text-green-600 hover:text-green-800"
                      title="Manage guardians"
                    >
                      <Users size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete student"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isEditingStudent ? (
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentId: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birth Date
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expected Graduation Date
              </label>
              <input
                type="date"
                required
                value={formData.graduationDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    graduationDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditingStudent(null);
                  setFormData({
                    name: "",
                    studentId: "",
                    birthDate: "",
                    graduationDate: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    studentId: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birth Date
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expected Graduation Date
              </label>
              <input
                type="date"
                required
                value={formData.graduationDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    graduationDate: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAddingStudent(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>
        )}
      </div>

      {managingGuardiansForStudent && (
        <GuardianManagement
          user={user}
          studentId={managingGuardiansForStudent.id}
          studentName={managingGuardiansForStudent.name}
          onClose={() => setManagingGuardiansForStudent(null)}
          onGuardiansChanged={onStudentsChanged}
        />
      )}
    </div>
  );
}
