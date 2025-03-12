import { useCallback } from "react";
import { signOut } from "../../lib/auth";
import { StudentManagement } from "../StudentManagement";
import { AccountSettings } from "../AccountSettings";
import { CourseList } from "../CourseList";
import { TestScores } from "../TestScores";
import { Notification } from "../Notification";
import { GuardianSetup } from "../GuardianSetup";
import { GuardianHeader } from "./GuardianHeader";
import { TranscriptSection } from "./TranscriptSection";
import { PDFPreviewModal } from "./PDFPreviewModal";
import { useGuardianDashboard } from "../../hooks/useGuardianDashboard";
import type { User } from "../../types";
import { PDFCustomizationOptions } from "../../hooks/usePdfGeneration";

interface GuardianDashboardProps {
  user: User;
}

export function GuardianDashboard({ user }: GuardianDashboardProps) {
  const {
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
    handleDeleteCourse,
    handleDeleteScore,
  } = useGuardianDashboard(user);

  const handleLogout = async () => {
    try {
      await signOut();
      // Force a page reload to clear React state and re-check authentication
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Clean up PDF preview resources
  const cleanupPdfPreview = useCallback(() => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    setShowPdfPreview(false);
  }, [pdfPreviewUrl, setPdfPreviewUrl, setShowPdfPreview]);

  // Handle PDF preview generation
  const handlePreviewPDF = useCallback(async () => {
    try {
      setPdfLoading(true);
      setPdfError(null);

      // In a real implementation, this would generate a PDF
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        // Create a dummy URL for the preview
        const url = "about:blank";
        setPdfPreviewUrl(url);
        setShowPdfPreview(true);
        setPdfLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      setPdfError("Failed to generate PDF preview. Please try again.");
      setNotification({
        show: true,
        type: "error",
        message: "Failed to generate PDF preview. Please try again.",
      });
      setPdfLoading(false);
    }
  }, [
    setPdfLoading,
    setPdfError,
    setPdfPreviewUrl,
    setShowPdfPreview,
    setNotification,
  ]);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    try {
      // In a real implementation, this would download a PDF
      // For now, we'll just show a notification
      setNotification({
        show: true,
        type: "success",
        message: "Transcript downloaded successfully!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfError("Failed to generate PDF. Please try again.");
      setNotification({
        show: true,
        type: "error",
        message: "Failed to generate PDF. Please try again.",
      });
    }
  }, [setNotification, setPdfError]);

  // Handle PDF option changes
  const handlePdfOptionChange = useCallback(
    (newOptions: PDFCustomizationOptions) => {
      // Update options state
      setPdfOptions(newOptions);

      // In a real implementation, this would regenerate the PDF preview
      // For now, we'll just show a notification
      setNotification({
        show: true,
        type: "success",
        message: "PDF options updated successfully!",
      });
    },
    [setPdfOptions, setNotification],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (needsSetup) {
    return <GuardianSetup onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
              onEditCourse={() => {
                setNotification({
                  show: true,
                  type: "info",
                  message:
                    "Course editing will be implemented in a future update.",
                });
              }}
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
              onEditScore={() => {
                setNotification({
                  show: true,
                  type: "info",
                  message:
                    "Test score editing will be implemented in a future update.",
                });
              }}
              onDeleteScore={handleDeleteScore}
            />
            {testScoresLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            {pdfError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{pdfError}</span>
              </div>
            )}
            <TranscriptSection
              issueDate={student.transcriptMeta.issueDate}
              administrator={student.transcriptMeta.administrator}
              onPreviewClick={handlePreviewPDF}
              isGenerating={pdfLoading}
            />
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
              Add Student
            </button>
          </div>
        )}
      </main>

      {showStudentManagement && (
        <StudentManagement
          user={user}
          onClose={() => setShowStudentManagement(false)}
          onStudentsChanged={() => window.location.reload()}
        />
      )}

      {showAccountSettings && (
        <AccountSettings
          user={user}
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        show={showPdfPreview}
        url={pdfPreviewUrl}
        options={pdfOptions}
        onClose={cleanupPdfPreview}
        onDownload={handleDownloadPDF}
        onOptionChange={handlePdfOptionChange}
      />

      {/* PDF Loading Indicator */}
      {pdfLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Generating PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
