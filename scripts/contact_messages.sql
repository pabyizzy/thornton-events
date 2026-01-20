-- Create contact_messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  inquiry_type text not null check (inquiry_type in ('general','ads')),
  name text not null,
  email text not null,
  subject text,
  message text not null
);

-- Enable Row Level Security
alter table public.contact_messages enable row level security;

-- Policy: anyone can insert a new message
drop policy if exists "Allow anonymous inserts" on public.contact_messages;
create policy "Allow anonymous inserts"
on public.contact_messages for insert
to anon, authenticated
with check (true);

-- Policy: no one can select/update/delete by default (service role bypasses RLS)
drop policy if exists "No selects" on public.contact_messages;
create policy "No selects"
on public.contact_messages for select
to anon, authenticated
using (false);

drop policy if exists "No updates" on public.contact_messages;
create policy "No updates"
on public.contact_messages for update
to anon, authenticated
using (false)
with check (false);

drop policy if exists "No deletes" on public.contact_messages;
create policy "No deletes"
on public.contact_messages for delete
to anon, authenticated
using (false);

-- Note: View messages using Supabase dashboard or a server-side client with the service role key.


