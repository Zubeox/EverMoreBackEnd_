-- Reset and set up gallery policies
-- First, enable RLS
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public read galleries" ON public.galleries;
DROP POLICY IF EXISTS "Admin full access galleries" ON public.galleries;
DROP POLICY IF EXISTS "Service role bypass galleries" ON public.galleries;

-- 1. Public read access policy
CREATE POLICY "Public read galleries"
ON public.galleries
FOR SELECT
TO public
USING (true);

-- 2. Service role full access policy (bypasses RLS)
CREATE POLICY "Service role bypass galleries"
ON public.galleries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant base schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT SELECT ON public.galleries TO anon, authenticated;
GRANT ALL ON public.galleries TO service_role;

-- Grant sequence permissions (needed for INSERT operations)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'galleries'
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS must be enabled on galleries table';
  END IF;
END
$$;