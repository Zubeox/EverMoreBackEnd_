-- public_read_policies.sql
-- Run these statements in your Supabase project SQL editor to fix
-- "permission denied for schema public" and to create safe public
-- read policies for the tables used by the frontend/admin UI.
--
-- Notes:
--  - Do NOT add INSERT/UPDATE/DELETE grants for the anon role.
--  - Admin mutations must go through a backend that uses the service-role key.
--  - For quick testing you can GRANT SELECT, but for production prefer RLS + policies.

-- 1) Ensure anon can reference the public schema (fixes schema permission denial)
GRANT USAGE ON SCHEMA public TO anon;

-- 2a) Quick test: allow anon SELECT on all existing/future tables in public
-- (fast for testing; use carefully)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- 2b) Recommended: Enable RLS and add an explicit public SELECT policy per-table
-- Replace table names below if your app uses different ones.

-- galleries
ALTER TABLE IF EXISTS public.galleries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read - galleries" ON public.galleries;
CREATE POLICY "Public read - galleries" ON public.galleries
  FOR SELECT
  USING (true);

-- client_galleries (if you use it publicly)
ALTER TABLE IF EXISTS public.client_galleries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read - client_galleries" ON public.client_galleries;
CREATE POLICY "Public read - client_galleries" ON public.client_galleries
  FOR SELECT
  USING (true);

-- wedding_stories (if present)
ALTER TABLE IF EXISTS public.wedding_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read - wedding_stories" ON public.wedding_stories;
CREATE POLICY "Public read - wedding_stories" ON public.wedding_stories
  FOR SELECT
  USING (true);

-- 3) How to test after running these statements:
--  - Reload your frontend, open DevTools Network tab and re-run the failing request.
--  - The REST request to /rest/v1/galleries should return 200 and not 403.

-- 4) If you need to keep some fields private, prefer row-level policies using
--    a condition like: USING (public_viewable = true) or similar.

-- 5) IMPORTANT: Do not use the anon role for admin writes (INSERT/UPDATE/DELETE).
--    Keep the service role key on the server and expose admin endpoints that call
--    Supabase with the service role key.

-- EOF
