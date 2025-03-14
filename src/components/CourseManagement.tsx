import { useCourseManagement } from "../hooks/useCourseManagement";
import { StandardCourseCatalog } from "./course/StandardCourseCatalog";
import { CourseForm } from "./course/CourseForm";
import { NotificationManager } from "./common/NotificationManager";

interface CourseManagementProps {
  studentId: string;
  onClose: () => void;
  onCourseAdded: () => void;
}

export function CourseManagement({
  studentId,
  onClose,
  onCourseAdded,
}: CourseManagementProps) {
  // Use the custom hook
  const courseManagement = useCourseManagement({
    studentId,
    onClose,
    onCourseAdded,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <NotificationManager
        notification={courseManagement.notification}
        onClose={() =>
          courseManagement.setNotification({
            ...courseManagement.notification,
            show: false,
          })
        }
      />

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

        <StandardCourseCatalog
          categories={courseManagement.categories}
          selectedCategory={courseManagement.selectedCategory}
          onCategoryChange={(category) =>
            courseManagement.setSelectedCategory(category)
          }
          searchQuery={courseManagement.searchQuery}
          onSearchChange={(query) => courseManagement.setSearchQuery(query)}
          filteredCourses={courseManagement.filteredCourses}
          loadingCourses={courseManagement.loadingCourses}
          onCourseSelect={courseManagement.handleCourseSelect}
          selectedCourse={courseManagement.selectedCourse}
          getCategoryCount={courseManagement.getCategoryCount}
        />

        <CourseForm
          formData={courseManagement.formData}
          onFormChange={courseManagement.setFormData}
          onSubmit={courseManagement.handleSubmit}
          loading={courseManagement.loading}
          onCancel={onClose}
          generateAcademicYearOptions={
            courseManagement.generateAcademicYearOptions
          }
        />
      </div>
    </div>
  );
}
