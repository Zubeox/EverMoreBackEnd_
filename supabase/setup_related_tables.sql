-- Enable RLS on related tables
ALTER TABLE IF EXISTS public.client_gallery_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_gallery_favorites ENABLE ROW LEVEL SECURITY;

-- Grant permissions to related tables
GRANT SELECT ON public.client_gallery_analytics TO anon;
GRANT SELECT ON public.client_gallery_downloads TO anon;
GRANT SELECT ON public.client_gallery_favorites TO anon;

-- Create policies for analytics
CREATE POLICY "Allow read analytics"
ON public.client_gallery_analytics
FOR SELECT
USING (true);

-- Create policies for downloads
CREATE POLICY "Allow read downloads"
ON public.client_gallery_downloads
FOR SELECT
USING (true);

-- Create policies for favorites
CREATE POLICY "Allow read favorites"
ON public.client_gallery_favorites
FOR SELECT
USING (true);