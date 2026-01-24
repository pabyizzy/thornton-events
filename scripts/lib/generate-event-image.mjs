/**
 * Event Image Generator
 * Fetches relevant stock images from Unsplash or generates AI images via DALL-E
 *
 * Usage:
 *   import { getEventImage } from './lib/generate-event-image.mjs'
 *   const imageUrl = await getEventImage(title, category, options)
 */

import OpenAI from 'openai'

// Category to search term mappings for Unsplash
const CATEGORY_KEYWORDS = {
  // Family & Kids
  'Family Fun': 'family outdoor fun children',
  'Library': 'library books children reading',
  'Community': 'community gathering people',
  'Education': 'children learning education',
  'Arts & Crafts': 'kids crafts art activities',
  'Music': 'live music concert outdoor',
  'Sports': 'kids sports activities',
  'Holiday': 'holiday celebration family',
  'Festival': 'festival celebration crowd',
  'Fair': 'county fair carnival rides',
  'Storytime': 'children storytime library books',
  'STEM': 'kids science learning',
  'Nature': 'nature park outdoor family',
  'Movies': 'outdoor movie night',
  'Parade': 'parade celebration street',

  // Default
  'default': 'community event celebration',
}

// Title keywords to image search mapping
const TITLE_KEYWORDS = {
  'storytime': 'children storytime reading books',
  'story time': 'children storytime reading books',
  'craft': 'kids crafts art activities',
  'lego': 'lego building blocks kids',
  'science': 'kids science experiment learning',
  'stem': 'kids science technology learning',
  'music': 'live music performance',
  'concert': 'outdoor concert performance',
  'movie': 'outdoor movie night',
  'film': 'movie cinema popcorn',
  'book': 'library books reading',
  'reading': 'children reading books',
  'game': 'kids playing games',
  'gaming': 'video games controller',
  'yoga': 'yoga meditation wellness',
  'dance': 'kids dancing dance class',
  'art': 'kids art painting creative',
  'paint': 'painting art creative kids',
  'festival': 'festival celebration crowd',
  'fair': 'county fair carnival rides',
  'parade': 'parade celebration street',
  'fourth of july': 'fireworks celebration july 4th',
  'july 4': 'fireworks celebration patriotic',
  'independence': 'fireworks patriotic celebration',
  'halloween': 'halloween pumpkins costumes',
  'trunk or treat': 'halloween trunk or treat kids',
  'harvest': 'fall harvest festival pumpkins',
  'winter': 'winter holiday snow celebration',
  'christmas': 'christmas holiday lights',
  'holiday': 'holiday celebration lights',
  'summer': 'summer outdoor fun',
  'spring': 'spring flowers outdoor',
  'nature': 'nature park outdoor hiking',
  'garden': 'garden plants flowers',
  'animal': 'animals pets kids',
  'pet': 'pets animals family',
  'magic': 'magic show performance',
  'puppet': 'puppet show kids',
  'theater': 'theater performance stage',
  'theatre': 'theater performance stage',
  'baby': 'baby toddler parent',
  'toddler': 'toddler kids playing',
  'teen': 'teenagers activities',
  'senior': 'seniors community gathering',
  'food': 'food festival eating',
  'cooking': 'cooking class kitchen',
  'fitness': 'fitness exercise workout',
  'health': 'health wellness community',
}

/**
 * Get search terms based on event title and category
 */
function getSearchTerms(title, category) {
  const titleLower = title.toLowerCase()

  // Check title keywords first (more specific)
  for (const [keyword, terms] of Object.entries(TITLE_KEYWORDS)) {
    if (titleLower.includes(keyword)) {
      return terms
    }
  }

  // Fall back to category
  if (category && CATEGORY_KEYWORDS[category]) {
    return CATEGORY_KEYWORDS[category]
  }

  // Default
  return CATEGORY_KEYWORDS['default']
}

/**
 * Fetch image from Unsplash API
 * Free tier: 50 requests/hour
 */
