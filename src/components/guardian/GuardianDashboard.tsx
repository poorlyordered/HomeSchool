import { useState, useEffect } from "react";
import { signOut } from "../../lib/auth";
import { handleAndDisplayError } from "../../lib/errorHandling";
import { useGuardianDashboard } from "../../hooks/useGuardianDashboard";
import { usePdfGeneration } from "../../hooks/usePdfGeneration";
import { GuardianHeader } from "./GuardianHeader";
import { TranscriptSection } from "./TranscriptSection";
import { PDFPreviewModal } from "./PDFPreviewModal";
import { StudentManagement } from "../StudentManagement";
import { AccountSettings } from "../AccountSettings";
import { CourseManagement } from "../CourseManagement";
import { TestScores } from "../TestScores";
import { TestScoreManagement } from "../TestScoreManagement";
import { CourseList } from "../CourseList";
import type { User } from "../../types";

interface GuardianDashboardProps {
  user: User;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  // Use the custom hooks
  const {
    loading,
    coursesLoading,
    testScoresLoading,
    needsSetup,
    showStudentManagement,
    setShowStudentManagement,
    showAccountSettings,
    setShowAccountSettings,
    notification,
    setNotification,
    students,
    selectedStudentId,
    setSelectedStudentId,
    student,
    handleDeleteCourse,
    handleDeleteScore,
  } = useGuardianDashboard(user);

  const {
    pdfLoading,
    pdfPreviewState,
    pdfOptions,
    setPdfOptions,
    cleanupPdfPreview,
    regeneratePreview,
    handlePreviewPDF,
    handleDownloadPDF,
  } = usePdfGeneration(student);

  // State for showing course management
  const [showCourseManagement, setShowCourseManagement] = useState(false);
  // State for showing test score management
  const [showTestScoreManagement, setShowTestScoreManagement] = useState(false);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

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
      handleAndDisplayError(error, "GuardianDashboard.handleLogout");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome to HomeSchool
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your school and student information
          </p>
          <div className="mt-5">
            <button
              onClick={() => setShowStudentManagement(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with school and student information */}
      <GuardianHeader
        user={user}
        student={student}
        students={students}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        onManageStudents={() => setShowStudentManagement(true)}
        onOpenAccountSettings={() => setShowAccountSettings(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Course list with category grouping */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Courses</h2>
              <button
                onClick={() => setShowCourseManagement(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Course
              </button>
            </div>

            {coursesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <CourseList
                studentId={selectedStudentId || ""}
                courses={student?.courses || []}
                onEditCourse={() => {
                  setShowCourseManagement(true);
                }}
                onDeleteCourse={handleDeleteCourse}
              />
            )}
          </div>

          {/* Test scores section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Standardized Test Scores
              </h2>
              <button
                onClick={() => setShowTestScoreManagement(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Test Score
              </button>
            </div>

            {testScoresLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <TestScores
                scores={student?.testScores || []}
                onDeleteScore={handleDeleteScore}
                onEditScore={() => setShowTestScoreManagement(true)}
                studentId={selectedStudentId || ""}
              />
            )}
          </div>

          {/* Transcript section */}
          <TranscriptSection
            issueDate={student.transcriptMeta.issueDate}
            administrator={student.transcriptMeta.administrator}
            onPreviewClick={handlePreviewPDF}
            isGenerating={pdfLoading}
          />
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

      {/* Student Management Modal */}
      {showStudentManagement && (
        <StudentManagement
          user={user}
          onClose={() => setShowStudentManagement(false)}
        />
      )}

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings
          user={user}
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {/* Course Management Modal */}
      {showCourseManagement && (
        <CourseManagement
          studentId={selectedStudentId || ""}
          onClose={() => {
            setShowCourseManagement(false);
          }}
          onCourseAdded={() => {
            // Refresh courses after adding a new course
            window.dispatchEvent(new CustomEvent("refreshCourses"));
          }}
        />
      )}

      {/* Test Score Management Modal */}
      {showTestScoreManagement && (
        <TestScoreManagement
          studentId={selectedStudentId || ""}
          onClose={() => setShowTestScoreManagement(false)}
          onScoreAdded={() => {
            // Refresh test scores after adding a new score
            window.dispatchEvent(new CustomEvent("refreshTestScores"));
          }}
        />
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        show={pdfPreviewState.show}
        url={pdfPreviewState.url}
        options={pdfOptions}
        onClose={cleanupPdfPreview}
        onDownload={handleDownloadPDF}
        onOptionChange={(newOptions) => {
          setPdfOptions(newOptions);
          regeneratePreview(newOptions);
        }}
      />
    </div>
  );
}
