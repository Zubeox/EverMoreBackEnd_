import { Router, Request, Response } from 'express';
import { supabaseClient } from '../lib/supabaseClient';
import type { Gallery } from '../types';

const router = Router();

// Get all galleries (admin access)
router.get('/admin/galleries', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('galleries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new gallery (admin access)
router.post('/admin/galleries', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('galleries')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update gallery (admin access)
router.patch('/admin/galleries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseClient
      .from('galleries')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Gallery not found' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Error updating gallery:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete gallery (admin access)
router.delete('/admin/galleries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseClient
      .from('galleries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;