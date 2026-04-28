'use client'

interface FilterBarProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  sortOrder: string
  onSortChange: (sort: string) => void
}

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
          Filter by
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option className="text-gray-900" value="">All Categories</option>
          {categories.map((cat) => (
            <option className="text-gray-900" key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
          Sort by
        </label>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option className="text-gray-900" value="date_desc">Newest First</option>
          <option className="text-gray-900" value="">Default</option>
        </select>
      </div>

      {selectedCategory && (
        <button
          onClick={() => onCategoryChange('')}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