async function fetchUnsplashImage(searchTerms, accessKey) {
  if (!accessKey) {
    console.log('  ⚠️ No UNSPLASH_ACCESS_KEY, skipping Unsplash')
    return null
  }

  try {
    const query = encodeURIComponent(searchTerms)
    const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`  ⚠️ Unsplash API error: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()

    // Return the regular size URL (good quality, reasonable size)
    // Also append utm params for Unsplash attribution compliance
    const imageUrl = `${data.urls.regular}&utm_source=thornton_events&utm_medium=referral`

    return {
      url: imageUrl,
      source: 'unsplash',
      photographer: data.user?.name,
      photographerUrl: data.user?.links?.html,
    }
  } catch (error) {
    console.log(`  ⚠️ Unsplash fetch error: ${error.message}`)
    return null
  }
}

/**
 * Generate image using DALL-E
 * Note: This costs money (~$0.04 per 1024x1024 image)
 */
async function generateDalleImage(title, category, apiKey) {
  if (!apiKey) {
    console.log('  ⚠️ No OPENAI_API_KEY, skipping DALL-E')
    return null
  }

  try {
    const openai = new OpenAI({ apiKey })

    // Create a prompt optimized for event imagery
    const prompt = `A vibrant, family-friendly illustration for a community event called "${title}".
Category: ${category || 'Community Event'}.
Style: Colorful, welcoming, modern, suitable for a local events website.
No text or words in the image. Safe for all ages.`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    return {
      url: response.data[0].url,
      source: 'dalle',
      revised_prompt: response.data[0].revised_prompt,
    }
  } catch (error) {
    console.log(`  ⚠️ DALL-E generation error: ${error.message}`)
    return null
  }
}

/**
 * Get a curated local image based on category
 * Uses pre-selected images from public folder
 */
function getLocalFallbackImage(category) {
  // Map categories to local placeholder images
  const localImages = {
    'Library': '/event-images/library-placeholder.jpg',
    'Family Fun': '/event-images/family-placeholder.jpg',
    'Festival': '/event-images/festival-placeholder.jpg',
    'Community': '/event-images/community-placeholder.jpg',
    'default': '/event-images/event-placeholder.jpg',
  }

  return localImages[category] || localImages['default']
}

/**
 * Main function to get an event image
 *
 * @param {string} title - Event title
 * @param {string} category - Event category
 * @param {object} options - Configuration options
 * @param {string} options.unsplashKey - Unsplash API access key
 * @param {string} options.openaiKey - OpenAI API key for DALL-E
 * @param {string} options.preferredSource - 'unsplash', 'dalle', or 'auto'
 * @param {boolean} options.useFallback - Whether to use local fallback if APIs fail
 * @returns {Promise<string|null>} - Image URL or null
 */
export async function getEventImage(title, category, options = {}) {
  const {
    unsplashKey = process.env.UNSPLASH_ACCESS_KEY,
    openaiKey = process.env.OPENAI_API_KEY,
    preferredSource = 'unsplash',
    useFallback = false,
  } = options

  let result = null

  // Try preferred source first
  if (preferredSource === 'unsplash' || preferredSource === 'auto') {
    const searchTerms = getSearchTerms(title, category)
    result = await fetchUnsplashImage(searchTerms, unsplashKey)
    if (result) {
      return result.url
    }
  }

  // Try DALL-E if Unsplash failed or DALL-E is preferred
  if (preferredSource === 'dalle' || (preferredSource === 'auto' && !result)) {
    result = await generateDalleImage(title, category, openaiKey)
    if (result) {
      return result.url
    }
  }

  // Use local fallback if enabled
  if (useFallback) {
    return getLocalFallbackImage(category)
  }

  return null
}

/**
 * Batch process events to add images
 * Includes rate limiting to respect API limits
 *
 * @param {Array} events - Array of event objects with title and category
 * @param {object} options - Same as getEventImage options
 * @param {number} options.delayMs - Delay between requests (default: 1200ms for Unsplash)
 * @returns {Promise<Array>} - Events with image_url populated
 */
export async function addImagesToEvents(events, options = {}) {
  const { delayMs = 1200, ...imageOptions } = options
  const results = []

  console.log(`\n🖼️  Adding images to ${events.length} events...`)

  for (let i = 0; i < events.length; i++) {
    const event = events[i]

    // Skip if already has an image
    if (event.image_url) {
      console.log(`  [${i + 1}/${events.length}] ${event.title.substring(0, 40)}... (has image)`)
      results.push(event)
      continue
    }

    console.log(`  [${i + 1}/${events.length}] ${event.title.substring(0, 40)}...`)

    const imageUrl = await getEventImage(event.title, event.category, imageOptions)

    results.push({
      ...event,
      image_url: imageUrl,
    })

    // Rate limiting - wait between requests
    if (i < events.length - 1 && imageUrl) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  const withImages = results.filter(e => e.image_url).length
  console.log(`✅ Added images to ${withImages}/${events.length} events\n`)

  return results
}

export default { getEventImage, addImagesToEvents }
