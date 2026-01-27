import Link from 'next/link'
import { ArticleRow } from './ArticleCard'

interface GridArticleCardProps {
  article: ArticleRow
}

export default function GridArticleCard({ article }: GridArticleCardProps) {
  // Calculate read time
  const wordCount = article.excerpt ? article.excerpt.split(' ').length : 0
  const readTime = Math.max(1, Math.ceil(wordCount / 50))

  // Format published date
  const publishedDate = new Date(article.published_at)
  const formattedDate = publishedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // Truncate excerpt for grid view
  const truncatedExcerpt = article.excerpt
    ? article.excerpt.length > 120
      ? article.excerpt.substring(0, 120) + '...'
      : article.excerpt
    : ''

  return (
    <Link href={`/articles/${article.slug}`} className="article-card group block">
      {/* Article Image */}
      <div className="article-card-image relative overflow-hidden">
        {article.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {/* Featured Badge */}
        {article.featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded shadow-lg uppercase">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
            {article.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {truncatedExcerpt && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {truncatedExcerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="line-clamp-1">{article.author_name}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readTime} min</span>
            </div>
            {article.view_count > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{article.view_count.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
