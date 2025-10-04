require('dotenv').config();

const analyticsRouter = require('./routes/analytics.ts').default;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const emailRoutes = require('./routes/email.cjs');

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!ADMIN_TOKEN) {
  console.warn('⚠️  Warning: ADMIN_TOKEN not set. Using default token.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  })
);

app.use(bodyParser.json());

app.use('/api/email', emailRoutes);

app.use('/api/client/analytics', analyticsRouter);

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!ADMIN_TOKEN)
    return res.status(403).json({ error: 'ADMIN_TOKEN not configured on server' });
  if (!token || token !== ADMIN_TOKEN)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

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

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: !!(SUPABASE_URL && SUPABASE_SERVICE_KEY),
    email: !!process.env.RESEND_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
  console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? 'Enabled' : 'Disabled (set RESEND_API_KEY to enable)'}`);
  console.log(`🗄️  Database: ${SUPABASE_URL ? 'Connected' : 'Not configured'}`);
});
