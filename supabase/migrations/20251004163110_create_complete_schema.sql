/*
  # Complete Photography Gallery Database Schema

  ## Overview
  This migration creates a complete database schema for a photography gallery application
  with client gallery management, portfolio galleries, partnerships, and contact forms.

  ## Tables Created

  ### 1. Client Gallery Management
  - `client_galleries` - Main table for client wedding galleries
    - Stores client information (names, email, wedding date)
    - Gallery access controls (password, access code, expiration)
    - Gallery metadata (slug, cover image, images array, status)
    - View tracking (view count, last accessed)
    - Settings (download permissions, welcome message, admin notes)
  
  - `client_images` - Individual images within client galleries
    - Links to parent gallery via foreign key
    - Stores image URLs and thumbnails
    - Maintains sort order via order_index
  
  - `client_gallery_analytics` - View tracking and analytics
    - Records each gallery view with timestamp
    - Captures visitor information (email, IP, user agent)
    - Tracks session duration for engagement metrics
  
  - `client_gallery_downloads` - Download activity tracking
    - Records all image downloads (single, zip_all, zip_favorites)
    - Links to gallery and tracks downloader email
    - Counts number of images in each download
  
  - `client_gallery_favorites` - Client favorite image selections
    - Allows clients to mark favorite images
    - Prevents duplicate favorites via unique constraint
    - Tracks when images were favorited

  ### 2. Admin Portfolio Management
  - `galleries` - Public portfolio galleries
    - Photography work displayed on website
    - Event information and cover images
    - Image collections for each gallery
  
  - `partners` - Partnership directory
    - Venue and vendor partnerships
    - Contact information and logos
    - Featured status and display ordering
    - Active/inactive status management
  
  - `partnership_inquiries` - Partnership requests
    - Incoming partnership applications
    - Company information and contact details
    - Status tracking (pending, approved, rejected)
    - Admin notes for internal communication
  
  - `contacts` - Contact form submissions
    - General inquiries from website visitors
    - Contact information and message content

  ## Database Functions & Triggers

  ### Access Code Generation
  - `generate_access_code()` - Generates random 8-character alphanumeric codes
  - `set_access_code()` - Ensures unique access code on gallery creation
  - `ensure_access_code` trigger - Automatically assigns codes before insert

  ### Timestamp Management
  - `update_updated_at_column()` - Auto-updates updated_at timestamp
  - Triggers on client_galleries and partners tables

  ### Client Name Generation
  - `generate_client_name()` - Combines bride and groom names
  - Trigger automatically populates client_name field

  ## Row Level Security

  ### Service Role (Admin Access)
  - Full access to all tables (SELECT, INSERT, UPDATE, DELETE)
  - Bypasses all RLS restrictions for administrative operations

  ### Anonymous Users (Public Access)
  - **client_galleries**: Read only active, non-expired galleries
  - **client_images**: Read images from active galleries only
  - **client_gallery_favorites**: Manage favorites in active galleries
  - **client_gallery_analytics**: Insert only (for tracking)
  - **client_gallery_downloads**: Insert only (for tracking)
  - **galleries**: Read all public portfolio galleries
  - **partners**: Read active partners only
  - **partnership_inquiries**: Insert only (submit applications)
  - **contacts**: Insert only (submit contact forms)

  ## Security Notes
  1. All tables have RLS enabled by default
  2. Analytics and download data is write-only for anonymous users
  3. Client galleries are only visible when active and not expired
  4. Service role key required for all admin operations
  5. Foreign key constraints ensure data integrity
*/

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Client Galleries (Main Table)
CREATE TABLE IF NOT EXISTS client_galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  client_email text NOT NULL,
  client_name text,
  bride_name text NOT NULL,
  groom_name text NOT NULL,
  wedding_date date,
  gallery_slug text UNIQUE NOT NULL,
  access_password text NOT NULL,
  access_code text UNIQUE,
  cover_image text,
  images text[] DEFAULT '{}',
  expiration_date timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived', 'draft')),
  last_accessed_at timestamptz,
  view_count integer DEFAULT 0,
  allow_downloads boolean DEFAULT true,
  welcome_message text,
  admin_notes text
);

-- Client Images (Individual Gallery Images)
CREATE TABLE IF NOT EXISTS client_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  gallery_id uuid NOT NULL REFERENCES client_galleries(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  title text,
  order_index integer DEFAULT 0
);

-- Client Gallery Analytics (View Tracking)
CREATE TABLE IF NOT EXISTS client_gallery_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES client_galleries(id) ON DELETE CASCADE,
  client_email text,
  viewed_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  session_duration integer DEFAULT 0
);

-- Client Gallery Downloads (Download Tracking)
CREATE TABLE IF NOT EXISTS client_gallery_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES client_galleries(id) ON DELETE CASCADE,
  image_public_id text,
  downloaded_at timestamptz DEFAULT now() NOT NULL,
  download_type text CHECK (download_type IN ('single', 'zip_all', 'zip_favorites')),
  client_email text,
  image_count integer DEFAULT 1
);

-- Client Gallery Favorites (Client Selections)
CREATE TABLE IF NOT EXISTS client_gallery_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid NOT NULL REFERENCES client_galleries(id) ON DELETE CASCADE,
  image_public_id text NOT NULL,
  favorited_at timestamptz DEFAULT now() NOT NULL,
  client_email text,
  UNIQUE(gallery_id, image_public_id, client_email)
);

