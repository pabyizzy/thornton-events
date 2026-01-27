'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type TrendingArticle = {
  id: string
  slug: string
  title: string
  category: string
  view_count: number
}

export default function TrendingArticles() {
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingArticles()
  }, [])

  const fetchTrendingArticles = async () => {
    try {
      // Get articles from last 30 days, sorted by view count
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, category, view_count')
        .eq('status', 'published')
        .gte('published_at', thirtyDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching trending articles:', error)
      } else {
        setArticles((data as TrendingArticle[]) || [])
      }
    } catch (error) {
      console.error('Failed to fetch trending articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Articles</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">Trending Articles</h3>
      </div>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
                    {article.category}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{article.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/articles"
          className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All Articles →
        </Link>
      </div>
    </div>
  )
}
