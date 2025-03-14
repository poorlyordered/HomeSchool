import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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

export function useCourseManagement({
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

    // Track course selection for popularity
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

  // Handle form submission
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

  return {
    // State
    formData,
    notification,
    loading,
    standardCourses,
    filteredCourses,
    selectedCourse,
    selectedCategory,
    categories,
    categoryCounts,
    loadingCourses,
    searchQuery,

    // Setters
    setFormData,
    setSearchQuery,
    setSelectedCategory,
    setNotification,

    // Functions
    handleCourseSelect,
    handleSubmit,
    getCategoryCount,
    generateAcademicYearOptions,
  };
}
