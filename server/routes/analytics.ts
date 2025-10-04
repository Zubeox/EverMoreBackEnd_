import express from 'express';
import { supabase } from '../../src/lib/supabase';
import type { GalleryAnalytics } from '../../src/types';

const router = express.Router();

// Create analytics session
router.post('/', async (req, res) => {
  try {
    const {
      gallery_id,
      client_email,
      session_start,
      user_agent,
      images_viewed
    } = req.body;

    if (!gallery_id || !client_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('client_gallery_analytics')
      .insert({
        gallery_id,
        client_email,
        session_start,
        user_agent,
        images_viewed: images_viewed || 0,
        ip_address: req.headers['x-forwarded-for'] || req.ip
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[POST] /api/client/analytics →', error);
    res.status(500).json({ error: 'Failed to create analytics session' });
  }
});

// Update analytics session
router.patch('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates: Partial<GalleryAnalytics> = req.body;

    const { error } = await supabase
      .from('client_gallery_analytics')
      .update({
        ...updates,
        session_end: updates.session_end || new Date().toISOString(),
        session_duration_seconds: updates.session_duration_seconds
      })
      .eq('id', sessionId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('[PATCH] /api/client/analytics/:id →', error);
    res.status(500).json({ error: 'Failed to update analytics session' });
  }
});

// Get analytics for a specific gallery
router.get('/gallery/:galleryId', async (req, res) => {
  try {
    const { galleryId } = req.params;

    const { data, error } = await supabase
      .from('client_gallery_analytics')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('session_start', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('[GET] /api/client/analytics/gallery/:galleryId →', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;