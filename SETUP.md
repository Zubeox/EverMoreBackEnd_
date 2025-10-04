# EverMore Photography Admin Panel - Setup Guide

## Overview

This is the admin backend for the EverMore Photography website. It includes:
- Admin dashboard for managing galleries, client galleries, partners, and contacts
- Image upload and management with Cloudinary
- Client gallery management with access codes and expiration dates
- Email notifications for gallery credentials (via Resend)
- Full integration with Bolt Supabase database

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Bolt Supabase database (already configured)
- Cloudinary account (already configured)
- Resend API key (optional, for email notifications)

## Environment Variables

All environment variables are configured in the `.env` file:

```env
# Supabase Configuration (✅ Configured)
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Cloudinary Configuration (✅ Configured)
VITE_CLOUDINARY_CLOUD_NAME=djrsrxkls
VITE_CLOUDINARY_UPLOAD_PRESET=EverMoreWeddings
VITE_CLOUDINARY_API_KEY=573376975426295

# Backend Server Configuration (✅ Configured)
VITE_BACKEND_URL=http://localhost:4000
ADMIN_TOKEN=evermore-photography-admin-2024

# Email Service (⚠️ Optional - Set your Resend API key to enable)
RESEND_API_KEY=
```

## Database Setup

The database schema is already applied to your Bolt Supabase instance. All tables are ready:

✅ **Client Gallery Tables:**
- `client_galleries` - Wedding galleries for clients
- `client_images` - Individual images within galleries
- `client_gallery_analytics` - View tracking
- `client_gallery_downloads` - Download tracking
- `client_gallery_favorites` - Favorite image selections

✅ **Admin Portfolio Tables:**
- `galleries` - Public portfolio galleries
- `partners` - Partnership directory
- `partnership_inquiries` - Partnership requests
- `contacts` - Contact form submissions

## Installation

1. Install dependencies:
```bash
npm install
```

2. Verify environment variables:
```bash
cat .env
```

3. Build the project to verify everything works:
```bash
npm run build
```

## Running the Application

### Development Mode

You need to run TWO servers:

**Terminal 1 - Frontend Dev Server:**
```bash
npm run dev
```
This starts the Vite development server at `http://localhost:5173`

**Terminal 2 - Backend API Server:**
```bash
npm run server
```
This starts the Express backend server at `http://localhost:4000`

### What Each Server Does

1. **Frontend Server (port 5173):**
   - Serves the React admin dashboard
   - Handles routing and UI components
   - Connects directly to Supabase for database operations
   - Makes HTTP requests to backend server for email functionality

2. **Backend Server (port 4000):**
   - Handles email notifications (Resend integration)
   - Provides admin API endpoints
   - Manages analytics tracking
   - Health check endpoint at `/health`

## Admin Authentication

The admin panel uses Supabase Auth with email/password authentication.

**Creating the First Admin User:**

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User" (via email)
4. Set an email and password
5. Confirm the user
6. Use these credentials to log into the admin panel

Alternatively, use SQL:
```sql
-- This creates a user in Supabase Auth
-- Then log in with the email/password you set
```

## Features

### ✅ Currently Working

- Admin authentication and session management
- Gallery management (create, edit, delete portfolio galleries)
- Client gallery management (wedding galleries with access codes)
- Image upload to Cloudinary
- Database operations through Supabase
- All CRUD operations for partners, contacts, inquiries

### ⚠️ Requires Configuration

- **Email Notifications**: Set `RESEND_API_KEY` in `.env` to enable email sending
  - Get your API key from: https://resend.com/api-keys
  - The app will work without this, but email features will be disabled

## Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── Admin/          # Admin-specific components
│   │   ├── Auth/           # Authentication components
│   │   ├── ClientGallery/  # Client gallery components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Galleries/      # Portfolio gallery components
│   │   ├── ImageGallery/   # Image display components
│   │   ├── ImageUpload/    # Image upload components
│   │   └── Layout/         # Layout components
│   ├── config/             # Configuration files
│   ├── lib/                # Library configurations
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── server/                 # Backend Express server
│   ├── routes/             # API route handlers
│   └── index.cjs           # Server entry point
├── supabase/               # Supabase migrations and functions
│   ├── migrations/         # Database migrations
│   └── functions/          # Supabase Edge Functions
└── .env                    # Environment variables
```

## API Endpoints

### Backend Server (http://localhost:4000)

**Health Check:**
- `GET /health` - Server status and configuration

**Email:**
- `POST /api/email/send-credentials` - Send gallery credentials to client
- `POST /api/email/send-expiration-warning` - Send gallery expiration warning

**Galleries:**
- `GET /api/galleries` - Get all galleries
- `POST /api/admin/galleries` - Create gallery (requires admin token)
- `PATCH /api/admin/galleries/:id` - Update gallery (requires admin token)
- `DELETE /api/admin/galleries/:id` - Delete gallery (requires admin token)

**Client Galleries:**
- `POST /api/admin/client_galleries` - Create client gallery (requires admin token)
- `PATCH /api/admin/client_galleries/:id` - Update client gallery (requires admin token)
- `DELETE /api/admin/client_galleries/:id` - Delete client gallery (requires admin token)

**And more...** (see `server/index.cjs` for full API documentation)

## Troubleshooting

### Error: "Missing API key. Pass it to the constructor `new Resend`"

✅ **FIXED** - This error has been resolved by removing the Resend import from the client-side code.

### Frontend Not Loading

1. Check if Vite dev server is running on port 5173
2. Check browser console for errors
3. Verify Supabase environment variables are set
4. Try clearing browser cache and reloading

### Backend API Errors

1. Check if backend server is running on port 4000
2. Verify `.env` file is in the project root
3. Check server logs for specific errors
4. Test health endpoint: `curl http://localhost:4000/health`

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check Supabase dashboard for service status
3. Test database connection:
```bash
curl http://localhost:4000/api/galleries
```

### Email Not Sending

1. Set `RESEND_API_KEY` in `.env`
2. Restart the backend server
3. Check backend server logs for email errors
4. Verify Resend API key is valid at https://resend.com

## Development Workflow

1. Start both servers (frontend + backend)
2. Make changes to code
3. Frontend hot-reloads automatically
4. Backend requires restart for changes
5. Test changes in browser
6. Build before deploying: `npm run build`

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `dist/` folder to your web host

3. Deploy the backend server:
   - Set environment variables on your hosting platform
   - Run `node server/index.cjs`
   - Ensure port 4000 is accessible

4. Update `VITE_BACKEND_URL` to your production backend URL

## Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Check backend server logs
4. Review Supabase dashboard logs

## License

Private project - All rights reserved
