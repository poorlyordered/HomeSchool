import React from "react";
import type { Course } from "../../types";

interface CourseFormProps {
  formData: Omit<Course, "id">;
  onFormChange: (formData: Omit<Course, "id">) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  onCancel: () => void;
  generateAcademicYearOptions: () => string[];
}

export function CourseForm({
  formData,
  onFormChange,
  onSubmit,
  loading,
  onCancel,
  generateAcademicYearOptions,
}: CourseFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Course Details</h3>

      <div>
        <label
          htmlFor="course-name"
          className="block text-sm font-medium text-gray-700"
        >
          Course Name
        </label>
        <input
          id="course-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="grade-level"
          className="block text-sm font-medium text-gray-700"
        >
          Grade Level
        </label>
        <select
          id="grade-level"
          value={formData.gradeLevel}
          onChange={(e) =>
            onFormChange({
              ...formData,
              gradeLevel: parseInt(e.target.value) as 9 | 10 | 11 | 12,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={9}>9th Grade</option>
          <option value={10}>10th Grade</option>
          <option value={11}>11th Grade</option>
          <option value={12}>12th Grade</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="academic-year"
          className="block text-sm font-medium text-gray-700"
        >
          Academic Year
        </label>
        <select
          id="academic-year"
          required
          value={formData.academicYear}
          onChange={(e) =>
            onFormChange({
              ...formData,
              academicYear: e.target.value,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Academic Year</option>
          {generateAcademicYearOptions().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="semester"
          className="block text-sm font-medium text-gray-700"
        >
          Semester
        </label>
        <select
          id="semester"
          value={formData.semester}
          onChange={(e) =>
            onFormChange({
              ...formData,
              semester: e.target.value as "Fall" | "Spring",
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Fall">Fall</option>
          <option value="Spring">Spring</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="credit-hours"
          className="block text-sm font-medium text-gray-700"
        >
          Credit Hours
        </label>
        <input
          id="credit-hours"
          type="number"
          required
          min="0.5"
          step="0.5"
          value={formData.creditHours}
          onChange={(e) =>
            onFormChange({
              ...formData,
              creditHours: parseFloat(e.target.value),
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="grade"
          className="block text-sm font-medium text-gray-700"
        >
          Grade
        </label>
        <select
          id="grade"
          value={formData.grade}
          onChange={(e) => onFormChange({ ...formData, grade: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="A">A</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B">B</option>
          <option value="B-">B-</option>
          <option value="C+">C+</option>
          <option value="C">C</option>
          <option value="C-">C-</option>
          <option value="D+">D+</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Course"}
        </button>
      </div>
    </form>
  );
}
