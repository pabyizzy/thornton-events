-- ============================================================================
-- THORNTON EVENTS - QUICK SETUP SQL
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up all tables and sample data
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query
-- ============================================================================

-- ============================================================================
-- 1. CONTACT MESSAGES TABLE (for contact form)
-- ============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null check (inquiry_type in ('general', 'ads')),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

-- Allow anyone to submit a contact message
alter table public.contact_messages enable row level security;
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

-- ============================================================================
-- 2. DEALS TABLE (if not exists)
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

-- Enable RLS for deals
alter table public.deals enable row level security;

-- Anyone can view active deals
create policy "Active deals viewable by all"
  on public.deals for select
  using (status = 'active' and end_date >= now());

-- Allow inserts for the anon key (for admin page without auth)
create policy "Allow deal inserts"
  on public.deals for insert
  with check (true);

create policy "Allow deal updates"
  on public.deals for update
  using (true);

create policy "Allow deal deletes"
  on public.deals for delete
  using (true);

-- ============================================================================
-- 3. DEAL SUBMISSIONS TABLE (for business submissions)
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
  reviewed_at timestamptz
);

alter table public.deal_submissions enable row level security;

create policy "Anyone can submit a deal"
  on public.deal_submissions for insert
  with check (true);

-- ============================================================================
-- 4. NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================================================
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.newsletter_subscriptions enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscriptions for insert
  with check (true);

-- ============================================================================
-- 5. SAMPLE DEALS - Real-looking deals for Thornton area
-- ============================================================================

-- Delete any existing sample deals first (optional - comment out if you want to keep existing)
-- DELETE FROM public.deals WHERE slug LIKE '%-sample';

INSERT INTO public.deals (slug, title, description, business_name, deal_type, discount_amount, promo_code, category, terms, start_date, end_date, url, image_url, status, featured) VALUES

-- Featured Deals
('jump-street-birthday-deal',
 'Birthday Party Package - 20% Off',
 'Celebrate your kid''s birthday at Jump Street Trampoline Park! Book a party package and get 20% off. Includes 2 hours of jump time, private party room, pizza, drinks, and paper goods for up to 15 kids. Perfect for ages 4-14!',
 'Jump Street Trampoline Park',
 'discount',
 '20% OFF',
 'BDAYTHORNTON',
 'Kids Activities',
 'Must book at least 7 days in advance. Valid for parties of 10+ kids. Weekend slots may have limited availability. Cannot be combined with other offers.',
 now(),
 now() + interval '60 days',
 'https://gotjump.com',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
 'active',
 true),

('chick-fil-a-family-night',
 'Family Night - Free Kids Meal',
 'Every Tuesday is Family Night at Chick-fil-A Thornton! Purchase any adult entree and get a FREE kids meal. Enjoy crafts and activities for the little ones while you dine.',
 'Chick-fil-A Thornton',
 'freebie',
 'FREE Kids Meal',
 NULL,
 'Restaurants & Dining',
 'Valid Tuesdays only, 5pm-8pm. One free kids meal per adult entree purchased. Kids 12 and under. Dine-in only.',
 now(),
 now() + interval '90 days',
 'https://www.chick-fil-a.com',
 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
 'active',
 true),

('yoga-first-month-free',
 'First Month of Yoga - FREE',
 'New to yoga? CorePower Yoga Thornton is offering your first month of unlimited classes absolutely FREE! All levels welcome - from total beginners to experienced yogis. Hot yoga, sculpt, and restore classes available.',
 'CorePower Yoga Thornton',
 'freebie',
 'FREE MONTH',
 'FREEYOGA',
 'Classes & Lessons',
 'New members only. Must be 18 or older. One per household. Valid ID required. Auto-enrollment in monthly membership after free month unless cancelled.',
 now(),
 now() + interval '45 days',
 'https://www.corepoweryoga.com',
 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
 'active',
 true),

-- Regular Deals
('great-clips-kids-haircut',
 'Kids Haircuts - Only $12',
 'Back to school special! Get your kids looking sharp with $12 haircuts at Great Clips. Includes shampoo, cut, and style. No appointment needed - just walk in!',
 'Great Clips - Thornton Town Center',
 'discount',
 '$12',
 NULL,
 'Services',
 'Ages 12 and under. Valid at Thornton Town Center location only. No appointment necessary.',
 now(),
 now() + interval '30 days',
 'https://www.greatclips.com',
 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
 'active',
 false),

('oil-change-special',
 'Full Synthetic Oil Change - $49.99',
 'Keep your car running smooth with a full synthetic oil change! Includes up to 5 quarts of synthetic oil, new filter, and complimentary 21-point inspection.',
 'Jiffy Lube - 104th Ave',
 'coupon',
 '$49.99',
 'THORNTON50',
 'Services',
 'Most vehicles. Additional quarts extra charge. Specialty filters may cost more. See store for complete details.',
 now(),
 now() + interval '45 days',
 'https://www.jiffylube.com',
 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
 'active',
 false),

('cold-stone-bogo',
 'Buy One Get One Free Ice Cream',
 'Beat the heat with BOGO ice cream at Cold Stone Creamery! Buy any size Creation and get the second one FREE. Perfect treat for the whole family!',
 'Cold Stone Creamery - Thornton',
 'promotion',
 'BOGO FREE',
 'COOLTHORNTON',
 'Restaurants & Dining',
 'Equal or lesser value free. One coupon per customer per visit. Cannot be combined with other offers. Valid at Thornton location only.',
 now(),
 now() + interval '21 days',
 'https://www.coldstonecreamery.com',
 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800',
 'active',
 false),

('petco-grooming-discount',
 '30% Off First Grooming Service',
 'New grooming clients get 30% off their first full-service groom! Includes bath, haircut, nail trim, ear cleaning, and bandana. Your pup will leave looking and smelling amazing!',
 'Petco - Thornton',
 'discount',
 '30% OFF',
 'NEWGROOM30',
 'Services',
 'New grooming clients only. Must book appointment. Some breed restrictions may apply. Cannot combine with other grooming offers.',
 now(),
 now() + interval '60 days',
 'https://www.petco.com',
 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800',
 'active',
 false),

('little-gym-trial',
 'Free Trial Class for Kids',
 'Try a FREE class at The Little Gym! Perfect for babies, toddlers, and kids up to 12. Gymnastics, dance, sports skills, and karate classes available. See why families love The Little Gym!',
 'The Little Gym of Thornton',
 'freebie',
 'FREE CLASS',
 NULL,
 'Kids Activities',
 'One free trial per child. Must schedule in advance. Parent/guardian must stay on premises for children under 6.',
 now(),
 now() + interval '30 days',
 'https://www.thelittlegym.com',
 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
 'active',
 false);

-- ============================================================================
-- DONE! Your database is now set up with sample deals.
-- ============================================================================

SELECT 'Setup complete! You now have:' as status;
SELECT '- contact_messages table' as created;
SELECT '- deals table with 8 sample deals' as created;
SELECT '- deal_submissions table' as created;
SELECT '- newsletter_subscriptions table' as created;
