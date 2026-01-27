import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type GenerateArticleRequest = {
  timePeriod: 'this-week' | 'this-weekend' | 'this-month' | 'next-month'
  category?: string
  tone: 'casual' | 'professional' | 'exciting'
  articleType: 'roundup' | 'guide' | 'preview'
  imageSource?: 'unsplash' | 'pexels'
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateArticleRequest = await request.json()
    const { timePeriod, category, tone, articleType, imageSource = 'unsplash' } = body

    // Calculate date range based on time period
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (timePeriod) {
      case 'this-week':
        startDate = new Date(now)
        endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7)
        break
      case 'this-weekend':
        const dayOfWeek = now.getDay()
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() + daysUntilSaturday)
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 2)
        break
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'next-month':
        startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)
        break
      default:
        startDate = new Date(now)
        endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7)
    }

    // Fetch events from database
    let query = supabase
      .from('events')
      .select('id, title, start_time, venue, city, category, price_text, description')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true })
      .limit(20)

    if (category) {
      query = query.ilike('category', `%${category}%`)
    }

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'No events found for the selected time period' },
        { status: 404 }
      )
    }

    // Format events for the prompt
    const eventsText = events
      .map((event, index) => {
        const eventDate = new Date(event.start_time || '')
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
        return `${index + 1}. ${event.title}
   - Date: ${formattedDate} at ${formattedTime}
   - Location: ${event.venue || 'TBD'}, ${event.city || 'Thornton'}
   - Category: ${event.category || 'General'}
   - Price: ${event.price_text || 'Free'}
   ${event.description ? `   - Description: ${event.description.substring(0, 200)}...` : ''}`
      })
      .join('\n\n')

    // Create time period text
    const timePeriodText = {
      'this-week': 'This Week',
      'this-weekend': 'This Weekend',
      'this-month': 'This Month',
      'next-month': 'Next Month',
    }[timePeriod]

    // Create article type specific instructions
    const articleTypeInstructions = {
      roundup: 'Create a roundup article that highlights the best events. Focus on variety and appeal to families.',
      guide: 'Create a comprehensive guide that helps families plan their time. Include tips and recommendations.',
      preview: 'Create an exciting preview of upcoming events that builds anticipation and encourages attendance.',
    }[articleType]

    // Build the prompt
    const systemPrompt = `You are a professional content writer for Thornton Events, a family-focused community events website in Thornton, Colorado. Your writing should be ${tone}, engaging, and helpful to local families.`

    const userPrompt = `${articleTypeInstructions}

Write a blog article about events happening ${timePeriodText.toLowerCase()} in Thornton${category ? ` in the ${category} category` : ''}.

Here are the events:

${eventsText}

Please provide the article in the following JSON format:
{
  "title": "Engaging article title (60-80 characters)",
  "subtitle": "Brief subtitle that expands on the title (80-120 characters)",
  "excerpt": "Compelling excerpt for article preview (150-200 characters)",
  "content": "Full HTML article content with proper semantic formatting. Requirements: Use <h2> for main sections (e.g. 'Featured Events This Week'), <h3> for subsections or event highlights, <p> tags for paragraphs (3-5 sentences each), <ul>/<li> for lists, <strong> for emphasis on key details (event names, dates, times). Include specific details: names, dates, times, locations, pricing. Structure: Intro paragraph → 2-3 main sections with <h2> → Each section has 1-2 paragraphs + optional list → Conclusion. Make it 500-800 words.",
  "category": "Most appropriate category (Family Fun, Local News, Guides & Resources, Seasonal Activities, or Parent Tips)",
  "tags": ["3-5 relevant tags as an array"],
  "slug": "url-friendly-slug-for-the-article"
}

Make sure the content is well-structured, informative, and encourages families to attend these events.`

    // Call OpenAI API
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
      // Build a search query
      const baseQuery = category ? category.toLowerCase() : 'family events'
      const searchQuery = `${baseQuery} family children activities happy`

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
    })
  } catch (error: unknown) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: 'Failed to generate article', details: (error as Error).message },
      { status: 500 }
    )
  }
}
