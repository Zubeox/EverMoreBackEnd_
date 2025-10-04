# Quick Start Guide

## ✅ What's Been Fixed

1. **Resend Import Error** - Removed client-side Resend imports that were causing the console error
2. **Environment Variables** - Added all required Cloudinary and Supabase credentials
3. **Database Schema** - Verified all tables exist in Bolt Supabase
4. **Type Definitions** - Updated TypeScript types to match database schema
5. **Backend Server** - Configured and ready to handle email and API requests
6. **Build Process** - Project builds successfully without errors

## 🚀 Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:
```bash
npm run server
```

You should see:
```
✅ Backend server listening on http://localhost:4000
📧 Email service: Disabled (set RESEND_API_KEY to enable)
🗄️  Database: Connected
```

### Step 2: Start the Frontend Dev Server

Open a **second terminal** and run:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 3: Access the Admin Panel

Open your browser and go to:
```
http://localhost:5173
```

## 🔐 Logging In

You need to create an admin user in Supabase Auth:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **"Add User"** (via email)
5. Enter an email and password
6. Confirm the user
7. Use these credentials to log into the admin panel

## ✅ What Works

- ✅ Admin authentication
- ✅ Gallery management (portfolio galleries)
- ✅ Client gallery management (wedding galleries)
- ✅ Image upload to Cloudinary
- ✅ Partner management
- ✅ Contact management
- ✅ Database operations through Supabase
- ✅ Access code generation for client galleries
- ✅ View tracking and analytics

## ⚠️ Optional: Enable Email Notifications

To enable email notifications:

1. Get a Resend API key from: https://resend.com/api-keys
2. Add it to your `.env` file:
   ```
   RESEND_API_KEY=your_api_key_here
   ```
3. Restart the backend server (`npm run server`)

## 🐛 Troubleshooting

### Frontend not loading?
- Make sure both servers are running (frontend + backend)
- Check browser console for errors
- Verify `.env` file has all required variables

### "Unauthorized" errors?
- Create an admin user in Supabase Auth (see "Logging In" above)
- Make sure you're using the correct email/password

### Email not sending?
- This is expected if `RESEND_API_KEY` is not set
- The app will work fine without email functionality
- To enable: add your Resend API key to `.env`

### Database connection issues?
- Check Supabase dashboard for service status
- Verify environment variables in `.env`
- Test backend health: `curl http://localhost:4000/health`

## 📁 Project Structure

```
Frontend: http://localhost:5173  (React admin dashboard)
Backend:  http://localhost:4000  (Express API server)
Database: Bolt Supabase          (All tables ready)
Images:   Cloudinary             (Configured and ready)
```

## 🎉 You're All Set!

The project is now fully integrated with the Bolt database and ready to use. All the critical errors have been fixed:

- ✅ No more Resend import errors
- ✅ Cloudinary configured
- ✅ Database schema applied
- ✅ All types updated
- ✅ Backend server configured
- ✅ Build process working

For more details, see `SETUP.md`.
