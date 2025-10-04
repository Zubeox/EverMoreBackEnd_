-- Drop existing policies
DROP POLICY IF EXISTS "Public read client_galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Allow authenticated read client_galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Allow insert client_galleries" ON public.client_galleries;
DROP POLICY IF EXISTS "Allow update own client_galleries" ON public.client_galleries;

-- Enable RLS
ALTER TABLE public.client_galleries ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table access
GRANT SELECT ON public.client_galleries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.client_galleries TO authenticated;

-- Create policies for client_galleries
CREATE POLICY "Public read client_galleries"
ON public.client_galleries
FOR SELECT
USING (
    status = 'active' 
    AND (
        current_timestamp < expiration_date 
        OR expiration_date IS NULL
    )
);

CREATE POLICY "Allow authenticated read client_galleries"
ON public.client_galleries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert client_galleries"
ON public.client_galleries
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update own client_galleries"
ON public.client_galleries
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to view active galleries
CREATE POLICY "Allow anonymous view active galleries"
ON public.client_galleries
FOR SELECT
TO anon
USING (
    status = 'active'
    AND (
        current_timestamp < expiration_date 
        OR expiration_date IS NULL
    )
);