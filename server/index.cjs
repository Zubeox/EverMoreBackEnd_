require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const emailRoutes = require('./routes/email.cjs');

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_TOKEN =
  process.env.ADMIN_TOKEN || process.env.SUPABASE_ADMIN_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!ADMIN_TOKEN) {
  console.warn(
    '⚠️  Warning: ADMIN_TOKEN not set. Admin endpoints will require X-Admin-Token header to match this value.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  headers: { 'bypass-rls': 'true' }
});

const app = express();

// Enable CORS for the frontend origin
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  })
);

app.use(bodyParser.json());

// Use email routes
app.use('/api/email', emailRoutes);

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!ADMIN_TOKEN)
    return res.status(403).json({ error: 'ADMIN_TOKEN not configured on server' });
  if (!token || token !== ADMIN_TOKEN)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Public read endpoint (optional proxy) - returns gallery list
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

// Admin routes - protected by ADMIN token
app.post('/api/admin/galleries', requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('galleries').insert(payload).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.patch('/api/admin/galleries/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase.from('galleries').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/admin/galleries/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('galleries').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Contacts admin endpoints
app.get('/api/admin/contacts', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.delete('/api/admin/contacts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// Client galleries admin endpoints
app.post('/api/admin/client_galleries', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('client_galleries').insert(req.body).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.patch('/api/admin/client_galleries/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('client_galleries').update(req.body).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.delete('/api/admin/client_galleries/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('client_galleries').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// Client images admin endpoints
app.post('/api/admin/client_images', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('client_images').insert(req.body).select();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.post('/api/admin/client_images/reorder', requireAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });
    const results = [];
    for (const item of order) {
      const { id, order_index } = item;
      const r = await supabase.from('client_images').update({ order_index }).eq('id', id);
      results.push(r);
    }
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.patch('/api/admin/client_images/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('client_images').update(req.body).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.delete('/api/admin/client_images/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('client_images').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// -----------------------------------------------------------------------------
// Public client endpoints (these run server-side using the service-role key)
// -----------------------------------------------------------------------------

app.post('/api/client/favorites', async (req, res) => {
  try {
    const { gallery_id, client_email, image_public_id } = req.body || {};
    if (!gallery_id || !client_email || !image_public_id) return res.status(400).json({ error: 'Missing fields' });
    const { data: gallery } = await supabase.from('client_galleries').select('id,status').eq('id', gallery_id).maybeSingle();
    if (!gallery || gallery.status !== 'active') return res.status(400).json({ error: 'Invalid or inactive gallery' });
    const { data, error } = await supabase.from('client_gallery_favorites').insert({ gallery_id, client_email, image_public_id }).select().single();
    if (error) return res.status(500).json({ error });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.post('/api/client/favorites/delete', async (req, res) => {
  try {
    const { gallery_id, client_email, image_public_id } = req.body || {};
    if (!gallery_id || !client_email || !image_public_id) return res.status(400).json({ error: 'Missing fields' });
    const { data, error } = await supabase.from('client_gallery_favorites').delete().match({ gallery_id, client_email, image_public_id });
    if (error) return res.status(500).json({ error });
    res.json({ success: true, deleted: data?.length ?? 0 });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.post('/api/client/downloads', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.gallery_id || !payload.client_email) return res.status(400).json({ error: 'Missing fields' });
    const { data, error } = await supabase.from('client_gallery_downloads').insert(payload).select().single();
    if (error) return res.status(500).json({ error });
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.post('/api/client/analytics', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.gallery_id || !payload.client_email) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Whitelist only the columns that exist in your Supabase table
    const row = {
      gallery_id: payload.gallery_id,
      client_email: payload.client_email,
      session_start: payload.session_start || new Date().toISOString(),
      user_agent: payload.user_agent || null,
      images_viewed: typeof payload.images_viewed === 'number' ? payload.images_viewed : 0,
    };

    const { data, error } = await supabase
      .from('client_gallery_analytics')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Analytics insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.patch('/api/client/analytics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data, error } = await supabase.from('client_gallery_analytics').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.post('/api/client/galleries/:id/increment_view', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data: current, error: fetchError } = await supabase.from('client_galleries').select('view_count').eq('id', id).maybeSingle();
    if (fetchError) return res.status(500).json({ error: fetchError });
    const currentCount = (current && current.view_count) ? Number(current.view_count) : 0;
    const { data, error } = await supabase.from('client_galleries').update({ view_count: currentCount + 1 }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// Partners admin endpoints
app.post('/api/admin/partners', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('partners').insert(req.body).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.patch('/api/admin/partners/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('partners').update(req.body).eq('id', id).select().single();
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.delete('/api/admin/partners/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) return res.status(500).json({ error });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.listen(PORT, () => {
  console.log(`✅ Admin server listening on http://localhost:${PORT}`);
});