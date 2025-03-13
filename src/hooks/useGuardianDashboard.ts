import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { handleAndDisplayError, withErrorHandling } from "../lib/errorHandling";
import type { User, Student, StudentData } from "../types";

export interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

export function useGuardianDashboard(user: User) {
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [testScoresLoading, setTestScoresLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    message: "",
  });
  const [pdfOptions, setPdfOptions] = useState({
    includeTestScores: true,
    includeGPA: true,
    issueDate: new Date().toISOString().split("T")[0],
    administratorName: user.profile.name || user.email || "",
  });
  const [student, setStudent] = useState<Student>({
    school: {
      name: "",
      address: "",
      phone: "",
      id: "",
      created_at: "",
    },
    info: {
      id: "",
      name: "",
      birthDate: "",
      graduationDate: "",
    },
    courses: [],
    testScores: [],
    transcriptMeta: {
      issueDate: new Date().toISOString().split("T")[0],
      administrator: user.email || "",
    },
  });

  // Function to load test scores for a student
  const loadTestScores = useCallback(async (studentId: string) => {
    setTestScoresLoading(true);

    console.log("Loading test scores for student ID:", studentId);

    try {
      // Load test scores
      const { data: testScoresData, error: testScoresError } = await supabase
        .from("test_scores")
        .select("*")
        .eq("student_id", studentId);

      if (testScoresError) {
        console.error("Error loading test scores:", testScoresError);
        throw testScoresError;
      }

      if (!testScoresData || testScoresData.length === 0) {
        setStudent((prev) => ({
          ...prev,
          testScores: [],
        }));
        setTestScoresLoading(false);
        return;
      }

      // Load test sections for each test score
      const testScores = await Promise.all(
        testScoresData.map(async (testScore) => {
          const { data: sectionsData, error: sectionsError } = await supabase
            .from("test_sections")
            .select("*")
            .eq("test_score_id", testScore.id);

          if (sectionsError) {
            console.error("Error loading test sections:", sectionsError);
            throw sectionsError;
          }

          // Transform the data to match the TestScore type
          const sections = sectionsData.map((section) => ({
            name: section.name,
            score: section.score,
          }));

          return {
            id: testScore.id,
            type: testScore.type as "ACT" | "SAT",
            date: testScore.date,
            scores: {
              total: testScore.total_score,
              sections,
            },
          };
        }),
      );

      console.log("Transformed test scores:", testScores);

      setStudent((prev) => ({
        ...prev,
        testScores,
      }));
    } catch (error) {
      handleAndDisplayError(error);
    } finally {
      setTestScoresLoading(false);
    }
  }, []);

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
        console.error("Error loading courses:", error);
        throw error;
      }

      console.log("Courses data from Supabase:", data);

      if (data) {
        // Transform the data to match the Course type with category
        const courses = data.map((course) => ({
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

        console.log("Transformed courses:", courses);

        setStudent((prev) => ({
          ...prev,
          courses,
        }));
      }
    } catch (error) {
      handleAndDisplayError(error);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    // First check if the student_guardians table exists
    let useJunctionTable = false;
    try {
      // Try to get the table info to see if it exists
      const { error: tableCheckError } = await supabase
        .from("student_guardians")
        .select("id")
        .limit(1);

      // If no error, the table exists
      if (!tableCheckError) {
        useJunctionTable = true;
      }
    } catch (err) {
      console.log(
        "student_guardians table does not exist yet, using legacy approach",
        err,
      );
    }

    if (useJunctionTable) {
      try {
        // Load students from the student_guardians junction table
        const { data: guardianData, error: guardianError } = await supabase
          .from("student_guardians")
          .select(
            `
            student_id,
            is_primary,
            students(id, student_id, name, birth_date, graduation_date)
          `,
          )
          .eq("guardian_id", user.id);

        if (guardianError) {
          throw guardianError;
        }

        if (guardianData && guardianData.length > 0) {
          // Extract student data from the nested structure
          const processedStudents: StudentData[] = [];

          for (const item of guardianData) {
            // Safely access nested properties with type assertion
            const studentObj = item.students;

            if (studentObj && typeof studentObj === "object") {
              // Use type assertion with unknown first to avoid TypeScript errors
              const typedStudentObj = studentObj as unknown as {
                id: string;
                student_id: string;
                name: string;
                birth_date: string;
                graduation_date: string;
              };

              processedStudents.push({
                id: typedStudentObj.id,
                student_id: typedStudentObj.student_id,
                name: typedStudentObj.name,
                birth_date: typedStudentObj.birth_date,
                graduation_date: typedStudentObj.graduation_date,
              });
            }
          }

          if (processedStudents.length > 0) {
            setStudents(processedStudents);

            // Select the first student by default if none is selected
            if (!selectedStudentId) {
              // Find primary student if available
              const primaryItem = guardianData.find((item) => item.is_primary);
              let firstStudent: StudentData;

              if (primaryItem && primaryItem.students) {
                // Use type assertion with unknown first to avoid TypeScript errors
                const typedPrimaryStudentObj =
                  primaryItem.students as unknown as {
                    id: string;
                    student_id: string;
                    name: string;
                    birth_date: string;
                    graduation_date: string;
                  };

                firstStudent = {
                  id: typedPrimaryStudentObj.id,
                  student_id: typedPrimaryStudentObj.student_id,
                  name: typedPrimaryStudentObj.name,
                  birth_date: typedPrimaryStudentObj.birth_date,
                  graduation_date: typedPrimaryStudentObj.graduation_date,
                };
              } else {
                firstStudent = processedStudents[0];
              }

              setSelectedStudentId(firstStudent.id);

              // Update the student state with the selected student's data
              setStudent((prev) => ({
                ...prev,
                info: {
                  id: firstStudent.student_id,
                  name: firstStudent.name,
                  birthDate: firstStudent.birth_date,
                  graduationDate: firstStudent.graduation_date,
                },
              }));
            }
          }

          return;
        }
      } catch (error) {
        console.error("Error loading students from student_guardians:", error);
      }
    }

    // Fallback to the old method if the junction table doesn't exist yet or had an error
    try {
      const { data: legacyData, error: legacyError } = await supabase
        .from("students")
        .select("*")
        .eq("guardian_id", user.id);

      if (legacyError) {
        throw legacyError;
      }

      if (legacyData && legacyData.length > 0) {
        setStudents(legacyData);
        // Select the first student by default if none is selected
        if (!selectedStudentId) {
          setSelectedStudentId(legacyData[0].id);

          // Update the student state with the selected student's data
          setStudent((prev) => ({
            ...prev,
            info: {
              id: legacyData[0].student_id,
              name: legacyData[0].name,
              birthDate: legacyData[0].birth_date,
              graduationDate: legacyData[0].graduation_date,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id, selectedStudentId]);

  useEffect(() => {
    async function loadData() {
      // Load school data
      const { data: schools } = await supabase
        .from("schools")
        .select("*")
        .eq("guardian_id", user.id)
        .limit(1);

      if (!schools?.length) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      setStudent((prev) => ({
        ...prev,
        school: schools[0],
      }));

      // Load student data
      await loadStudents();

      setLoading(false);
    }

    loadData();
  }, [user.id, loadStudents]);

  // Update student info and load courses when selectedStudentId changes
  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const selectedStudent = students.find((s) => s.id === selectedStudentId);
      if (selectedStudent) {
        setStudent((prev) => ({
          ...prev,
          info: {
            id: selectedStudent.student_id,
            name: selectedStudent.name,
            birthDate: selectedStudent.birth_date,
            graduationDate: selectedStudent.graduation_date,
          },
        }));

        // Load courses and test scores for the selected student
        loadCourses(selectedStudent.id);
        loadTestScores(selectedStudent.id);
      }
    }
  }, [selectedStudentId, students, loadCourses, loadTestScores]);

  // Listen for the refreshCourses and refreshTestScores events
  useEffect(() => {
    const handleRefreshCourses = () => {
      if (selectedStudentId) {
        loadCourses(selectedStudentId);
      }
    };

    const handleRefreshTestScores = () => {
      if (selectedStudentId) {
        loadTestScores(selectedStudentId);
      }
    };

    window.addEventListener("refreshCourses", handleRefreshCourses);
    window.addEventListener("refreshTestScores", handleRefreshTestScores);

    return () => {
      window.removeEventListener("refreshCourses", handleRefreshCourses);
      window.removeEventListener("refreshTestScores", handleRefreshTestScores);
    };
  }, [selectedStudentId, loadCourses, loadTestScores]);

  const handleDeleteCourse = withErrorHandling(async (id: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setStudent((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== id),
      }));

      setNotification({
        show: true,
        type: "success",
        message: "Course deleted successfully!",
      });
    } catch (error) {
      handleAndDisplayError(error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to delete course. Please try again.",
      });
    }
  });

  const handleDeleteScore = withErrorHandling(async (id: string) => {
    try {
      // First delete the test sections
      const { error: sectionsError } = await supabase
        .from("test_sections")
        .delete()
        .eq("test_score_id", id);

      if (sectionsError) {
        throw sectionsError;
      }

      // Then delete the test score
      const { error: scoreError } = await supabase
        .from("test_scores")
        .delete()
        .eq("id", id);

      if (scoreError) {
        throw scoreError;
      }

      // Update local state
      setStudent((prev) => ({
        ...prev,
        testScores: prev.testScores.filter((score) => score.id !== id),
      }));

      setNotification({
        show: true,
        type: "success",
        message: "Test score deleted successfully!",
      });
    } catch (error) {
      handleAndDisplayError(error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to delete test score. Please try again.",
      });
    }
  });

  return {
    loading,
    coursesLoading,
    testScoresLoading,
    pdfLoading,
    setPdfLoading,
    needsSetup,
    showStudentManagement,
    setShowStudentManagement,
    showAccountSettings,
    setShowAccountSettings,
    showPdfPreview,
    setShowPdfPreview,
    pdfPreviewUrl,
    setPdfPreviewUrl,
    pdfError,
    setPdfError,
    students,
    selectedStudentId,
    setSelectedStudentId,
    notification,
    setNotification,
    pdfOptions,
    setPdfOptions,
    student,
    setStudent,
    loadTestScores,
    loadCourses,
    loadStudents,
    handleDeleteCourse,
    handleDeleteScore,
  };
}
