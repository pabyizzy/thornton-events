-- ============================================================================
-- Thornton Events Database Schema
-- Phase 1: Foundation & Authentication
-- ============================================================================
-- This script creates all necessary tables for the Macaroni KID-style platform
-- Execute this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles viewable by all"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger for profiles
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 2. ARTICLES / BLOG POSTS
-- ============================================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  content text not null,
  excerpt text,
  featured_image_url text,
  featured_image_caption text,
  author_id uuid references public.profiles(id),
  author_name text not null,
  category text not null,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean default false,
  view_count int default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for articles
create index if not exists articles_slug_idx on public.articles(slug);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_category_idx on public.articles(category);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_featured_idx on public.articles(featured) where featured = true;

-- Enable RLS
alter table public.articles enable row level security;

-- RLS Policies for articles
create policy "Published articles viewable by all"
  on public.articles for select
  using (status = 'published' or auth.uid() = author_id);

create policy "Admins can insert articles"
  on public.articles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update articles"
  on public.articles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete articles"
  on public.articles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add trigger for articles
create trigger set_updated_at
  before update on public.articles
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 3. DEALS / DISCOUNTS
-- ============================================================================

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  business_name text not null,
  business_logo_url text,
  deal_type text not null check (deal_type in ('discount', 'coupon', 'promotion', 'freebie')),
  discount_amount text,
  promo_code text,
  category text not null,
  terms text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  url text,
  image_url text,
  status text not null default 'active' check (status in ('active', 'expired', 'paused')),
  featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for deals
create index if not exists deals_slug_idx on public.deals(slug);
create index if not exists deals_status_idx on public.deals(status);
create index if not exists deals_category_idx on public.deals(category);
create index if not exists deals_end_date_idx on public.deals(end_date);
create index if not exists deals_featured_idx on public.deals(featured) where featured = true;

-- Enable RLS
alter table public.deals enable row level security;

-- RLS Policies for deals
create policy "Active deals viewable by all"
  on public.deals for select
  using (
    (status = 'active' and end_date >= now()) or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert deals"
  on public.deals for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update deals"
  on public.deals for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete deals"
  on public.deals for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Add trigger for deals
create trigger set_updated_at
  before update on public.deals
  for each row
  execute function public.handle_updated_at();

-- Function to auto-expire deals
create or replace function public.expire_old_deals()
returns void as $$
begin
  update public.deals
  set status = 'expired'
  where end_date < now() and status = 'active';
end;
$$ language plpgsql;

-- ============================================================================
-- 3b. DEAL SUBMISSIONS (Business-submitted deals pending approval)
-- ============================================================================

create table if not exists public.deal_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  business_email text not null,
  business_phone text,
  business_website text,
  contact_name text not null,
  title text not null,
  description text not null,
  deal_type text not null check (deal_type in ('discount', 'coupon', 'promotion', 'freebie')),
  discount_amount text,
  promo_code text,
  category text not null,
  terms text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

-- Create indexes
create index if not exists deal_submissions_status_idx on public.deal_submissions(status);
create index if not exists deal_submissions_submitted_at_idx on public.deal_submissions(submitted_at desc);

-- Enable RLS
alter table public.deal_submissions enable row level security;

-- RLS Policies
create policy "Anyone can submit a deal"
  on public.deal_submissions for insert
  with check (true);

create policy "Admins can view all submissions"
  on public.deal_submissions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update submissions"
  on public.deal_submissions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================================
-- 4. USER FAVORITES
-- ============================================================================

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('event', 'article', 'deal')),
  content_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, content_type, content_id)
);

-- Create indexes for favorites
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_content_type_idx on public.favorites(content_type);

-- Enable RLS
alter table public.favorites enable row level security;

-- RLS Policies for favorites
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 5. NEWSLETTER SUBSCRIPTIONS
-- ============================================================================

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  preferences jsonb default '{"weekly_roundup": true, "event_alerts": true, "deal_notifications": true}'::jsonb,
  verification_token text,
  verified_at timestamptz,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Create indexes for newsletter_subscriptions
create index if not exists newsletter_email_idx on public.newsletter_subscriptions(email);
create index if not exists newsletter_status_idx on public.newsletter_subscriptions(status);
create index if not exists newsletter_user_id_idx on public.newsletter_subscriptions(user_id);

-- Enable RLS
alter table public.newsletter_subscriptions enable row level security;

-- RLS Policies for newsletter_subscriptions
create policy "Users can view own subscription"
  on public.newsletter_subscriptions for select
  using (auth.uid() = user_id or auth.role() = 'anon');

create policy "Anyone can insert subscription"
  on public.newsletter_subscriptions for insert
  with check (true);

create policy "Users can update own subscription"
  on public.newsletter_subscriptions for update
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.newsletter_subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================================
-- 6. EVENT RSVPS
-- ============================================================================

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  guests_count int default 1 check (guests_count >= 1 and guests_count <= 10),
  status text not null default 'attending' check (status in ('attending', 'maybe', 'not_attending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- Create indexes for event_rsvps
create index if not exists event_rsvps_event_id_idx on public.event_rsvps(event_id);
create index if not exists event_rsvps_user_id_idx on public.event_rsvps(user_id);
create index if not exists event_rsvps_status_idx on public.event_rsvps(status);

-- Enable RLS
alter table public.event_rsvps enable row level security;

-- RLS Policies for event_rsvps
create policy "Users can view own RSVPs"
  on public.event_rsvps for select
  using (auth.uid() = user_id);

create policy "Users can insert own RSVPs"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own RSVPs"
  on public.event_rsvps for update
  using (auth.uid() = user_id);

create policy "Users can delete own RSVPs"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- Add trigger for event_rsvps
create trigger set_updated_at
  before update on public.event_rsvps
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- 7. EXTEND EVENTS TABLE
-- ============================================================================

-- Add new columns to existing events table
alter table public.events add column if not exists featured boolean default false;
alter table public.events add column if not exists rsvp_count int default 0;

-- Create index for featured events
create index if not exists events_featured_idx on public.events(featured) where featured = true;

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to get RSVP count for an event
create or replace function public.get_event_rsvp_count(event_id_param text)
returns int as $$
  select count(*)::int
  from public.event_rsvps
  where event_id = event_id_param and status = 'attending';
$$ language sql stable;

-- Function to check if user has favorited content
create or replace function public.is_favorited(user_id_param uuid, content_type_param text, content_id_param text)
returns boolean as $$
  select exists(
    select 1 from public.favorites
    where user_id = user_id_param
      and content_type = content_type_param
      and content_id = content_id_param
  );
$$ language sql stable;

-- Function to check if user is admin
create or replace function public.is_admin(user_id_param uuid)
returns boolean as $$
  select exists(
    select 1 from public.profiles
    where id = user_id_param and role = 'admin'
  );
$$ language sql stable;

-- ============================================================================
-- 9. INITIAL DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to create a test admin user (replace email with your own)
-- You'll need to sign up with this email first, then run this update:
--
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-email@example.com';

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Success message
select 'Database schema created successfully! 🎉' as message;
