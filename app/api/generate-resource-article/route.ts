import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { tavily } from '@tavily/core'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || '' })

type GenerateResourceArticleRequest = {
  topic:
    | 'parks-playgrounds'
    | 'family-restaurants'
    | 'libraries-community'
    | 'sports-activities'
    | 'educational-programs'
    | 'seasonal-events'
    | 'custom'
  customTopic?: string
  tone: 'casual' | 'professional' | 'exciting'
  imageSource?: 'unsplash' | 'pexels'
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateResourceArticleRequest = await request.json()
    const { topic, customTopic, tone, imageSource = 'unsplash' } = body

    // Define search queries based on topic
    const topicConfig = {
      'parks-playgrounds': {
        query: 'best parks playgrounds families kids Thornton Colorado 2026',
        title: 'Best Parks and Playgrounds for Families in Thornton',
        category: 'Family Fun',
      },
      'family-restaurants': {
        query: 'family friendly restaurants kids menu Thornton Colorado 2026',
        title: 'Top Family-Friendly Restaurants in Thornton',
        category: 'Family Fun',
      },
      'libraries-community': {
        query: 'libraries community centers family programs Thornton Colorado 2026',
        title: 'Libraries and Community Centers in Thornton',
        category: 'Guides & Resources',
      },
      'sports-activities': {
        query: 'youth sports leagues kids activities classes Thornton Colorado 2026',
        title: 'Sports and Activities for Kids in Thornton',
        category: 'Family Fun',
      },
      'educational-programs': {
        query: 'educational programs after school tutoring kids Thornton Colorado 2026',
        title: 'Educational Programs and Resources in Thornton',
        category: 'Guides & Resources',
      },
      'seasonal-events': {
        query: 'seasonal family events festivals activities Thornton Colorado 2026',
        title: 'Seasonal Events and Activities for Families',
        category: 'Seasonal Activities',
      },
      custom: {
        query: customTopic || 'family activities Thornton Colorado 2026',
        title: customTopic || 'Family Activities in Thornton',
        category: 'Family Fun',
      },
    }

    const config = topicConfig[topic]

    // Perform web search using Tavily
    console.log('Searching web for:', config.query)
    const searchResults = await tavilyClient.search(config.query, {
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: true,
    })

    if (!searchResults || searchResults.results.length === 0) {
      return NextResponse.json(
        { error: 'No information found on this topic' },
        { status: 404 }
      )
    }

    // Format search results for the AI
    const webContext = searchResults.results
      .map((result: { title: string; url: string; content: string }, index: number) => {
        return `${index + 1}. ${result.title}
   URL: ${result.url}
   Content: ${result.content.substring(0, 500)}...
   `
      })
      .join('\n\n')

    // If Tavily provided an answer summary, include it
    const answerSummary = searchResults.answer
      ? `\n\nKey Information Summary:\n${searchResults.answer}\n`
      : ''

    // Build the prompt for OpenAI
    const systemPrompt = `You are a professional content writer for Thornton Events, a family-focused community events website in Thornton, Colorado. Your writing should be ${tone}, engaging, and helpful to local families. You specialize in creating comprehensive guides based on web research.`

    const userPrompt = `Based on the following web research about ${config.title.toLowerCase()}, write a comprehensive and informative blog article.

Web Research Results:
${webContext}
${answerSummary}

Create an article that:
- Highlights the best resources/places/activities found in the research
- Includes specific names, addresses, and contact information when available
- Provides practical tips and recommendations for families
- Mentions hours, prices, or special features when mentioned in the sources
- Is accurate and based on the information provided
- Cites or references the sources naturally in the content

Please provide the article in the following JSON format:
{
  "title": "Engaging article title (60-80 characters)",
  "subtitle": "Brief subtitle that expands on the title (80-120 characters)",
  "excerpt": "Compelling excerpt for article preview (150-200 characters)",
  "content": "Full HTML article content with rich semantic formatting. Requirements: Use <h2> for main sections grouping similar resources (e.g. 'Top Parks in Thornton', 'Indoor Play Spaces'), <h3> for individual locations/resources with their names, <p> tags for descriptive paragraphs (3-5 sentences each), <ul>/<li> for amenities/features/tips, <strong> for emphasis on names, addresses, hours, prices. Structure: Intro paragraph setting context → 3-4 main sections with <h2> → Each section: intro paragraph + 2-3 <h3> subsections for specific places → Each place: paragraph with details + optional bullet list of features → Conclusion with practical tips. Make it 700-1000 words. Include specific: names, addresses, contact info, hours, prices from research.",
  "category": "${config.category}",
  "tags": ["3-5 relevant tags as an array"],
  "slug": "url-friendly-slug-for-the-article",
  "sources": ["array of 3-5 key source URLs used"]
}

Important: Base the article ONLY on information from the web research provided. Do not make up details.`

    // Call OpenAI API
    console.log('Generating article with OpenAI...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const generatedContent = completion.choices[0].message.content
    if (!generatedContent) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 })
    }

    const articleData = JSON.parse(generatedContent)

    // Fetch a relevant hero image from Unsplash or Pexels
    let heroImageUrl = null
    try {
      // Build a search query for resources
      // Remove generic words and keep the core topic
      const baseQuery = (customTopic || config.title)
        .replace('Best ', '')
        .replace('Top ', '')
        .replace('in Thornton', '')
        .replace('for Families', '')
        .trim()
      const searchQuery = `${baseQuery} family children happy`

      if (imageSource === 'pexels') {
        const pexelsApiKey = process.env.PEXELS_API_KEY
        console.log('Pexels API Key present:', !!pexelsApiKey)

        if (pexelsApiKey) {
          console.log('Fetching Pexels image for query:', searchQuery)

          const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&orientation=landscape&per_page=1`
          const pexelsResponse = await fetch(pexelsUrl, {
            headers: {
              'Authorization': pexelsApiKey
            }
          })

          console.log('Pexels response status:', pexelsResponse.status)

          if (pexelsResponse.ok) {
            const data = await pexelsResponse.json()
            if (data.photos && data.photos.length > 0) {
              heroImageUrl = data.photos[0].src.large
              console.log('Successfully fetched hero image from Pexels:', heroImageUrl)
            }
          } else {
            const errorText = await pexelsResponse.text()
            console.error('Pexels API error:', pexelsResponse.status, errorText)
          }
        } else {
          console.log('No Pexels API key configured')
        }
      } else {
        // Default to Unsplash
        const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY
        console.log('Unsplash Access Key present:', !!unsplashAccessKey)

        if (unsplashAccessKey) {
          console.log('Fetching Unsplash image for query:', searchQuery)

          const unsplashUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&orientation=landscape&content_filter=high&client_id=${unsplashAccessKey}`
          const unsplashResponse = await fetch(unsplashUrl)

          console.log('Unsplash response status:', unsplashResponse.status)

          if (unsplashResponse.ok) {
            const imageData = await unsplashResponse.json()
            heroImageUrl = imageData.urls.regular
            console.log('Successfully fetched hero image from Unsplash:', heroImageUrl)
          } else {
            const errorText = await unsplashResponse.text()
            console.error('Unsplash API error:', unsplashResponse.status, errorText)
          }
        } else {
          console.log('No Unsplash access key configured')
        }
      }
    } catch (error) {
      console.error('Failed to fetch hero image:', error)
      // Continue without hero image
    }

    return NextResponse.json({
      success: true,
      article: {
        ...articleData,
        featured_image_url: heroImageUrl,
        author_name: 'Thornton Events Team',
        featured: false,
        status: 'draft',
      },
      searchResultsCount: searchResults.results.length,
    })
  } catch (error: unknown) {
    console.error('Error generating resource article:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate article',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
