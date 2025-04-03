import { useState, useEffect } from "react";
import {
  GraduationCap,
  School as SchoolIcon,
  Phone,
  MapPin,
  LogOut,
  Settings,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { signOut } from "../lib/auth";
import { handleAndDisplayError } from "../lib/errorHandling";
import type { Student, User, TestScore } from "../types";
import { AccountSettings } from "./AccountSettings";
import { CourseList } from "./CourseList";

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  // State for notifications
  const [notification, setNotification] = useState({
    show: false,
    type: "success" as "success" | "error" | "info",
    message: "",
  });

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    async function loadStudentData() {
      try {
        // Load student basic data
        const { data: studentData } = await supabase
          .from("students")
          .select(
            `
            *,
            school:schools(*)
          `,
          )
          .eq("id", user.id)
          .single();

        if (!studentData) {
          setLoading(false);
          return;
        }

        // Load courses with category information
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(
            `
            *,
            standard_course:standard_courses(id, category)
          `,
          )
          .eq("student_id", studentData.id);

        if (coursesError) {
          handleAndDisplayError(coursesError, "StudentDashboard.loadCourses");
        }

        // Transform courses data to include category
        const courses = (coursesData || []).map((course) => ({
          id: course.id,
          name: course.name,
          gradeLevel: course.grade_level,
          academicYear: course.academic_year,
          semester: course.semester,
          creditHours: course.credit_hours,
          grade: course.grade,
          category: course.standard_course
            ? course.standard_course.category
            : "Uncategorized",
          standardCourseId: course.standard_course_id,
        }));

        // Load test scores
        const { data: testScoresData, error: testScoresError } = await supabase
          .from("test_scores")
          .select("*")
          .eq("student_id", studentData.id);

        if (testScoresError) {
          handleAndDisplayError(
            testScoresError,
            "StudentDashboard.loadTestScores",
          );
        }

        // Initialize with empty test scores
        let testScores: TestScore[] = [];

        // If we have test scores, load their sections
        if (testScoresData && testScoresData.length > 0) {
          testScores = await Promise.all(
            testScoresData.map(async (testScore) => {
              const { data: sectionsData, error: sectionsError } =
                await supabase
                  .from("test_sections")
                  .select("*")
                  .eq("test_score_id", testScore.id);

              if (sectionsError) {
                handleAndDisplayError(
                  sectionsError,
                  "StudentDashboard.loadTestSections",
                );
                return {
                  id: testScore.id,
                  type: testScore.type as "ACT" | "SAT",
                  date: testScore.date,
                  scores: {
                    total: testScore.total_score,
                    sections: [],
                  },
                };
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
        }

        setStudent({
          ...studentData,
          courses,
          testScores,
          transcriptMeta: {
            issueDate: new Date().toISOString().split("T")[0],
            administrator: "",
          },
        });
      } catch (error) {
        handleAndDisplayError(error, "StudentDashboard.loadStudentData");
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            No Student Record Found
          </h2>
          <p className="mt-2 text-gray-600">
            Please contact your guardian to set up your student profile.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Wait for signOut to complete including the delay
      await signOut();

      // Add a notification before redirecting
      setNotification({
        show: true,
        type: "success",
        message: "Logged out successfully. Redirecting...",
      });

      // Short delay before redirect to show the notification
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      handleAndDisplayError(error, "StudentDashboard.handleLogout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          <div className="space-y-4 flex-grow">
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
                </div>
              </div>
            </div>
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
          </div>
          <div className="flex items-center gap-2 mt-4">
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
        <div className="space-y-8">
          {/* Course list with category grouping */}
          <CourseList
            studentId={user.id}
            courses={student.courses}
            onEditCourse={(course) => {
              // Read-only in student view
              console.log("Edit course not available in student view", course);
            }}
            onDeleteCourse={(id) => {
              // Read-only in student view
              console.log("Delete course not available in student view", id);
            }}
          />

          {/* Read-only test scores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Standardized Test Scores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.testScores.map((score) => (
                <div key={score.id} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{score.type}</h3>
                    <p className="text-sm text-gray-600">{score.date}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Score:</span>
                      <span>{score.scores.total}</span>
                    </div>
                    {score.scores.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{section.name}:</span>
                        <span>{section.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          } text-white`}
        >
          {notification.message}
        </div>
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
