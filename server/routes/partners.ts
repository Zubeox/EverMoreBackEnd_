import express from 'express';
import { supabase } from '../../src/lib/supabase';
import type { Partner } from '../../src/types';

const router = express.Router();

// Get all active partners
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Get featured partners
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching featured partners:', error);
    res.status(500).json({ error: 'Failed to fetch featured partners' });
  }
});

// Get partners by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('display_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching partners by category:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

// Submit partnership inquiry
router.post('/inquiries', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company_name,
      company_category,
      website,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !company_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('partnership_inquiries')
      .insert({
        name,
        email,
        phone,
        company_name,
        company_category,
        website,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error submitting partnership inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

export default router;