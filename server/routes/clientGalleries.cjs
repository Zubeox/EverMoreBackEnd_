const express = require('express');
const { supabase } = require('../lib/supabaseClient'); // Assume this exists or adjust

const router = express.Router();

router.post('/access', async (req, res) => {
  const { email, access_code } = req.body;

  try {
    const { data, error } = await supabase
      .from('client_galleries')
      .select('*') // Or specific fields like id, slug, bride_name, groom_name, images
      .eq('email', email.toLowerCase())
      .eq('access_code', access_code)
      .single(); // Expect one match

    if (error) throw error;
    if (!data) {
      return res.status(401).json({ success: false, message: 'Invalid email or access code' });
    }

    res.json({ success: true, gallery: data });
  } catch (err) {
    console.error('Access error:', err);
    res.status(500).json({ success: false, message: 'Server error - try again later' });
  }
});

// ... existing routes ...

module.exports = router;