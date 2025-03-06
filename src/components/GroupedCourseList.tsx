import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Course } from "../types";

interface GroupedCourseListProps {
  courses: Course[];
  renderCourseRow: (course: Course) => React.ReactNode;
}

export function GroupedCourseList({
  courses,
  renderCourseRow,
}: GroupedCourseListProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Group courses by category using useMemo to avoid recreating on every render
  const coursesByCategory = useMemo(() => {
    const groupedCourses: Record<string, Course[]> = {};

    courses.forEach((course) => {
      const category = course.category || "Uncategorized";
      if (!groupedCourses[category]) {
        groupedCourses[category] = [];
      }
      groupedCourses[category].push(course);
    });

    return groupedCourses;
  }, [courses]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Get color for category
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      Mathematics: "bg-blue-100 border-blue-300",
      "Language Arts/Reading": "bg-purple-100 border-purple-300",
      Science: "bg-green-100 border-green-300",
      "History/Social Studies": "bg-yellow-100 border-yellow-300",
      Health: "bg-red-100 border-red-300",
      STEM: "bg-teal-100 border-teal-300",
      "Fine Arts": "bg-pink-100 border-pink-300",
      "Foreign Language": "bg-indigo-100 border-indigo-300",
      "Career & Technical Education": "bg-orange-100 border-orange-300",
      Uncategorized: "bg-gray-100 border-gray-300",
    };

    return colorMap[category] || "bg-gray-100 border-gray-300";
  };

  // Expand all categories by default
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(coursesByCategory).forEach((category) => {
      initialExpanded[category] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [coursesByCategory]);

  return (
    <div className="space-y-4">
      {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
        <div
          key={category}
          className={`border rounded-md overflow-hidden ${getCategoryColor(category)}`}
        >
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            <div className="flex items-center gap-2">
              {expandedCategories[category] ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
              <h3 className="font-medium text-gray-800">{category}</h3>
              <span className="text-sm text-gray-500">
                ({categoryCourses.length})
              </span>
            </div>
          </div>

          {expandedCategories[category] && (
            <div className="overflow-x-auto bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Grade Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Academic Year
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Semester
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoryCourses.map((course) => renderCourseRow(course))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
