# Pexels API Setup for Hero Images

The AI article generator can use Pexels as an alternative to Unsplash for fetching beautiful, relevant hero images for your articles.

## Why Pexels?

- **Completely free**: Unlimited requests (no rate limits)
- **High-quality images**: Curated professional photography
- **No attribution required**: Use images without crediting
- **Family-friendly content**: Great for community websites
- **Simple API**: Easy to integrate and use

## Comparison: Pexels vs Unsplash

| Feature | Pexels | Unsplash |
|---------|--------|----------|
| **Free tier** | Unlimited | 50 requests/hour |
| **Monthly limit** | Unlimited | 5,000 requests |
| **Attribution** | Not required | Required |
| **Image quality** | Excellent | Excellent |
| **Family content** | Great selection | Great selection |
| **Search quality** | Very good | Very good |

**Recommendation**: Use **Pexels** for unlimited, attribution-free images, or keep both options available for variety.

## Setup Instructions

### 1. Create Pexels Account

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Click "Get Started" or "Sign Up"
3. Create a free account or log in with existing credentials

### 2. Generate API Key

1. Once logged in, go to [Your API Keys](https://www.pexels.com/api/)
2. You'll see your API key immediately after signing up
3. If you need to generate a new key:
   - Click on your profile icon
   - Go to "Image & Video API"
   - Your API key will be displayed

### 3. Add to Environment Variables

1. Open your `.env.local` file
2. Find the Pexels section (or add it if missing):
   ```env
   # Pexels for hero images (alternative to Unsplash)
   PEXELS_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_PEXELS_API_KEY=your_actual_api_key_here
   ```
3. Replace `your_actual_api_key_here` with your actual API key
4. Save the file
5. **Important**: Restart your Next.js development server for changes to take effect

## Usage

Once configured, you can choose between Pexels and Unsplash when generating articles:

### In the Admin Article Generator

1. Go to `/admin/generate-article`
2. Under "Generation Options", you'll see **Hero Image Source**
3. Choose between:
   - **Unsplash** (default) - Uses Unsplash API
   - **Pexels** - Uses Pexels API
4. Generate your article
5. The hero image will be fetched from your selected source

### Image Search Logic

The system automatically searches for relevant images based on:
- **Event-based articles**: Category (e.g., "Family Fun") + "family children activities"
- **Resource articles**: Topic (e.g., "Parks Playgrounds") + "family children happy"

### Fetch New Image Button

After generating an article, you can click "Fetch New Image" to get a different image from the same source (Unsplash or Pexels) you selected.

## Examples

### Event-Based Articles
- Category: "Family Fun" → Pexels search: "family fun family children activities"
- Category: "Sports & Recreation" → Pexels search: "sports recreation family children activities"

### Resource Articles
- Topic: "Parks & Playgrounds" → Pexels search: "Parks Playgrounds family children happy"
- Custom Topic: "Ice Cream Shops" → Pexels search: "Ice Cream Shops family children happy"

## What if I Don't Set It Up?

The articles will still work perfectly! If Pexels API key is not configured:
- You can still use Unsplash (if configured)
- Select Unsplash as your image source
- Articles will generate normally

If **both** Unsplash and Pexels are not configured:
- Articles generate without hero images
- Everything else functions the same

## API Limits

**Pexels Free Plan:**
- ✅ Unlimited requests per month
- ✅ No hourly rate limits
- ✅ 200 requests per hour soft limit (very generous)
- ✅ No credit card required

**Usage Tips:**
- Images are fetched only when generating new articles
- Once saved, the image URL is stored in the database
- No additional requests when viewing articles
- Use "Fetch New Image" sparingly to get different images

## Troubleshooting

### "Failed to fetch hero image"
- ✅ Check that your API key is correct in `.env.local`
- ✅ Ensure both `PEXELS_API_KEY` and `NEXT_PUBLIC_PEXELS_API_KEY` are set
- ✅ Restart your development server after adding the key
- ✅ Check the server console for detailed error messages

### Images not loading
- ✅ Verify the environment variables are set correctly
- ✅ Make sure you restarted the dev server (`npm run dev`)
- ✅ Check browser console for CORS or loading errors
- ✅ Ensure you selected "Pexels" as the image source in the generator

### "No images found"
- ✅ The search query might be too specific - try different category/topic
- ✅ Pexels has a large but finite library - some niche topics might have fewer images
- ✅ Click "Fetch New Image" to try a different search

### Wrong images showing up
- ✅ The search is based on article topic/category
- ✅ You can click "Fetch New Image" to get a different image
- ✅ Manually replace the image URL in the article editor if needed
- ✅ Try using Unsplash if Pexels doesn't have relevant images

## Switching Between Pexels and Unsplash

You can use both services and switch between them:

1. **During Generation**: Choose your preferred source before clicking "Generate"
2. **After Generation**: Click "Fetch New Image" to get a new image from the currently selected source
3. **Mix and Match**: Use Pexels for some articles, Unsplash for others

## Best Practices

1. **Try both sources**: Different services have different image styles
2. **Use meaningful categories**: Better categories = more relevant images
3. **Click "Fetch New Image" if needed**: Sometimes the first result isn't perfect
4. **Save your favorite source**: Stick with Pexels for unlimited requests

## API Documentation

- [Pexels API Documentation](https://www.pexels.com/api/documentation/)
- [Pexels API Guidelines](https://www.pexels.com/api/documentation/#guidelines)
- [Pexels License](https://www.pexels.com/license/)

## Support

If you encounter issues:
1. Check the [Pexels API Status](https://status.pexels.com/)
2. Review your API key in the Pexels dashboard
3. Check server console logs for detailed error messages
4. Ensure your `.env.local` file has both keys (with and without `NEXT_PUBLIC_` prefix)
