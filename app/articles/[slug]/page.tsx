'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import PageLayout from '@/app/components/PageLayout'
import ArticleSidebar from '@/app/components/ArticleSidebar'

type Article = {
  id: string
  slug: string
  title: string
  subtitle?: string
  content: string
  excerpt?: string
  featured_image_url?: string
  author_name: string
  category: string
  tags: string[]
  published_at: string
  view_count: number
  featured: boolean
}

export default function ArticleDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchArticle = async () => {
      try {
        // Fetch article
        const { data, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single()

        if (articleError || !data) {
          setError('Article not found')
          setLoading(false)
          return
        }

        setArticle(data as Article)

        // Increment view count
        await supabase
          .from('articles')
          .update({ view_count: (data as Article).view_count + 1 })
          .eq('id', (data as Article).id)

        // Fetch related articles
        const { data: related } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .eq('category', (data as Article).category)
          .neq('id', (data as Article).id)
          .order('published_at', { ascending: false })
          .limit(3)

        setRelatedArticles((related as Article[]) || [])
        setLoading(false)
      } catch (err) {
        setError('Failed to load article')
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading article...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error || !article) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg shadow-sm p-8">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-6">
              This article might have been moved or doesn&apos;t exist.
            </p>
            <Link href="/articles" className="btn-primary inline-block">
              ← Back to Articles
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Format published date
  const publishedDate = new Date(article.published_at)
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Calculate read time based on content length
  const wordCount = article.content.split(' ').length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  // Share URLs
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articles/${article.slug}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>›</span>
            <Link href="/articles" className="hover:text-blue-600">Articles</Link>
            <span>›</span>
            <Link href={`/articles?category=${article.category}`} className="hover:text-blue-600">
              {article.category}
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium truncate">{article.title}</span>
          </nav>
        </div>

        {/* Hero Image */}
        {article.featured_image_url && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.featured && (
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded shadow-lg uppercase">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Two Column Layout: Article Content + Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article Content */}
            <article className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            {/* Category Badge */}
            <div className="mb-4">
              <Link
                href={`/articles?category=${article.category}`}
                className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded hover:bg-blue-100 transition-colors"
              >
                {article.category}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-xl text-gray-600 mb-6">{article.subtitle}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {article.author_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{article.author_name}</p>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{article.view_count.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-gray-200 mb-6">
                <span className="text-sm font-semibold text-gray-700">Tags:</span>
                {article.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/articles?tag=${tag}`}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Share */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Share:</span>
              <div className="flex gap-2">
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href={linkedinShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Related Articles (inside main column) */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map(related => {
                  const relatedDate = new Date(related.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                  return (
                    <Link
                      key={related.id}
                      href={`/articles/${related.slug}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {related.featured_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={related.featured_image_url}
                          alt={related.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-pink-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      <div className="p-4">
                        <p className="text-xs text-blue-600 font-semibold mb-2">{related.category}</p>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{related.title}</h3>
                        <p className="text-sm text-gray-500">{relatedDate}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <ArticleSidebar />
          </div>
        </div>
      </div>
    </div>
      </div>
    </PageLayout>
  )
}
