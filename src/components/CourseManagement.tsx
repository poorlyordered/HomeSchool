import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Notification } from "./Notification";
import type { Course, StandardCourse } from "../types";

interface CourseManagementProps {
  studentId: string;
  onClose: () => void;
  onCourseAdded: () => void;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

interface CategoryCount {
  [key: string]: number;
}

export function CourseManagement({
  studentId,
  onClose,
  onCourseAdded,
}: CourseManagementProps) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    message: "",
  });
  const [formData, setFormData] = useState<Omit<Course, "id">>({
    name: "",
    gradeLevel: 9,
    academicYear: "",
    semester: "Fall",
    creditHours: 1,
    grade: "A",
  });

  // Generate academic year options
  function generateAcademicYearOptions(): string[] {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; // Start 2 years back
    const endYear = currentYear + 1; // Go 1 year ahead

    const options: string[] = [];

    for (let year = startYear; year <= endYear; year++) {
      options.push(`${year}-${year + 1}`);
    }

    return options;
  }

  // Standard courses state
  const [standardCourses, setStandardCourses] = useState<StandardCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<StandardCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<StandardCourse | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount>({});
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load standard courses on component mount
  useEffect(() => {
    loadStandardCourses();
  }, []);

  // Filter courses based on search query and selected category
  useEffect(() => {
    if (searchQuery.trim() === "" && !selectedCategory) {
      setFilteredCourses([]);
      return;
    }

    let filtered = standardCourses;

    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory,
      );
    }

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query),
      );
    }

    // Limit to 5 results for better UI
    setFilteredCourses(filtered.slice(0, 5));
  }, [searchQuery, selectedCategory, standardCourses]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loading) {
      timeoutId = setTimeout(() => {
        setLoading(false);
        setNotification({
          show: true,
          type: "error",
          message: "Operation timed out. Please try again.",
        });
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Load standard courses from the database
  async function loadStandardCourses() {
    try {
      setLoadingCourses(true);

      const { data, error } = await supabase
        .from("standard_courses")
        .select("*");

      if (error) throw error;

      if (data) {
        setStandardCourses(data);

        // Extract unique categories and count courses in each category
        const uniqueCategories = Array.from(
          new Set(data.map((course) => course.category)),
        );
        setCategories(uniqueCategories);

        const counts: CategoryCount = {};
        data.forEach((course) => {
          counts[course.category] = (counts[course.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    } catch (error) {
      console.error("Error loading standard courses:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to load course catalog. Please try again.",
      });
    } finally {
      setLoadingCourses(false);
    }
  }

  // Handle course selection
  function handleCourseSelect(course: StandardCourse) {
    setSelectedCourse(course);
    setFormData((prev) => ({
      ...prev,
      name: course.name,
      creditHours: course.isSemester ? 0.5 : 1,
    }));
    setSearchQuery("");
    setFilteredCourses([]);

    // Track course selection for popularity (in a real app, we'd call the increment function)
    try {
      supabase
        .rpc("increment_course_popularity", {
          course_id: course.id,
        })
        .then(({ error }) => {
          if (error) console.error("Error tracking course selection:", error);
        });
    } catch (error) {
      console.error("Error in tracking:", error);
    }
  }

  // Get count for a specific category
  function getCategoryCount(category: string): number {
    return categoryCounts[category] || 0;
  }

  // Direct function with simplified error handling
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    console.log("Submitting course form with student ID:", studentId);
    console.log("Form data:", formData);

    try {
      // Validate student ID
      if (!studentId) {
        console.error("Student ID is missing");
        setNotification({
          show: true,
          type: "error",
          message: "Student ID is missing. Please try again.",
        });
        setLoading(false);
        return;
      }

      // Create the course data object
      const courseData = {
        student_id: studentId,
        name: formData.name,
        grade_level: formData.gradeLevel,
        academic_year: formData.academicYear,
        semester: formData.semester,
        credit_hours: formData.creditHours,
        grade: formData.grade,
        standard_course_id: selectedCourse?.id, // Add reference to standard course
      };

      console.log("Inserting course with data:", courseData);

      // Insert the course - using a simpler approach without .select()
      const { error } = await supabase.from("courses").insert([courseData]);

      if (error) {
        console.error("Supabase error:", error);
        setNotification({
          show: true,
          type: "error",
          message: `Database error: ${error.message}`,
        });
        setLoading(false);
        return;
      }

      console.log("Course added successfully");

      // Show success notification
      setNotification({
        show: true,
        type: "success",
        message: "Course added successfully!",
      });

      // Notify parent components
      onCourseAdded();

      // Close after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error adding course:", error);

      // Show a notification with the error message
      const errorMessage =
        error instanceof Error
          ? `Error: ${error.message}`
          : "Failed to add course. Please try again.";

      setNotification({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      console.log("Form submission complete, resetting loading state");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
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

        {/* Standard Course Catalog Search */}
        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Standard Course Catalog</h3>
            {/* Future enhancement: Add custom course button */}
          </div>

          {/* Category Filter */}
          <div className="mb-3">
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loadingCourses}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category} ({getCategoryCount(category)})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="mb-3">
            <label
              htmlFor="course-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Courses
            </label>
            <input
              id="course-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search courses..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loadingCourses}
            />
          </div>

          {/* Search Results */}
          {loadingCourses ? (
            <div className="text-center py-3">
              <p className="text-gray-500">Loading course catalog...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <li
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-gray-500">
                      {course.category}
                    </div>
                    {course.isSemester && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Semester
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : searchQuery.trim() !== "" || selectedCategory ? (
            <div className="text-center py-3">
              <p className="text-gray-500">No matching courses found</p>
            </div>
          ) : null}

          {/* Selected Course */}
          {selectedCourse && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-700">
                Selected:{" "}
                <span className="font-medium">{selectedCourse.name}</span>
              </p>
              <p className="text-xs text-gray-500">{selectedCourse.category}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
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
                setFormData((prev) => ({
                  ...prev,
                  gradeLevel: parseInt(e.target.value) as 9 | 10 | 11 | 12,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  academicYear: e.target.value,
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  semester: e.target.value as "Fall" | "Spring",
                }))
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
                setFormData((prev) => ({
                  ...prev,
                  creditHours: parseFloat(e.target.value),
                }))
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, grade: e.target.value }))
              }
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
              {loading ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
