import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Course } from '../types';

interface CourseManagementProps {
  studentId: string;
  onClose: () => void;
  onCourseAdded: () => void;
}

export function CourseManagement({ studentId, onClose, onCourseAdded }: CourseManagementProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    name: '',
    gradeLevel: 9,
    academicYear: '',
    semester: 'Fall',
    creditHours: 1,
    grade: 'A'
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('courses')
      .insert([{
        student_id: studentId,
        name: formData.name,
        grade_level: formData.gradeLevel,
        academic_year: formData.academicYear,
        semester: formData.semester,
        credit_hours: formData.creditHours,
        grade: formData.grade
      }]);

    if (error) {
      console.error('Error creating course:', error);
    } else {
      onCourseAdded();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Course</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grade Level
            </label>
            <select
              value={formData.gradeLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: parseInt(e.target.value) as 9 | 10 | 11 | 12 }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={9}>9th Grade</option>
              <option value={10}>10th Grade</option>
              <option value={11}>11th Grade</option>
              <option value={12}>12th Grade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <input
              type="text"
              required
              placeholder="2023-2024"
              value={formData.academicYear}
              onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value as 'Fall' | 'Spring' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Hours
            </label>
            <input
              type="number"
              required
              min="0.5"
              step="0.5"
              value={formData.creditHours}
              onChange={(e) => setFormData(prev => ({ ...prev, creditHours: parseFloat(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grade
            </label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}