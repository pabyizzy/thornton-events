'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/app/components/PageLayout'

type GeneratedArticle = {
  title: string
  subtitle: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  slug: string
  author_name: string
  featured: boolean
  status: string
  featured_image_url?: string
  sources?: string[]
}

export default function GenerateArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [generatorMode, setGeneratorMode] = useState<'events' | 'resources'>('resources')
  const [imageSource, setImageSource] = useState<'unsplash' | 'pexels'>('unsplash')

  // Event-based options
  const [eventOptions, setEventOptions] = useState({
    timePeriod: 'this-week' as 'this-week' | 'this-weekend' | 'this-month' | 'next-month',
    category: '',
    tone: 'casual' as 'casual' | 'professional' | 'exciting',
    articleType: 'roundup' as 'roundup' | 'guide' | 'preview',
  })

  // Resource-based options
  const [resourceOptions, setResourceOptions] = useState({
    topic: 'parks-playgrounds' as
      | 'parks-playgrounds'
      | 'family-restaurants'
      | 'libraries-community'
      | 'sports-activities'
      | 'educational-programs'
      | 'seasonal-events'
      | 'custom',
    customTopic: '',
    tone: 'casual' as 'casual' | 'professional' | 'exciting',
  })

  const handleGenerateEvents = async () => {
    setLoading(true)
    setError(null)
    setGeneratedArticle(null)

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...eventOptions, imageSource }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article')
      }

      setGeneratedArticle(data.article)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateResources = async () => {
    setLoading(true)
    setError(null)
    setGeneratedArticle(null)

    try {
      const response = await fetch('/api/generate-resource-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...resourceOptions, imageSource }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article')
      }

      setGeneratedArticle(data.article)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchNewImage = async () => {
    if (!generatedArticle) return
    setLoading(true)
    setError(null)

    try {
      // Build search query based on article content
      const searchTerms = [
        generatedArticle.category.toLowerCase(),
        'family',
        'children',
        'activities'
      ].join(' ')

      if (imageSource === 'pexels') {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms)}&orientation=landscape&per_page=1&page=${Math.floor(Math.random() * 10) + 1}`,
          {
            headers: {
              'Authorization': process.env.NEXT_PUBLIC_PEXELS_API_KEY || ''
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.photos && data.photos.length > 0) {
            setGeneratedArticle({
              ...generatedArticle,
              featured_image_url: data.photos[0].src.large
            })
          } else {
            throw new Error('No images found')
          }
        } else {
          throw new Error('Failed to fetch new image from Pexels')
        }
      } else {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerms)}&orientation=landscape&content_filter=high&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ''}`
        )

        if (response.ok) {
          const imageData = await response.json()
          setGeneratedArticle({
            ...generatedArticle,
            featured_image_url: imageData.urls.regular
          })
        } else {
          throw new Error('Failed to fetch new image from Unsplash')
        }
      }
    } catch (err) {
      setError('Failed to fetch new image. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!generatedArticle) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generatedArticle,
          status: 'draft',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article')
      }

      alert(data.message || 'Article saved as draft!')
      router.push('/articles')
    } catch (err) {
      setError((err as Error).message)
      alert('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!generatedArticle) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generatedArticle,
          status: 'published',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish article')
      }

      alert(data.message || 'Article published successfully!')
      // Redirect to the published article
      if (data.article && data.article.slug) {
        router.push(`/articles/${data.article.slug}`)
      } else {
        router.push('/articles')
      }
    } catch (err) {
      setError((err as Error).message)
      alert('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Article Generator</h1>
            <p className="text-gray-600">
              Generate articles from events or create guides using web research
            </p>
          </div>

          {/* Mode Selector */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setGeneratorMode('events')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                generatorMode === 'events'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Generate from Events
              </div>
              <p className="text-xs mt-1 opacity-75">Create roundups from your event database</p>
            </button>
            <button
              onClick={() => setGeneratorMode('resources')}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                generatorMode === 'resources'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                Generate from Web Research
              </div>
              <p className="text-xs mt-1 opacity-75">Research and create resource guides</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Generation Options</h2>

              {generatorMode === 'events' ? (
                <>
                  {/* Event-based options */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time Period
                    </label>
                    <select
                      value={eventOptions.timePeriod}
                      onChange={(e) =>
                        setEventOptions({
                          ...eventOptions,
                          timePeriod: e.target.value as typeof eventOptions.timePeriod,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="this-week">This Week</option>
                      <option value="this-weekend">This Weekend</option>
                      <option value="this-month">This Month</option>
                      <option value="next-month">Next Month</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={eventOptions.category}
                      onChange={(e) =>
                        setEventOptions({ ...eventOptions, category: e.target.value })
                      }
                      placeholder="e.g., Family, Music, Sports"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Article Type
                    </label>
                    <select
                      value={eventOptions.articleType}
                      onChange={(e) =>
                        setEventOptions({
                          ...eventOptions,
                          articleType: e.target.value as typeof eventOptions.articleType,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="roundup">Event Roundup</option>
                      <option value="guide">Event Guide</option>
                      <option value="preview">Event Preview</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Image Source
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setImageSource('unsplash')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          imageSource === 'unsplash'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Unsplash
                      </button>
                      <button
                        onClick={() => setImageSource('pexels')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          imageSource === 'pexels'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Pexels
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['casual', 'professional', 'exciting'] as const).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setEventOptions({ ...eventOptions, tone })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            eventOptions.tone === tone
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateEvents}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-md hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </span>
                    ) : (
                      '✨ Generate from Events'
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Resource-based options */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic
                    </label>
                    <select
                      value={resourceOptions.topic}
                      onChange={(e) =>
                        setResourceOptions({
                          ...resourceOptions,
                          topic: e.target.value as typeof resourceOptions.topic,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="parks-playgrounds">Parks & Playgrounds</option>
                      <option value="family-restaurants">Family-Friendly Restaurants</option>
                      <option value="libraries-community">Libraries & Community Centers</option>
                      <option value="sports-activities">Sports & Activities</option>
                      <option value="educational-programs">Educational Programs</option>
                      <option value="seasonal-events">Seasonal Events</option>
                      <option value="custom">Custom Topic</option>
                    </select>
                  </div>

                  {resourceOptions.topic === 'custom' && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Custom Topic
                      </label>
                      <input
                        type="text"
                        value={resourceOptions.customTopic}
                        onChange={(e) =>
                          setResourceOptions({
                            ...resourceOptions,
                            customTopic: e.target.value,
                          })
                        }
                        placeholder="e.g., indoor play spaces for toddlers"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Image Source
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setImageSource('unsplash')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          imageSource === 'unsplash'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Unsplash
                      </button>
                      <button
                        onClick={() => setImageSource('pexels')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          imageSource === 'pexels'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Pexels
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['casual', 'professional', 'exciting'] as const).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setResourceOptions({ ...resourceOptions, tone })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            resourceOptions.tone === tone
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-purple-900">
                          Web Research Mode
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          AI will search the web for current information about Thornton and create
                          a comprehensive guide with real places and resources.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateResources}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-md hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Researching & Writing...
                      </span>
                    ) : (
                      '🔍 Research & Generate'
                    )}
                  </button>
                </>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column - Preview (keeping existing preview code) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Generated Article</h2>

              {!generatedArticle && !loading && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                  <p className="text-gray-500">Select options and generate an article</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    {generatorMode === 'resources' ? 'Researching the web...' : 'AI is writing...'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    This may take {generatorMode === 'resources' ? '20-45' : '10-30'} seconds
                  </p>
                </div>
              )}

              {generatedArticle && (
                <div className="space-y-6">
                  {/* Hero Image Preview */}
                  {generatedArticle.featured_image_url && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Hero Image
                        </label>
                        <button
                          onClick={handleFetchNewImage}
                          disabled={loading}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {loading ? 'Fetching...' : 'Fetch New Image'}
                        </button>
                      </div>
                      <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedArticle.featured_image_url}
                          alt={generatedArticle.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-xs">
                            Image from Unsplash • Click &quot;Fetch New Image&quot; if not relevant
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={generatedArticle.title}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={generatedArticle.subtitle}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, subtitle: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={generatedArticle.excerpt}
                      onChange={(e) =>
                        setGeneratedArticle({ ...generatedArticle, excerpt: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content Preview
                    </label>
                    <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-4 prose prose-sm">
                      <div dangerouslySetInnerHTML={{ __html: generatedArticle.content }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={generatedArticle.category}
                        onChange={(e) =>
                          setGeneratedArticle({ ...generatedArticle, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={generatedArticle.slug}
                        onChange={(e) =>
                          setGeneratedArticle({ ...generatedArticle, slug: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {generatedArticle.sources && generatedArticle.sources.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sources Used
                      </label>
                      <div className="text-xs space-y-1">
                        {generatedArticle.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline truncate"
                          >
                            {source}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveDraft}
                      className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={handlePublish}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
