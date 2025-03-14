interface CourseSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  disabled?: boolean;
}

export function CourseSearch({
  searchQuery,
  onSearchChange,
  disabled = false,
}: CourseSearchProps) {
  return (
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
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Type to search courses..."
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        disabled={disabled}
      />
    </div>
  );
}
