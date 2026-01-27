# Phase 1 Setup Instructions

## Completed Tasks

Phase 1 (Foundation & Authentication) has been successfully implemented! Here's what was created:

### 1. Database Schema
- Created comprehensive SQL schema in [scripts/create-db-schema.sql](scripts/create-db-schema.sql)
- Includes tables for: profiles, articles, deals, favorites, newsletter_subscriptions, event_rsvps
- Row Level Security (RLS) policies configured
- Automatic profile creation on user signup

### 2. Authentication System
- Updated [lib/supabaseClient.ts](lib/supabaseClient.ts) to enable auth
- Created [lib/AuthContext.tsx](lib/AuthContext.tsx) - React Context for auth state
- Created [lib/authHelpers.ts](lib/authHelpers.ts) - Helper utilities
- Created [middleware.ts](middleware.ts) - Protected routes

### 3. Auth Pages
- Login: [app/auth/login/page.tsx](app/auth/login/page.tsx)
- Signup: [app/auth/signup/page.tsx](app/auth/signup/page.tsx)
- Forgot Password: [app/auth/forgot-password/page.tsx](app/auth/forgot-password/page.tsx)
- Profile: [app/account/profile/page.tsx](app/account/profile/page.tsx)

### 4. Dependencies Installed
- `@supabase/ssr` - Modern Supabase SSR package for Next.js 15

### 5. Deployment Configuration
- **Migrated from static export to SSR** (Server-Side Rendering)
- Updated [next.config.mjs](next.config.mjs) to enable server features
- **Dev server is running** at http://localhost:3000
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options (Vercel recommended)

---

## Next Steps: Database Setup

### Step 1: Enable Supabase Auth

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (jmxbcefszodysicrqztn)
3. Navigate to **Authentication** → **Providers**
4. Enable **Email** provider:
   - Toggle "Enable Email provider" ON
   - Configure email templates (optional):
     - Confirmation email
     - Password reset email
   - Click **Save**

### Step 2: Execute Database Schema

1. In Supabase Dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of [scripts/create-db-schema.sql](scripts/create-db-schema.sql)
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Verify success message: "Database schema created successfully! 🎉"

### Step 3: Create Your Admin Account

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/auth/signup

3. Sign up with your email address (the one you want to be admin)

4. After signing up, go back to Supabase SQL Editor

5. Run this query to make yourself an admin (replace with your email):
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-email@example.com';
   ```

6. Refresh the page - you should now see "Administrator" role on your profile

### Step 4: Configure Email Settings (Optional but Recommended)

For production, configure custom SMTP settings:

1. In Supabase Dashboard, go to **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your email provider (Gmail, SendGrid, etc.)
4. Test email delivery

---

## Testing the Authentication System

### Test Signup Flow
1. Go to http://localhost:3000/auth/signup
2. Create a new account
3. Verify you're redirected to home page
4. Check that profile was created in Supabase

### Test Login Flow
1. Sign out (go to /account/profile and click "Sign out")
2. Go to http://localhost:3000/auth/login
3. Sign in with your credentials
4. Verify successful login

### Test Protected Routes
1. Sign out
2. Try to access http://localhost:3000/account/profile
3. Verify you're redirected to login page
4. Sign in and verify you can access the profile page

### Test Password Reset
1. Go to http://localhost:3000/auth/forgot-password
2. Enter your email
3. Check your email for reset link
4. Follow link to reset password

---

## Database Tables Overview

### `profiles`
- User profile information
- Links to auth.users
- Contains role (user/admin)

### `articles`
- Blog posts and articles
- Author information
- Categories and tags
- Featured flag for homepage

### `deals`
- Discount offers
- Business information
- Start/end dates
- Auto-expiration

### `favorites`
- User bookmarks
- Supports events, articles, deals

### `newsletter_subscriptions`
- Email subscribers
- Preference management
- Verification tokens

### `event_rsvps`
- Event RSVPs
- Guest count
- Status (attending/maybe/not_attending)

---

## Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jmxbcefszodysicrqztn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Common Issues & Solutions

### Issue: "User not found" after signup
**Solution:** Check that the profile trigger is working. Run:
```sql
select * from public.profiles;
```
If empty, manually insert a profile or check trigger function.

### Issue: Middleware redirecting incorrectly
**Solution:** Clear browser cookies and localStorage, then try again.

### Issue: Email verification not working
**Solution:** Check Supabase Auth settings. For development, email confirmation can be disabled in Settings → Auth → Email Auth.

### Issue: TypeScript errors about '@/lib/AuthContext'
**Solution:** Ensure tsconfig.json has path alias configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## What's Next?

Phase 1 is complete! Next phases:

- **Phase 2:** UI Redesign (clean white Macaroni KID style)
- **Phase 3:** Articles/Blog System
- **Phase 4:** Deals System
- **Phase 5:** User Features (favorites, RSVPs)
- **Phase 6:** Newsletter System

Would you like to proceed with Phase 2?

---

## Rollback Instructions (If Needed)

If you need to roll back the database changes:

```sql
-- Drop all new tables
drop table if exists public.event_rsvps cascade;
drop table if exists public.newsletter_subscriptions cascade;
drop table if exists public.favorites cascade;
drop table if exists public.deals cascade;
drop table if exists public.articles cascade;
drop table if exists public.profiles cascade;

-- Drop functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.expire_old_deals() cascade;
drop function if exists public.get_event_rsvp_count(text) cascade;
drop function if exists public.is_favorited(uuid, text, text) cascade;
drop function if exists public.is_admin(uuid) cascade;

-- Remove columns from events table
alter table public.events drop column if exists featured;
alter table public.events drop column if exists rsvp_count;
```

---

## Support

For issues or questions:
- Check the Supabase logs in Dashboard → Logs
- Review browser console for errors
- Check Network tab for API failures

Happy coding! 🚀
