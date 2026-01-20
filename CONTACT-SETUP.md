# Contact Form Setup

This project is exported as a static site (`output: 'export'`), so the contact form stores messages directly in Supabase from the browser (insert-only via RLS). View messages in the Supabase dashboard.

## 1) Environment variables
Create `./.env.local` with your Supabase details (used by the client in the browser):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Restart the dev server after adding these.

## 2) Create the table and policies
Open Supabase → SQL Editor and run the SQL in:

`./scripts/contact_messages.sql`

This creates the `contact_messages` table and enables Row Level Security:
- Public can insert messages
- Public cannot read/update/delete messages
- The service role (in Supabase dashboard) bypasses RLS, so you can view all rows there

## 3) Where to see messages
Use the Supabase dashboard → Table Editor → `contact_messages` to review submissions.

If you later switch to a non-static deployment (Node server), we can add a password-protected admin page to list messages using the service role on the server only.

## 4) Email follow-up
Ad inquiries are answered from `thorntoncoevents@gmail.com`. You can optionally add email notifications later (via Supabase functions or a server) if you move off static export.