-- Portfolio Galleries (Public Display)
CREATE TABLE IF NOT EXISTS galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  title text NOT NULL,
  subtitle text,
  event_date date,
  cover_image text,
  images text[] DEFAULT '{}'
);

-- Partners (Vendor/Venue Directory)
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  logo_url text,
  website text,
  email text,
  phone text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Partnership Inquiries (Application Requests)
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text NOT NULL,
  company_category text NOT NULL,
  website text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text
);

-- Contacts (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_client_galleries_email ON client_galleries(client_email);
CREATE INDEX IF NOT EXISTS idx_client_galleries_slug ON client_galleries(gallery_slug);
CREATE INDEX IF NOT EXISTS idx_client_galleries_code ON client_galleries(access_code);
CREATE INDEX IF NOT EXISTS idx_client_galleries_status ON client_galleries(status);
CREATE INDEX IF NOT EXISTS idx_client_galleries_expiration ON client_galleries(expiration_date);
CREATE INDEX IF NOT EXISTS idx_client_images_gallery ON client_images(gallery_id);
CREATE INDEX IF NOT EXISTS idx_client_analytics_gallery ON client_gallery_analytics(gallery_id);
CREATE INDEX IF NOT EXISTS idx_client_downloads_gallery ON client_gallery_downloads(gallery_id);
CREATE INDEX IF NOT EXISTS idx_client_favorites_gallery ON client_gallery_favorites(gallery_id);

-- =====================================================
-- 3. CREATE FUNCTIONS
-- =====================================================

-- Function: Generate random 8-character access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Set unique access code before insert
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate client name from bride and groom names
CREATE OR REPLACE FUNCTION generate_client_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_name IS NULL THEN
    NEW.client_name := NEW.bride_name || ' & ' || NEW.groom_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Trigger: Auto-generate access code for new galleries
DROP TRIGGER IF EXISTS ensure_access_code ON client_galleries;
CREATE TRIGGER ensure_access_code
  BEFORE INSERT ON client_galleries
  FOR EACH ROW
  EXECUTE FUNCTION set_access_code();

-- Trigger: Auto-update updated_at for client_galleries
DROP TRIGGER IF EXISTS update_client_galleries_updated_at ON client_galleries;
CREATE TRIGGER update_client_galleries_updated_at
  BEFORE UPDATE ON client_galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for partners
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-generate client_name
DROP TRIGGER IF EXISTS generate_client_name_trigger ON client_galleries;
CREATE TRIGGER generate_client_name_trigger
  BEFORE INSERT ON client_galleries
  FOR EACH ROW
  EXECUTE FUNCTION generate_client_name();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE client_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_gallery_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_gallery_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES - SERVICE ROLE (ADMIN)
-- =====================================================

-- Service role has full access to all tables
CREATE POLICY "Service role full access client_galleries"
  ON client_galleries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access client_images"
  ON client_images FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access analytics"
  ON client_gallery_analytics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access downloads"
  ON client_gallery_downloads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access favorites"
  ON client_gallery_favorites FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access galleries"
  ON galleries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access partners"
  ON partners FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access inquiries"
  ON partnership_inquiries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access contacts"
  ON contacts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. CREATE RLS POLICIES - ANONYMOUS USERS (PUBLIC)
-- =====================================================

-- Client Galleries: Read only active, non-expired galleries
CREATE POLICY "Anon read active client_galleries"
  ON client_galleries FOR SELECT
  TO anon
  USING (
    status = 'active' 
    AND (expiration_date IS NULL OR expiration_date > now())
  );

-- Client Images: Read images from active galleries
CREATE POLICY "Anon read client_images"
  ON client_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM client_galleries
      WHERE client_galleries.id = client_images.gallery_id
      AND client_galleries.status = 'active'
      AND (client_galleries.expiration_date IS NULL OR client_galleries.expiration_date > now())
    )
  );

-- Analytics: Insert only for tracking views
CREATE POLICY "Anon insert analytics"
  ON client_gallery_analytics FOR INSERT
  TO anon
  WITH CHECK (true);

-- Downloads: Insert only for tracking downloads
CREATE POLICY "Anon insert downloads"
  ON client_gallery_downloads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Favorites: Full access for active galleries
CREATE POLICY "Anon read favorites"
  ON client_gallery_favorites FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM client_galleries
      WHERE client_galleries.id = client_gallery_favorites.gallery_id
      AND client_galleries.status = 'active'
    )
  );

CREATE POLICY "Anon insert favorites"
  ON client_gallery_favorites FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_galleries
      WHERE client_galleries.id = gallery_id
      AND client_galleries.status = 'active'
    )
  );

CREATE POLICY "Anon delete favorites"
  ON client_gallery_favorites FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM client_galleries
      WHERE client_galleries.id = client_gallery_favorites.gallery_id
      AND client_galleries.status = 'active'
    )
  );

-- Galleries: Read all public portfolio galleries
CREATE POLICY "Anon read galleries"
  ON galleries FOR SELECT
  TO anon
  USING (true);

-- Partners: Read active partners only
CREATE POLICY "Anon read active partners"
  ON partners FOR SELECT
  TO anon
  USING (is_active = true);

-- Partnership Inquiries: Insert only
CREATE POLICY "Anon insert inquiries"
  ON partnership_inquiries FOR INSERT
  TO anon
  WITH CHECK (true);

-- Contacts: Insert only
CREATE POLICY "Anon insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);