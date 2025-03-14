import type { StandardCourse } from "../../types";

interface SelectedCourseDisplayProps {
  course: StandardCourse;
}

export function SelectedCourseDisplay({ course }: SelectedCourseDisplayProps) {
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-md">
      <p className="text-sm text-gray-700">
        Selected: <span className="font-medium">{course.name}</span>
      </p>
      <p className="text-xs text-gray-500">{course.category}</p>
    </div>
  );
}
