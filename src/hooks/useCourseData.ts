import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { Course } from "../types";

export function useCourseData() {
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Function to load courses for a student
  const loadCourses = useCallback(async (studentId: string) => {
    setCoursesLoading(true);

    console.log("Loading courses for student ID:", studentId);

    try {
      // Load courses with category information
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          *,
          standard_course:standard_courses(id, category)
        `,
        )
        .eq("student_id", studentId);

      if (error) {
        throw error;
      }

      console.log("Courses data from Supabase:", data);

      if (data) {
        // Transform the data to match the Course type with category
        const transformedCourses: Course[] = data.map((course) => ({
          id: course.id,
          name: course.name,
          gradeLevel: course.grade_level as 9 | 10 | 11 | 12,
          academicYear: course.academic_year,
          semester: course.semester as "Fall" | "Spring",
          creditHours: course.credit_hours,
          grade: course.grade,
          category: course.standard_course
            ? course.standard_course.category
            : "Uncategorized",
          standardCourseId: course.standard_course_id,
        }));

        console.log("Transformed courses:", transformedCourses);
        setCourses(transformedCourses);
      }
    } catch (error) {
      handleAndDisplayError(error, "useCourseData.loadCourses");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const handleDeleteCourse = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setCourses((prev) => prev.filter((course) => course.id !== id));

      return { success: true, message: "Course deleted successfully!" };
    } catch (error) {
      handleAndDisplayError(error, "useCourseData.handleDeleteCourse");
      return {
        success: false,
        message: "Failed to delete course. Please try again.",
      };
    }
  }, []);

  return {
    courses,
    coursesLoading,
    loadCourses,
    handleDeleteCourse,
  };
}
