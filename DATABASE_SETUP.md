# Database Setup Guide

This guide explains how to set up the complete database schema for your photography gallery application.

## Required Environment Variables

Add the following to your `.env` file:

```env
VITE_SUPABASE_URL=https://kkkdvshjcxicupptpixs.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # ⚠️ REQUIRED - Get this from Supabase Dashboard
```

### Getting Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **service_role key** (NOT the anon key)
5. Add it to your `.env` file as `VITE_SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: The service role key bypasses Row Level Security and should NEVER be exposed to the client. Only use it in server-side operations.

## Database Schema

The application requires the following tables to function properly:

### 1. Client Galleries Tables

#### `client_galleries`
Main table for storing wedding galleries shared with clients.

**Columns:**
- `id` (uuid) - Primary key
- `created_at` (timestamptz) - Auto-generated
- `updated_at` (timestamptz) - Auto-updated on changes
- `client_email` (text) - Client's email address
- `client_name` (text) - Generated from bride & groom names
- `bride_name` (text) - Bride's name
- `groom_name` (text) - Groom's name
- `wedding_date` (date) - Wedding date
- `gallery_slug` (text, unique) - URL-friendly identifier
- `access_password` (text) - Gallery password
- `access_code` (text, unique) - Auto-generated 8-char code
- `cover_image` (text) - Cloudinary public_id for cover
- `images` (text[]) - Array of Cloudinary public_ids
- `expiration_date` (timestamptz) - When gallery access expires
- `status` (text) - 'active', 'expired', 'archived', or 'draft'
- `last_accessed_at` (timestamptz) - Last view timestamp
- `view_count` (integer) - Number of views
- `allow_downloads` (boolean) - Download permission
- `welcome_message` (text) - Custom message for clients
- `admin_notes` (text) - Internal notes

**Features:**
- Access code auto-generated via database trigger
- Updated_at timestamp auto-maintained
- Indexed on email, slug, code, status, expiration

#### `client_images`
Individual images within client galleries.

**Columns:**
- `id` (uuid) - Primary key
- `created_at` (timestamptz) - Auto-generated
- `gallery_id` (uuid) - Foreign key to client_galleries
- `image_url` (text) - Full Cloudinary URL
- `thumbnail_url` (text) - Optimized thumbnail URL
- `title` (text) - Image title
- `order_index` (integer) - Sort order

#### `client_gallery_analytics`
Tracks gallery views for analytics.

**Columns:**
- `id` (uuid) - Primary key
- `gallery_id` (uuid) - Foreign key to client_galleries
- `client_email` (text) - Viewer email
- `viewed_at` (timestamptz) - View timestamp
- `ip_address` (text) - Viewer IP
- `user_agent` (text) - Browser info
- `session_duration` (integer) - Time spent in seconds

#### `client_gallery_downloads`
Tracks image downloads.

**Columns:**
- `id` (uuid) - Primary key
- `gallery_id` (uuid) - Foreign key to client_galleries
- `image_public_id` (text) - Downloaded image ID
- `downloaded_at` (timestamptz) - Download timestamp
- `download_type` (text) - 'single', 'zip_all', or 'zip_favorites'
- `client_email` (text) - Downloader email
- `image_count` (integer) - Number of images downloaded

#### `client_gallery_favorites`
Client favorite/selected images.

**Columns:**
- `id` (uuid) - Primary key
- `gallery_id` (uuid) - Foreign key to client_galleries
- `image_public_id` (text) - Favorited image ID
- `favorited_at` (timestamptz) - Favorite timestamp
- `client_email` (text) - Client email
- Unique constraint on (gallery_id, image_public_id, client_email)

### 2. Admin Portfolio Tables

#### `galleries`
Portfolio galleries displayed on your website.

**Columns:**
- `id` (uuid) - Primary key
- `created_at` (timestamptz) - Auto-generated
- `title` (text) - Gallery title
- `subtitle` (text) - Gallery subtitle
- `event_date` (date) - Event date
- `cover_image` (text) - Cloudinary public_id
- `images` (text[]) - Array of Cloudinary public_ids

#### `partners`
Partnership directory for venues, vendors, etc.

**Columns:**
- `id` (uuid) - Primary key
- `created_at`, `updated_at` (timestamptz)
- `name` (text) - Partner name
- `category` (text) - Type of partner
- `description` (text) - Partner description
- `logo_url` (text) - Partner logo
- `website`, `email`, `phone` (text) - Contact info
- `featured` (boolean) - Featured status
- `display_order` (integer) - Sort order
- `is_active` (boolean) - Active status

#### `partnership_inquiries`
Partnership requests from potential partners.

**Columns:**
- `id` (uuid) - Primary key
- `created_at` (timestamptz)
- `name`, `email`, `phone` (text) - Contact info
- `company_name` (text) - Company name
- `company_category` (text) - Business type
- `website` (text) - Company website
- `message` (text) - Inquiry message
- `status` (text) - 'pending', 'approved', or 'rejected'
- `notes` (text) - Admin notes

#### `contacts`
Contact form submissions.

**Columns:**
- `id` (uuid) - Primary key
- `created_at` (timestamptz)
- `name`, `email`, `phone` (text) - Contact info
- `message` (text) - Message content

## Database Functions & Triggers

### Access Code Auto-Generation
The database automatically generates unique 8-character access codes for new galleries using:
- `generate_access_code()` function - Creates random code
- `set_access_code()` trigger function - Ensures uniqueness
- `ensure_access_code` trigger - Fires before insert

### Auto-Update Timestamps
The `updated_at` field is automatically maintained for:
- `client_galleries` table
- `partners` table

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Service Role
- Full access to all tables (INSERT, SELECT, UPDATE, DELETE)

### Anonymous Users (anon)
- **client_galleries**: Can read active, non-expired galleries
- **client_images**: Can read images from active galleries
- **client_gallery_favorites**: Can manage favorites in active galleries
- **galleries**: Can read all
- **partners**: Can read active partners only
- **partnership_inquiries**: Can insert only
- **contacts**: Can insert only
- **analytics/downloads**: No access (service role only)

## Running the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/00001_create_complete_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After running the migration, verify the setup:

1. Check tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

2. Test access code generation by inserting a gallery:
```sql
INSERT INTO client_galleries (
  client_email, bride_name, groom_name,
  gallery_slug, access_password, expiration_date
) VALUES (
  'test@example.com', 'Jane', 'John',
  'jane-john-test', 'testpass123', now() + interval '90 days'
) RETURNING access_code;
```

The `access_code` should be automatically populated.

## Troubleshooting

### Error: "Missing VITE_SUPABASE_SERVICE_ROLE_KEY"
- Ensure you've added the service role key to your `.env` file
- Restart your development server after adding

### Error: "relation does not exist"
- Run the migration SQL file in your Supabase dashboard
- Check that all tables were created successfully

### Error: "permission denied"
- Verify RLS policies are correctly set up
- Ensure you're using the service role key for admin operations

### Gallery Save Fails
- Check browser console for specific error messages
- Verify the `client_name` field is being generated
- Ensure the `access_code` trigger is properly set up
- Check that all required fields are populated

## Security Best Practices

1. **Never expose service role key**: Keep it server-side only
2. **Use anon key for client**: Frontend should use VITE_SUPABASE_ANON_KEY
3. **Validate inputs**: Always validate data before database operations
4. **Regular audits**: Review RLS policies periodically
5. **Monitor access**: Use analytics table to track usage patterns

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the migration ran successfully without errors
