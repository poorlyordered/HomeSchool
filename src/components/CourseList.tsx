import { useState, useCallback } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { CourseManagement } from "./CourseManagement";
import { GroupedCourseList } from "./GroupedCourseList";
import type { Course } from "../types";

interface CourseListProps {
  studentId: string;
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export function CourseList({
  studentId,
  courses,
  onEditCourse,
  onDeleteCourse,
}: CourseListProps) {
  const [showCourseManagement, setShowCourseManagement] = useState(false);

  // Log studentId for debugging
  console.log("CourseList received studentId:", studentId);

  // Define callbacks outside of JSX
  const handleClose = useCallback(() => {
    console.log("Closing CourseManagement");
    setShowCourseManagement(false);
  }, []);

  const handleCourseAdded = useCallback(() => {
    console.log("Course added, dispatching refreshCourses event");
    setShowCourseManagement(false);
    // Let parent know to refresh courses
    window.dispatchEvent(new CustomEvent("refreshCourses"));
  }, []);

  const calculateGPA = useCallback(() => {
    const gradePoints = {
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      F: 0.0,
    };

    const totalPoints = courses.reduce(
      (sum, course) =>
        sum +
        gradePoints[course.grade as keyof typeof gradePoints] *
          course.creditHours,
      0,
    );
    const totalCredits = courses.reduce(
      (sum, course) => sum + course.creditHours,
      0,
    );

    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  }, [courses]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Course History</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">GPA: {calculateGPA()}</span>
          <button
            onClick={() => setShowCourseManagement(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            Add Course
          </button>
        </div>
      </div>

      {courses.length > 0 ? (
        <GroupedCourseList
          courses={courses}
          renderCourseRow={(course) => (
            <tr key={course.id} className="border-t border-gray-100">
              <td className="px-4 py-3 text-sm text-gray-800">
                {course.gradeLevel}th
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {course.academicYear}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {course.semester}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{course.name}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {course.creditHours}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {course.grade}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditCourse(course)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      ) : (
        <p className="text-center py-4 text-gray-500">No courses added yet.</p>
      )}
      {showCourseManagement && (
        <CourseManagement
          studentId={studentId}
          onClose={handleClose}
          onCourseAdded={handleCourseAdded}
        />
      )}
    </div>
  );
}
