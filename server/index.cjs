require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const emailRoutes = require('./routes/email.cjs');

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.SUPABASE_ADMIN_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!ADMIN_TOKEN) {
  console.warn('⚠️ ADMIN_TOKEN not set. Admin endpoints will require X-Admin-Token header.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  headers: { 'bypass-rls': 'true' }
});

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health route
app.get('/', (req, res) => {
  res.send('✅ EverMore Admin API is running');
});

// Email routes
app.use('/api/email', emailRoutes);

// Admin auth
function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!ADMIN_TOKEN) return res.status(403).json({ error: 'ADMIN_TOKEN not configured on server' });
  if (!token || token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Example: /api/galleries public list
app.get('/api/galleries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('id, title, subtitle, event_date, cover_image, images')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Admin routes (unchanged except fixes for client_images) ---

app.post('/api/admin/client_images', requireAdmin, async (req, res) => {
  try {
    const images = Array.isArray(req.body) ? req.body : [req.body];
    const { data, error } = await supabase.from('client_images').insert(images).select();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ... keep your other routes identical ...

app.listen(PORT, () => {
  console.log(`🚀 Admin server listening on http://localhost:${PORT}`);
});