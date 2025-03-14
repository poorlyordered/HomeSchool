import type { StandardCourse } from "../../types";

interface CourseResultsProps {
  filteredCourses: StandardCourse[];
  loadingCourses: boolean;
  searchQuery: string;
  selectedCategory: string;
  onCourseSelect: (course: StandardCourse) => void;
}

export function CourseResults({
  filteredCourses,
  loadingCourses,
  searchQuery,
  selectedCategory,
  onCourseSelect,
}: CourseResultsProps) {
  if (loadingCourses) {
    return (
      <div className="text-center py-3">
        <p className="text-gray-500">Loading course catalog...</p>
      </div>
    );
  }

  if (filteredCourses.length > 0) {
    return (
      <div className="border rounded-md max-h-40 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {filteredCourses.map((course) => (
            <li
              key={course.id}
              onClick={() => onCourseSelect(course)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium">{course.name}</div>
              <div className="text-sm text-gray-500">{course.category}</div>
              {course.isSemester && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Semester
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (searchQuery.trim() !== "" || selectedCategory) {
    return (
      <div className="text-center py-3">
        <p className="text-gray-500">No matching courses found</p>
      </div>
    );
  }

  return null;
}
