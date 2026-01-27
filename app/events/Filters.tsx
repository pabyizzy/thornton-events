'use client'

type Props = {
  dateRange?: string
  city?: string
  category?: string
  search?: string
  freeOnly?: boolean
  cities: string[]
  categories: string[]
  onFilterChange?: (filters: { dateRange?: string; city?: string; category?: string; search?: string; freeOnly?: boolean }) => void
}

function link(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  if (params.dateRange) sp.set('dateRange', params.dateRange)
  if (params.city) sp.set('city', params.city)
  if (params.category) sp.set('category', params.category)
  const qs = sp.toString()
  return `/events${qs ? `?${qs}` : ''}`
}

export default function Filters({ dateRange, city, category, search, freeOnly, cities, categories, onFilterChange }: Props) {
  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-3">Search</h3>
        {onFilterChange ? (
          <input
            type="text"
            value={search ?? ''}
            onChange={(e) => onFilterChange?.({ search: e.currentTarget.value })}
            placeholder="Search events, venues, or categories..."
            className="theme-input w-full"
          />
        ) : (
          <form action="/events" className="w-full">
            <input type="text" name="q" defaultValue={search ?? ''} placeholder="Search events, venues, or categories..." className="theme-input w-full" />
          </form>
        )}
      </div>
      {/* Location and Category Filters (moved above time period) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold theme-text-primary mb-3">
          Filter by Location & Category
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏙️</span>
            <select
              className="theme-input"
              value={city ?? ''}
              onChange={(e) => {
                if (onFilterChange) {
                  onFilterChange({ city: e.currentTarget.value || undefined })
                } else {
                  window.location.href = link({ dateRange, city: e.currentTarget.value || undefined, category })
                }
              }}
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <select
              className="theme-input"
              value={category ?? ''}
              onChange={(e) => {
                if (onFilterChange) {
                  onFilterChange({ category: e.currentTarget.value || undefined })
                } else {
                  window.location.href = link({ dateRange, city, category: e.currentTarget.value || undefined })
                }
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Time Period buttons removed per request; quick filters below supersede this */}

      {/* Quick Filter Pills (bottom row) */}
      <h3 className="text-lg font-semibold theme-text-primary mb-3 mt-6">Quick filters</h3>
      <div className="flex flex-wrap gap-2">
        {onFilterChange ? (
          <>
            <button onClick={() => onFilterChange({ dateRange: 'today' })} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200">Today</button>
            <button onClick={() => onFilterChange({ dateRange: 'weekend' })} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors duration-200">This Weekend</button>
            <button onClick={() => onFilterChange({ dateRange: 'week' })} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors duration-200">This Week</button>
            <button onClick={() => onFilterChange({ freeOnly: !freeOnly })} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${freeOnly ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}>Free Events{freeOnly ? ' ✓' : ''}</button>
            <button onClick={() => onFilterChange({ category: 'family' })} className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors duration-200">Family-Friendly</button>
            <button onClick={() => onFilterChange({ dateRange: '', city: '', category: '', freeOnly: false })} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">Clear All</button>
          </>
        ) : null}
      </div>

      {/* Clear filters (if using SSR links) */}
      <div className="mb-6">
        {(city || category || freeOnly) && (
            onFilterChange ? (
              <button
                onClick={() => onFilterChange({ city: '', category: '', freeOnly: false })}
                className="theme-btn-secondary"
              >
                🧹 Clear filters
              </button>
            ) : (
              <a
                href={link({ dateRange })}
                className="theme-btn-secondary"
              >
                🧹 Clear filters
              </a>
            )
        )}
      </div>
    </>
  )
}
