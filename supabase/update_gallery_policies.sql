-- Reset and set up complete gallery policies
-- First, enable RLS
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_galleries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public read galleries" ON public.galleries;
DROP POLICY IF EXISTS "Service role bypass galleries" ON public.galleries;
DROP POLICY IF EXISTS "Public read client_galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Service role bypass client_galleries" ON public.client_galleries;

-- 1. Public read access policies
CREATE POLICY "Public read galleries"
ON public.galleries
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read client_galleries"
ON public.client_galleries
FOR SELECT
TO public
USING (status = 'active' AND expiration_date > now());

-- 2. Service role full access policies
CREATE POLICY "Service role bypass galleries"
ON public.galleries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role bypass client_galleries"
ON public.client_galleries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant base schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT SELECT ON public.galleries TO anon, authenticated;
GRANT ALL ON public.galleries TO service_role;

GRANT SELECT ON public.client_galleries TO anon, authenticated;
GRANT ALL ON public.client_galleries TO service_role;

-- Grant sequence permissions (needed for INSERT operations)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify RLS is enabled and policies are in place
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('galleries', 'client_galleries')
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS must be enabled on galleries and client_galleries tables';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('galleries', 'client_galleries')
  ) THEN
    RAISE EXCEPTION 'Policies must exist for galleries and client_galleries tables';
  END IF;
END
$$;