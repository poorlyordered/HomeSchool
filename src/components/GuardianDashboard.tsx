import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  School as SchoolIcon,
  Phone,
  MapPin,
  FileDown,
  LogOut,
  Settings,
} from "lucide-react";
import { Users } from "lucide-react";
import { signOut } from "../lib/auth";
import { pdf } from "@react-pdf/renderer";
import { TranscriptPDF } from "./TranscriptPDF";
import { supabase } from "../lib/supabase";
import { handleAndDisplayError, withErrorHandling } from "../lib/errorHandling";
import { StudentManagement } from "./StudentManagement";
import { AccountSettings } from "./AccountSettings";
import { GuardianSetup } from "./GuardianSetup";
import { CourseList } from "./CourseList";
import { TestScores } from "./TestScores";
import { Notification } from "./Notification";
import type { Course, TestScore, Student, User } from "../types";

interface StudentData {
  id: string;
  student_id: string;
  name: string;
  birth_date: string;
  graduation_date: string;
}

interface GuardianDashboardProps {
  user: User;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    message: "",
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

  // Function to load courses for a student - defined before it's used in useEffect
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
        const courses: Course[] = data.map((course) => ({
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

        // Load courses for the selected student
        loadCourses(selectedStudent.id);
      }
    }
  }, [selectedStudentId, students, loadCourses]);

  // Listen for the refreshCourses event
  useEffect(() => {
    const handleRefreshCourses = () => {
      if (selectedStudentId) {
        loadCourses(selectedStudentId);
      }
    };

    window.addEventListener("refreshCourses", handleRefreshCourses);

    return () => {
      window.removeEventListener("refreshCourses", handleRefreshCourses);
    };
  }, [selectedStudentId, loadCourses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (needsSetup) {
    return <GuardianSetup onComplete={() => setNeedsSetup(false)} />;
  }

  const handleEditCourse = withErrorHandling(async (course: Course) => {
    // This would typically open a modal with the course data for editing
    // For now, we'll just show a notification that this feature is coming soon
    console.log("Edit course requested for:", course.name);
    setNotification({
      show: true,
      type: "info",
      message: `Course editing for "${course.name}" will be implemented in a future update.`,
    });
  });

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

  const handleEditScore = (score: TestScore) => {
    // Implementation for editing a test score would go here
    console.log("Edit score", score);
  };

  const handleDeleteScore = (id: string) => {
    setStudent((prev) => ({
      ...prev,
      testScores: prev.testScores.filter((score) => score.id !== id),
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Force a page reload to clear React state and re-check authentication
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGeneratePDF = async () => {
    const blob = await pdf(<TranscriptPDF student={student} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.info.name.replace(/\s+/g, "_")}_transcript.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SchoolIcon size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {student.school.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {student.school.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {student.school.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Users size={14} />
                    Guardian: {user.profile.name || user.email}
                  </div>
                </div>
              </div>
            </div>

            {students.length > 0 ? (
              <>
                {students.length > 1 && (
                  <div className="mb-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Student
                    </label>
                    <select
                      value={selectedStudentId || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedStudentId(id);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {student.info.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Student ID: {student.info.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={20} className="text-blue-600" />
                      <span className="font-semibold">
                        Expected Graduation: {student.info.graduationDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Date of Birth: {student.info.birthDate}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center pt-2 border-t">
                <p className="text-gray-600 italic">
                  No students found. Click "Manage Students" to add a student.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setShowStudentManagement(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Users size={20} />
              Manage Students
            </button>
            <button
              onClick={() => setShowAccountSettings(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Settings size={20} />
              Account Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {students.length > 0 ? (
          <div className="space-y-8">
            {notification.show && (
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() =>
                  setNotification({ ...notification, show: false })
                }
              />
            )}
            <CourseList
              studentId={selectedStudentId || ""}
              courses={student.courses}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />
            {coursesLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            <TestScores
              studentId={student.info.id}
              scores={student.testScores}
              onEditScore={handleEditScore}
              onDeleteScore={handleDeleteScore}
            />
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Issue Date: {student.transcriptMeta.issueDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    Administrator: {student.transcriptMeta.administrator}
                  </p>
                </div>
                <button
                  onClick={handleGeneratePDF}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FileDown size={20} />
                  Download Official Transcript
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-lg text-gray-700">
              Please add a student to get started.
            </p>
            <button
              onClick={() => setShowStudentManagement(true)}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mx-auto"
            >
              <Users size={20} />
              Add Student
            </button>
          </div>
        )}
      </main>
      {showStudentManagement && (
        <StudentManagement
          user={user}
          onClose={() => setShowStudentManagement(false)}
          onStudentsChanged={loadStudents}
        />
      )}
      {showAccountSettings && (
        <AccountSettings
          user={user}
          onClose={() => setShowAccountSettings(false)}
        />
      )}
    </div>
  );
}
