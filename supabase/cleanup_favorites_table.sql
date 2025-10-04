-- Clean up client_gallery_favorites table structure
BEGIN;

-- First, let's back up the existing data (just in case)
CREATE TABLE IF NOT EXISTS client_gallery_favorites_backup AS 
SELECT DISTINCT ON (gallery_id, image_public_id, client_email) *
FROM client_gallery_favorites;

-- Drop the old table
DROP TABLE IF EXISTS client_gallery_favorites;

-- Recreate the table with the correct structure
CREATE TABLE client_gallery_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    image_public_id TEXT NOT NULL,
    client_email TEXT NOT NULL,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT unique_favorite UNIQUE (gallery_id, image_public_id, client_email)
);

-- Restore the data
INSERT INTO client_gallery_favorites (id, gallery_id, image_public_id, client_email, favorited_at)
SELECT id, gallery_id, image_public_id, client_email, favorited_at
FROM client_gallery_favorites_backup;

-- Drop the backup table
DROP TABLE client_gallery_favorites_backup;

-- Add indexes for better performance
CREATE INDEX idx_gallery_favorites_gallery_id ON client_gallery_favorites(gallery_id);
CREATE INDEX idx_gallery_favorites_client_email ON client_gallery_favorites(client_email);

-- Update RLS policies
ALTER TABLE client_gallery_favorites ENABLE ROW LEVEL SECURITY;

-- Public can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON client_gallery_favorites FOR SELECT
TO public
USING (client_email = current_user_email());

-- Service role has full access
CREATE POLICY "Service role has full access to favorites"
ON client_gallery_favorites FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMIT;