import type { StandardCourse } from "../../types";
import { CategoryFilter } from "./CategoryFilter";
import { CourseSearch } from "./CourseSearch";
import { CourseResults } from "./CourseResults";
import { SelectedCourseDisplay } from "./SelectedCourseDisplay";

interface StandardCourseCatalogProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCourses: StandardCourse[];
  loadingCourses: boolean;
  onCourseSelect: (course: StandardCourse) => void;
  selectedCourse: StandardCourse | null;
  getCategoryCount: (category: string) => number;
}

export function StandardCourseCatalog({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  filteredCourses,
  loadingCourses,
  onCourseSelect,
  selectedCourse,
  getCategoryCount,
}: StandardCourseCatalogProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Standard Course Catalog</h3>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        getCategoryCount={getCategoryCount}
        disabled={loadingCourses}
      />

      <CourseSearch
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        disabled={loadingCourses}
      />

      <CourseResults
        filteredCourses={filteredCourses}
        loadingCourses={loadingCourses}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onCourseSelect={onCourseSelect}
      />

      {selectedCourse && <SelectedCourseDisplay course={selectedCourse} />}
    </div>
  );
}
