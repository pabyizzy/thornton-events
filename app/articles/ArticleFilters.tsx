'use client'

type Props = {
  category?: string
  tag?: string
  search?: string
  sortBy?: string
  categories: string[]
  tags: string[]
  onFilterChange: (filters: { category?: string; tag?: string; search?: string; sortBy?: string }) => void
}

export default function ArticleFilters({
  category,
  tag,
  search,
  sortBy,
  categories,
  tags,
  onFilterChange
}: Props) {
  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Search</h3>
        <input
          type="text"
          value={search ?? ''}
          onChange={(e) => onFilterChange({ search: e.currentTarget.value })}
          placeholder="Search articles, authors, or topics..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category and Tag Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Filter by Category & Tag
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📁</span>
            <select
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={category ?? ''}
              onChange={(e) => onFilterChange({ category: e.currentTarget.value || undefined })}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <select
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={tag ?? ''}
              onChange={(e) => onFilterChange({ tag: e.currentTarget.value || undefined })}
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={sortBy ?? 'newest'}
          onChange={(e) => onFilterChange({ sortBy: e.currentTarget.value })}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Quick Filter Pills */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Quick Filters</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange({ category: undefined, tag: 'featured' })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            tag === 'featured'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          ⭐ Featured
        </button>
        <button
          onClick={() => onFilterChange({ category: 'Family Fun' })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            category === 'Family Fun'
              ? 'bg-pink-500 text-white'
              : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
          }`}
        >
          👨‍👩‍👧‍👦 Family Fun
        </button>
        <button
          onClick={() => onFilterChange({ category: 'Local News' })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            category === 'Local News'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          📰 Local News
        </button>
        <button
          onClick={() => onFilterChange({ category: 'Parent Tips' })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            category === 'Parent Tips'
              ? 'bg-green-500 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          💡 Parent Tips
        </button>
        <button
          onClick={() => onFilterChange({ category: '', tag: '', search: '' })}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
        >
          🧹 Clear All
        </button>
      </div>

      {/* Clear filters button */}
      {(category || tag || search) && (
        <div className="mt-6">
          <button
            onClick={() => onFilterChange({ category: '', tag: '', search: '' })}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            🧹 Clear All Filters
          </button>
        </div>
      )}
    </>
  )
}
