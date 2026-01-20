# Hostinger Deployment Guide

## Quick Setup

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to Hostinger:**
   - Upload the entire contents of the `out` folder to your Hostinger public_html directory
   - Make sure to include the `.htaccess` file (it's already in the out folder)

3. **Environment Variables:**
   - The app uses client-side Supabase, so your environment variables are already baked into the build
   - Make sure your `.env.local` file has the correct Supabase credentials before building

## What's Included

- ✅ Static HTML files
- ✅ JavaScript bundles
- ✅ CSS files
- ✅ `.htaccess` for proper routing
- ✅ All static assets (images, icons, etc.)

## Troubleshooting

### If the site doesn't load:
1. Make sure you uploaded the `.htaccess` file
2. Check that your Supabase environment variables are correct
3. Verify that your Supabase project allows requests from your domain

### If client-side routing doesn't work:
The `.htaccess` file handles this by redirecting all requests to `index.html` when the file doesn't exist.

### If Supabase requests fail:
- Check browser console for CORS errors
- Verify your Supabase project settings allow your domain
- Make sure environment variables are set correctly in `.env.local`
