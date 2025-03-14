interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getCategoryCount: (category: string) => number;
  disabled?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  getCategoryCount,
  disabled = false,
}: CategoryFilterProps) {
  return (
    <div className="mb-3">
      <label
        htmlFor="category-filter"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Filter by Category
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        disabled={disabled}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category} ({getCategoryCount(category)})
          </option>
        ))}
      </select>
    </div>
  );
}
