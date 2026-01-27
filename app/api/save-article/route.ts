import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type SaveArticleRequest = {
  title: string
  subtitle?: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  slug: string
  author_name: string
  status: 'draft' | 'published'
  featured?: boolean
  featured_image_url?: string
}

export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Verify user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to save articles' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - You must be an admin to save articles' },
        { status: 403 }
      )
    }

    const articleData: SaveArticleRequest = await request.json()

    // Validate required fields
    if (!articleData.title || !articleData.content || !articleData.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, or slug' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', articleData.slug)
      .maybeSingle()

    if (existingArticle) {
      // Generate a unique slug by appending a number
      const timestamp = Date.now()
      articleData.slug = `${articleData.slug}-${timestamp}`
    }

    // Prepare article data for insertion
    const articleToInsert = {
      title: articleData.title,
      subtitle: articleData.subtitle || null,
      excerpt: articleData.excerpt || articleData.content.substring(0, 200),
      content: articleData.content,
      category: articleData.category,
      tags: articleData.tags || [],
      slug: articleData.slug,
      author_name: articleData.author_name || 'Thornton Events Team',
      status: articleData.status,
      featured: articleData.featured || false,
      featured_image_url: articleData.featured_image_url || null,
      view_count: 0,
      published_at: articleData.status === 'published' ? new Date().toISOString() : null,
    }

    // Insert article into database
    const { data, error } = await supabase
      .from('articles')
      .insert([articleToInsert])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save article to database', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      article: data,
      message:
        articleData.status === 'published'
          ? 'Article published successfully!'
          : 'Article saved as draft!',
    })
  } catch (error: unknown) {
    console.error('Error saving article:', error)
    return NextResponse.json(
      {
        error: 'Failed to save article',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
