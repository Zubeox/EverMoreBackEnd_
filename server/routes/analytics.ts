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

    // Validate required fields
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
        ip_address: req.ip
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating analytics session:', error);
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
    console.error('Error updating analytics session:', error);
    res.status(500).json({ error: 'Failed to update analytics session' });
  }
});

// Get analytics for a gallery
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
    console.error('Error fetching gallery analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;