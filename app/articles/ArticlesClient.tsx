'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ArticleCard, { type ArticleRow } from '../components/ArticleCard'
import GridArticleCard from '../components/GridArticleCard'
import ArticleFilters from './ArticleFilters'

export default function ArticlesClient() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: '',
    sortBy: 'newest'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredArticles, setFilteredArticles] = useState<ArticleRow[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchCategoriesAndTags()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and sort articles based on current filters
  useEffect(() => {
    let result = [...articles]

    // Apply category filter
    if (filters.category) {
      result = result.filter(article => article.category === filters.category)
    }

    // Apply tag filter (including special "featured" tag)
    if (filters.tag === 'featured') {
      result = result.filter(article => article.featured)
    } else if (filters.tag) {
      result = result.filter(article => article.tags.includes(filters.tag))
    }

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.excerpt?.toLowerCase().includes(searchLower) ||
        article.author_name.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    } else if (filters.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime())
    } else if (filters.sortBy === 'popular') {
      result.sort((a, b) => b.view_count - a.view_count)
    }

    setFilteredArticles(result)
  }, [articles, filters])

  const fetchArticles = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(100)

      if (error) {
        setError(error.message)
      } else {
        setArticles((data ?? []) as ArticleRow[])
        setError(null)
      }
    } catch {
      setError('Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoriesAndTags = async () => {
    try {
      // Fetch unique categories
      const { data: categoriesData } = await supabase
        .from('articles')
        .select('category')
        .eq('status', 'published')
        .order('category', { ascending: true })

      const uniqueCategories = Array.from(
        new Set((categoriesData ?? []).map((r: { category: string }) => r.category))
      ).filter(Boolean) as string[]
      setCategories(uniqueCategories)

      // Fetch all tags and flatten them
      const { data: tagsData } = await supabase
        .from('articles')
        .select('tags')
        .eq('status', 'published')

      const allTags = (tagsData ?? [])
        .flatMap((r: { tags: string[] }) => r.tags || [])
        .filter(Boolean)
      const uniqueTags = Array.from(new Set(allTags)) as string[]
      setTags(uniqueTags.sort())
    } catch {
      console.error('Failed to fetch categories and tags')
    }
  }

  const handleFilterChange = (newFilters: {
    category?: string
    tag?: string
    search?: string
    sortBy?: string
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto p-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Articles</h1>
            <p className="text-xl text-gray-600 mb-8">Loading articles...</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Articles & Blog</h1>
          <p className="text-xl text-gray-600">
            Discover stories, tips, and insights for families in Thornton
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Filters (1/4 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-6">
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden w-full p-4 text-left font-semibold text-gray-900 flex items-center justify-between border-b"
              >
                <span>Filters</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`p-6 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
                <ArticleFilters
                  category={filters.category}
                  tag={filters.tag}
                  search={filters.search}
                  sortBy={filters.sortBy}
                  categories={categories}
                  tags={tags}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Articles (3/4 width) */}
          <div className="lg:col-span-3">
            {/* View Toggle and Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredArticles.length}</span>{' '}
                {filteredArticles.length === 1 ? 'article' : 'articles'} found
              </p>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  List
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm mb-8">
                <div className="text-6xl mb-4">😅</div>
                <p className="text-2xl text-red-600 font-bold">Oops! Something went wrong</p>
                <p className="text-lg text-gray-600 mt-2">Error: {error}</p>
              </div>
            )}

            {/* Empty State */}
            {filteredArticles.length === 0 && !error && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-2xl text-gray-600 font-bold">No articles found</p>
                <p className="text-lg text-gray-500 mt-2">
                  {filters.search
                    ? `Try searching for something else or clear your filters`
                    : 'Try adjusting your filters to see more articles'}
                </p>
                {(filters.category || filters.tag || filters.search) && (
                  <button
                    onClick={() =>
                      handleFilterChange({ category: '', tag: '', search: '', sortBy: 'newest' })
                    }
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Articles Grid/List */}
            {filteredArticles.length > 0 && (
              <>
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                      <GridArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
