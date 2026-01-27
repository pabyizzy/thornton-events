import Link from 'next/link'

export type ArticleRow = {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  featured_image_url?: string
  author_name: string
  category: string
  tags: string[]
  published_at: string
  view_count: number
  featured: boolean
}

export default function ArticleCard({ article }: { article: ArticleRow }) {
  // Calculate read time (assuming ~200 words per minute)
  const wordCount = article.excerpt ? article.excerpt.split(' ').length : 0
  const readTime = Math.max(1, Math.ceil(wordCount / 50)) // Using excerpt length as proxy

  // Format published date
  const publishedDate = new Date(article.published_at)
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Truncate excerpt to 150 characters
  const truncatedExcerpt = article.excerpt
    ? article.excerpt.length > 150
      ? article.excerpt.substring(0, 150) + '...'
      : article.excerpt
    : ''

  return (
    <Link href={`/articles/${article.slug}`} className="article-card group block">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6">
        {/* Article Image */}
        <div className="flex-shrink-0 md:self-start relative">
          {article.featured_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full h-48 md:h-32 md:w-48 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 md:h-32 md:w-48 rounded-lg bg-gradient-to-br from-orange-100 to-pink-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}

          {/* Featured Badge */}
          {article.featured && (
            <div className="absolute -top-2 -right-2">
              <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded shadow-lg uppercase">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Article Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          {truncatedExcerpt && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {truncatedExcerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{article.author_name}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readTime} min read</span>
            </div>
            {article.view_count > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{article.view_count.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Category Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
              {article.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
