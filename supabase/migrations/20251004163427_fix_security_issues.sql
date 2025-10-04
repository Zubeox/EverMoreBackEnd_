/*
  # Fix Security Issues

  ## Changes Made

  ### 1. Remove Unused Indexes
  Removes three indexes on the client_galleries table that are not being used:
  - idx_client_galleries_email - Email lookups can use table scan for admin operations
  - idx_client_galleries_status - Status filtering happens with other conditions
  - idx_client_galleries_expiration - Expiration checks are combined with status checks
  
  We keep the essential indexes:
  - idx_client_galleries_slug - Used for public gallery lookups by URL
  - idx_client_galleries_code - Used for access code authentication

  ### 2. Fix Function Search Path Mutability
  Adds `SECURITY DEFINER SET search_path = public, pg_temp` to all functions to prevent
  search path manipulation attacks. This ensures functions always execute with a known,
  safe search path.

  Functions updated:
  - generate_access_code() - Access code generation
  - set_access_code() - Access code assignment trigger
  - update_updated_at_column() - Timestamp update trigger
  - generate_client_name() - Client name generation trigger

  ## Security Notes
  - Unused indexes removed to reduce maintenance overhead and improve write performance
  - Function search paths secured to prevent privilege escalation attacks
  - All functions now execute with SECURITY DEFINER in controlled schema context
*/

-- =====================================================
-- 1. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_client_galleries_email;
DROP INDEX IF EXISTS idx_client_galleries_status;
DROP INDEX IF EXISTS idx_client_galleries_expiration;

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATH MUTABILITY
-- =====================================================

-- Function: Generate random 8-character access code (with secure search_path)
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function: Set unique access code before insert (with secure search_path)
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  IF NEW.access_code IS NULL THEN
    LOOP
      new_code := generate_access_code();
      SELECT EXISTS(SELECT 1 FROM client_galleries WHERE access_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.access_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

-- Function: Update updated_at timestamp (with secure search_path)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: Generate client name from bride and groom names (with secure search_path)
CREATE OR REPLACE FUNCTION generate_client_name()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.client_name IS NULL THEN
    NEW.client_name := NEW.bride_name || ' & ' || NEW.groom_name;
  END IF;
  RETURN NEW;
END;
$$;