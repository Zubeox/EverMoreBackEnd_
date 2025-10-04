-- Rollback changes and restore original structure
BEGIN;

-- Drop the new table if it exists
DROP TABLE IF EXISTS client_gallery_favorites;

-- Create the original table structure
CREATE TABLE client_gallery_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    image_public_id TEXT NOT NULL,
    client_email TEXT NOT NULL,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add base permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON client_gallery_favorites TO service_role;
GRANT SELECT ON client_gallery_favorites TO anon, authenticated;

-- Enable RLS
ALTER TABLE client_gallery_favorites ENABLE ROW LEVEL SECURITY;

-- Add simple RLS policies
CREATE POLICY "Enable read access for all users"
    ON client_gallery_favorites
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable write access for authenticated users only"
    ON client_gallery_favorites
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

COMMIT;