-- Enable Row Level Security on events table (if not already enabled)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy if it exists
DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;

-- Create policy to allow anyone to SELECT (read) events
CREATE POLICY "Allow public read access to events"
ON public.events
FOR SELECT
TO public
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'events';
