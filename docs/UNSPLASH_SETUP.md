# Unsplash API Setup for Hero Images

The AI article generator can automatically fetch beautiful, relevant hero images for your articles using the Unsplash API.

## Why Unsplash?

- **Free tier**: 50 requests per hour
- **High-quality images**: Professional photography
- **Royalty-free**: Free to use with attribution
- **Relevant**: Search-based image selection

## Setup Instructions

### 1. Create Unsplash Developer Account

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Click "Register as a Developer"
3. Create a free account or log in

### 2. Create a New Application

1. Once logged in, go to [Your Apps](https://unsplash.com/oauth/applications)
2. Click "New Application"
3. Accept the API terms and conditions
4. Fill in the application details:
   - **Application name**: Thornton Events
   - **Description**: Community events website for Thornton, Colorado
5. Click "Create Application"

### 3. Get Your Access Key

1. On your application page, you'll see:
   - **Access Key** - This is what you need
   - **Secret Key** - Not needed for this integration
2. Copy the **Access Key**

### 4. Add to Environment Variables

1. Open your `.env.local` file
2. Add the following line:
   ```
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
3. Save the file
4. Restart your Next.js development server

## Usage

Once configured, the AI article generator will automatically:

1. **Generate articles** using OpenAI
2. **Search Unsplash** for relevant images based on:
   - Article category (for event-based articles)
   - Topic or custom topic (for resource articles)
3. **Include hero image URL** in the article data
4. **Display on article page** with proper attribution

## Examples

### Event-Based Articles
- Category: "Family Fun" → Searches for "family activities events"
- Category: "Sports & Recreation" → Searches for "sports recreation"

### Resource Articles
- Topic: "Parks & Playgrounds" → Searches for "Best Parks in Thornton"
- Custom Topic: "Ice Cream Shops" → Searches for "Ice Cream Shops"

## What if I Don't Set It Up?

The articles will still work perfectly without Unsplash! If the API key is not configured:

- Articles generate normally
- No hero image is included
- Article displays without the hero section
- Everything else functions the same

## Rate Limits

**Free tier limits:**
- 50 requests per hour
- 5,000 requests per month

**Tips to stay within limits:**
- Images are fetched only when generating new articles
- Once saved, the image URL is stored in the database
- No additional requests are made when viewing articles

## Attribution

Unsplash requires attribution for images. This is automatically handled by:
- Including photographer credit in the image metadata
- Linking back to Unsplash when possible

## Troubleshooting

### "Failed to fetch hero image"
- Check that your API key is correct
- Verify you haven't exceeded rate limits
- Check the server console for detailed error messages

### Images not loading
- Verify the `UNSPLASH_ACCESS_KEY` environment variable is set
- Restart your development server after adding the key
- Check browser console for CORS or loading errors

### Wrong images showing up
- The search is based on article topic/category
- You can manually replace the image URL in the article editor
- Consider making your article titles/categories more specific

## Advanced: Custom Image Search

If you want to customize the image search logic, edit:
- `app/api/generate-article/route.ts` (line ~165)
- `app/api/generate-resource-article/route.ts` (line ~160)

Change the `searchQuery` variable to customize what images are fetched.

## Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash Guidelines](https://unsplash.com/api-terms)
- [Find Great Images](https://unsplash.com/)
