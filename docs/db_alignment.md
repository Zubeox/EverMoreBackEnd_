# Database Alignment Documentation

## Migration Consolidation

### What Moved
- **Frontend migration** `EverMoreFrontEnd_/supabase/migrations/20251002_remove_access_password.sql` → **Backend** `backend/migrations/0002_db_align.sql`

### Why Moved
- Database migrations should be centralized in the backend repository for consistency
- The frontend should not contain schema modifications
- Ensures single source of truth for database structure

### Changes Applied
1. **Removed `access_password` column** from `client_galleries` table
2. **Updated authentication flow** to use only `access_code`
3. **Aligned TypeScript types** between frontend and backend
4. **Updated UI components** to remove password references

### Authentication Simplification
- **Before**: Two credential types (password + access_code)
- **After**: Single credential type (access_code only)
- **Methods**: 
  - Direct link: `gallery_slug` + `access_code`
  - Email access: `client_email` + `access_code`

### Type Alignment
- Removed `access_password` from `ClientGallery` interface
- Made `Gallery.subtitle` optional to match frontend usage
- Ensured consistent field types between frontend and backend