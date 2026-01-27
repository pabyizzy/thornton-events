# Deployment Guide

## 🚀 Launch Checklist

Before going live, complete these tasks:

### Database Setup (Required)
- [ ] Run `scripts/quick-setup.sql` in Supabase SQL Editor to create tables and sample deals
- [ ] Verify tables exist: `deals`, `deal_submissions`, `contact_messages`, `newsletter_subscriptions`
- [ ] Add your own deals by editing existing ones or using the admin panel at `/admin/deals`

### Environment Variables (Required)
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in your deployment platform
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your deployment platform
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` for Google Analytics (optional but recommended)

### Google Analytics Setup (Recommended)
1. Go to https://analytics.google.com
2. Create a new GA4 property for your site
3. Copy the Measurement ID (starts with `G-`)
4. Add as environment variable: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

### Content Verification
- [ ] Homepage loads correctly with events and deals carousel
- [ ] Events page shows events from Supabase
- [ ] Deals page displays deals correctly
- [ ] Contact form at `/contact` works (sends to Supabase)
- [ ] Newsletter signup at `/subscribe` works
- [ ] Privacy Policy at `/privacy` looks correct
- [ ] Terms of Service at `/terms` looks correct

### Testing
- [ ] Test on desktop browser
- [ ] Test on mobile (Chrome DevTools or real device)
- [ ] Test all navigation links
- [ ] Test forms: contact, newsletter signup, deal submission
- [ ] Verify footer links work

### Post-Launch
- [ ] Set up custom domain in Vercel (if you have one)
- [ ] Monitor analytics for traffic
- [ ] Check contact form submissions in Supabase
- [ ] Schedule regular content updates (events, deals)

---

## Migration from Static Export to SSR

Your project has been updated from static export to Server-Side Rendering (SSR) to support authentication, middleware, and dynamic features required for the Macaroni KID-style platform.

---

## Recommended: Deploy to Vercel

Vercel is made by the creators of Next.js and provides zero-config deployment.

### Quick Start (5 minutes)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Switch to SSR with authentication"
   git push
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your `thornton-events` repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   In the Vercel project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jmxbcefszodysicrqztn.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)

4. **Click "Deploy"**

5. **Done!** Your site will be live at `thornton-events.vercel.app`

### Why Vercel?

- ✅ **Free tier** includes everything you need
- ✅ **Zero configuration** for Next.js
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Automatic deployments** on every git push
- ✅ **Preview deployments** for pull requests
- ✅ **100GB bandwidth/month** on free tier

---

## Alternative Options

### Netlify

Similar to Vercel, also great for Next.js:
- https://netlify.com
- Connect GitHub → Add env vars → Deploy
- Slightly different UI but same ease of use

### Railway

Good if you need more backend services:
- https://railway.app
- $5 free credit per month
- Simple pricing model

### DigitalOcean App Platform

If you prefer DigitalOcean:
- $5/month minimum (no free tier)
- Good for scaling
- More control

---

## Custom Domain Setup

Once deployed to Vercel:

1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `thorntonevents.com`)
3. Update DNS at your domain registrar:
   - Type: `A` | Name: `@` | Value: `76.76.21.21`
   - Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)

---

## What Changed from Static Export?

### Before (Static Export)
- Files generated at build time
- No server-side code
- No middleware
- No authentication
- Deployed to Hostinger as static files

### After (SSR)
- Server renders pages on-demand
- Middleware for route protection
- Full authentication support
- Admin dashboard capabilities
- Requires Node.js hosting (Vercel handles this)

---

## Environment Variables

Required for all deployments:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jmxbcefszodysicrqztn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Future phases will add:
```env
RESEND_API_KEY=...  # For newsletter (Phase 6)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Cost Comparison

| Platform | Free Tier | Paid | Best For |
|----------|-----------|------|----------|
| **Vercel** | 100GB/month | $20/mo | Most projects (recommended) |
| **Netlify** | 100GB/month | $19/mo | Alternative to Vercel |
| **Railway** | $5 credit/mo | Pay-per-use | Backend-heavy apps |
| **DigitalOcean** | None | $5+/mo | Cost control at scale |

**Recommendation:** Vercel free tier is perfect for launch and will handle significant traffic.

---

## Local Development

The dev server is already running! Access at:
- **Local:** http://localhost:3000
- **Network:** http://10.5.0.2:3000

Commands:
```bash
npm run dev    # Development server
npm run build  # Production build
npm start      # Run production build locally
npm run lint   # Run linter
```

---

## Next Steps

1. ✅ **Complete database setup** (see SETUP_INSTRUCTIONS.md)
2. ✅ **Test authentication locally** (signup, login, profile)
3. ✅ **Deploy to Vercel** when ready
4. ✅ **Proceed to Phase 2** (UI Redesign)

---

## Rollback (If Needed)

To return to static export (not recommended):

1. Update `next.config.mjs`:
   ```js
   const nextConfig = { output: 'export', images: { unoptimized: true } }
   ```
2. Delete `middleware.ts`
3. Implement client-side auth guards
4. Rebuild: `npm run build`

**Note:** You'll lose middleware, SSR, and server features.

---

Happy deploying! 🚀
