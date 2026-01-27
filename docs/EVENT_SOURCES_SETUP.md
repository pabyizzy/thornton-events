# Event Sources Setup Guide

Complete guide to setting up multiple event sources for Thornton Events.

## Overview

Your site can pull events from multiple sources automatically:
- **Ticketmaster**: Large venues, concerts, sports
- **Eventbrite**: Community events, workshops, local gatherings
- **Meetup** (optional): Community groups, meetups

## Quick Start

### 1. Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `thornton-events`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (starts with `eyJ...`)
5. Add to `.env.local`:
   ```env
   SUPABASE_URL=https://jmxbcefszodysicrqztn.supabase.co
   SUPABASE_SERVICE_ROLE=your_service_role_key_here
   ```

⚠️ **Important**: The service role key has admin privileges. Keep it secret!

---

## Event Source APIs

### Ticketmaster API (Optional but Recommended)

**Coverage**: Large venues, concerts, sports events, theater

**Free Tier**: 5,000 API calls/day

#### Setup Steps:

1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Click "Get Your API Key" or "Sign Up"
3. Create an account
4. Go to [My Apps](https://developer.ticketmaster.com/products-and-docs/apps/myapps/)
5. Click "+ Create New App"
6. Fill in details:
   - **App Name**: Thornton Events
   - **Description**: Community events website for Thornton, CO
7. Click "Save"
8. Copy your **Consumer Key** (this is your API key)
9. Add to `.env.local`:
   ```env
   TICKETMASTER_API_KEY=your_ticketmaster_key_here
   ```

**Documentation**: https://developer.ticketmaster.com/products-and-docs/apis/getting-started/

---

### Eventbrite API ❌ DEPRECATED

**Status**: ⚠️ **The Eventbrite Event Search API was deprecated and shut down in 2020**

**Coverage**: ~~Community events, workshops, classes, local gatherings~~

**Free Tier**: ~~1,000 requests/day~~

**Why Deprecated**: Eventbrite discontinued public geographic event search in February 2020. Only specific event/venue/organization lookups are now available.

#### Setup Steps:

1. Go to [Eventbrite Account Settings](https://www.eventbrite.com/account-settings/)
2. Log in or create an account
3. Go directly to: https://www.eventbrite.com/account-settings/apps
4. Click "Create New App" or similar button
5. Fill in app details:
   - **Application Name**: Thornton Events
   - **Application Description**: Community events aggregator for Thornton, CO
   - **Application URL**: http://localhost:3000 (or your production URL)
6. Accept terms and click "Create Key"
7. Copy your **Private OAuth Token** (should be a long string, ~50+ characters)
8. Add to `.env.local`:
    ```env
    EVENTBRITE_API_KEY=your_long_eventbrite_oauth_token_here
    ```

**Important Notes**:
- The OAuth token should be long (50+ characters). If yours is short, it may be incomplete.
- Make sure you're copying the **Private OAuth Token**, not the app ID
- Eventbrite API v3 requires OAuth tokens for authentication
- If you get 404 errors, verify your token is correct and not expired

**Documentation**: https://www.eventbrite.com/platform/api

**API Explorer**: https://www.eventbrite.com/platform/api#/introduction/quick-start

---

### Meetup API (Optional)

**Coverage**: Community groups, recurring meetups, social gatherings

**Free Tier**: GraphQL API with reasonable limits

**Note**: Meetup recently changed their API. This integration is optional.

#### Setup Steps:

1. Go to [Meetup API](https://www.meetup.com/api/)
2. Log in with your Meetup account
3. Go to [API Keys](https://secure.meetup.com/meetup_api/key/)
4. Your API key will be displayed
5. Add to `.env.local`:
   ```env
   MEETUP_API_KEY=your_meetup_key_here
   ```

**Documentation**: https://www.meetup.com/api/guide/

---

## Running Event Ingestion

### Option 1: Ingest from All Sources (Recommended)

Run the multi-source aggregator:

```bash
node scripts/ingest-all-sources.mjs
```

This will:
- Run all enabled sources in parallel
- Show progress for each source
- Display summary of successes/failures
- Complete in ~10-30 seconds

### Option 2: Ingest from Individual Sources

Run specific sources:

```bash
# Ticketmaster only
node scripts/ingest-ticketmaster.mjs

# Eventbrite only
node scripts/ingest-eventbrite.mjs
```

### Option 3: Automate with GitHub Actions

Set up automated ingestion (runs daily):

1. Add API keys to GitHub Secrets:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add each key as a secret:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE`
     - `TICKETMASTER_API_KEY`
     - `EVENTBRITE_API_KEY`

2. The GitHub Action (`.github/workflows/ingest-events.yml`) will run automatically at 6 AM daily

---

## Configuration

### Search Radius

Events are fetched within 25 miles of Thornton, CO coordinates:
- **Latitude**: 39.8681
- **Longitude**: -104.9719

To change the radius, edit the ingestion scripts:
- `scripts/ingest-ticketmaster.mjs`: Line ~20 (`radius: 25`)
- `scripts/ingest-eventbrite.mjs`: Line ~23 (`SEARCH_RADIUS = '25mi'`)

### Time Range

Events are fetched for the next 3 months.

To change, edit:
- Ticketmaster: `scripts/ingest-ticketmaster.mjs` line ~32
- Eventbrite: `scripts/ingest-eventbrite.mjs` line ~39

---

## Troubleshooting

### "Missing env" error

**Problem**: `Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE / TICKETMASTER_API_KEY`

**Solution**:
1. Make sure all required keys are in `.env.local`
2. Keys must be set WITHOUT the `NEXT_PUBLIC_` prefix for scripts
3. Restart your terminal/command prompt after adding keys

### "API error 401" or "Unauthorized"

**Problem**: Invalid or expired API key

**Solution**:
1. Double-check you copied the entire key (they're usually very long)
2. Make sure there are no extra spaces or quotes around the key
3. Regenerate the key from the provider's dashboard

### "No events found"

**Problem**: API returned 0 events

**Possible causes**:
- No events scheduled in the next 3 months within 25 miles
- API rate limit exceeded
- API service temporarily down

**Solution**:
- Try increasing the search radius
- Check API status pages
- Wait and try again later

### Events not showing on website

**Problem**: Events ingested but not visible on site

**Solution**:
1. Check database:
   - Go to Supabase Dashboard → Table Editor → events
   - Verify events exist with `start_time` in the future
2. Check RLS policies:
   - Events table should have public SELECT policy
3. Clear browser cache and reload

---

## API Rate Limits

| Source | Free Tier | Limit Type |
|--------|-----------|------------|
| Ticketmaster | 5,000/day | Daily requests |
| Eventbrite | 1,000/day | Daily requests |
| Meetup | Varies | GraphQL complexity |

**Tips**:
- Run ingestion once daily (sufficient for event updates)
- Use GitHub Actions for automation
- Monitor usage in provider dashboards

---

## Event Categories

Events are auto-categorized by the APIs:

**Ticketmaster Categories**:
- Music, Sports, Arts & Theatre, Family, etc.

**Eventbrite Categories**:
- Business, Food & Drink, Health, Music, Community, etc.

**Custom Categories**: You can map external categories to your own in the transformation functions within each ingestion script.

---

## Database Schema

Events are stored with this structure:

```sql
{
  id: string (unique, e.g., "ticketmaster-123" or "eventbrite-456"),
  title: string,
  description: string | null,
  start_time: timestamp,
  end_time: timestamp | null,
  venue: string,
  city: string,
  state: string,
  url: string | null,
  image_url: string | null,
  price_text: string,
  category: string,
  source: string (ticketmaster | eventbrite | meetup)
}
```

---

## Next Steps

After setup:

1. Run `node scripts/ingest-all-sources.mjs`
2. Check your home page for events!
3. Set up GitHub Action for daily automation
4. Generate articles about events using AI

---

## Support

- **Ticketmaster**: https://developer.ticketmaster.com/support/
- **Eventbrite**: https://www.eventbrite.com/support/
- **Meetup**: https://help.meetup.com/
