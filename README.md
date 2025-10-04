# EverMore Photography - Admin Panel

Complete admin backend system for managing photography galleries, client galleries, partners, and contacts.

## 🎉 Status: Ready to Use!

All critical errors have been fixed and the application is fully integrated with the Bolt Supabase database.

## 🚀 Quick Start

### Start the application (2 terminals):

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

Then open: http://localhost:5173

### First Time Setup:

1. Create an admin user in Supabase Dashboard → Authentication → Users
2. Use those credentials to log into the admin panel
3. Start managing galleries, clients, and partners!

For detailed instructions, see [QUICKSTART.md](./QUICKSTART.md)

## ✅ What's Working

- Admin authentication
- Gallery management (portfolio)
- Client gallery management (wedding galleries)
- Image upload to Cloudinary
- Partner management
- Contact form submissions
- Access code generation
- View and download tracking
- Build process (production ready)

## 📁 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](./SETUP.md)** - Complete setup guide with all details
- **[CHANGES.md](./CHANGES.md)** - Full list of all changes and fixes

## 🔧 Configuration

All environment variables are in `.env`:
- ✅ Supabase credentials (configured)
- ✅ Cloudinary credentials (configured)
- ✅ Backend URL (configured)
- ✅ Admin token (configured)
- ⚠️ Resend API key (optional - for emails)

## 🗄️ Database

Using Bolt Supabase with 8 tables:
- `client_galleries` - Client wedding galleries
- `client_images` - Gallery images
- `galleries` - Portfolio galleries
- `partners` - Partnership directory
- `partnership_inquiries` - Partnership requests
- `contacts` - Contact submissions
- `client_gallery_analytics` - View tracking
- `client_gallery_downloads` - Download tracking
- `client_gallery_favorites` - Favorite images

## 🛠️ Technology Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Supabase (Bolt instance)
- **Images:** Cloudinary
- **Email:** Resend (optional)

## 📝 Scripts

```bash
npm run dev        # Start frontend dev server
npm run server     # Start backend API server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

## 🐛 Troubleshooting

See [QUICKSTART.md](./QUICKSTART.md) for common issues and solutions.

## 📦 Project Structure

```
├── src/                  # Frontend React application
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── lib/              # Configurations
│   └── types/            # TypeScript definitions
├── server/               # Backend Express server
│   ├── routes/           # API routes
│   └── index.cjs         # Server entry point
├── supabase/             # Database migrations
└── dist/                 # Production build
```

## 🎯 Next Steps

1. Start both servers
2. Create your admin user
3. Log in to the admin panel
4. Start managing your photography business!

---

**Need help?** Check [QUICKSTART.md](./QUICKSTART.md) or [SETUP.md](./SETUP.md)
