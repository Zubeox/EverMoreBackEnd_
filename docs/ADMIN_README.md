Admin endpoints and service-role usage

Purpose: Keep service-role (admin) keys strictly on the backend. Do NOT expose them to frontend builds.

Suggested pattern

- Use the existing backend project `EverMoreBackEnd_`.
- Create server-side endpoints (API) that perform privileged operations using the service role client in `src/lib/supabase.ts`.
- Validate and authenticate incoming requests to those endpoints (session/cookie, JWT, or an admin token).

Example (pseudo-code)

// EverMoreBackEnd_/src/routes/admin/galleries.ts
import express from 'express';
import { supabase as supabaseAdmin } from '../../lib/supabase';

const router = express.Router();

router.post('/create', async (req, res) => {
  // Authenticate requester here
  try {
    const { data, error } = await supabaseAdmin
      .from('galleries')
      .insert(req.body)
      .select()
      .single();

    if (error) return res.status(500).json({ error });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

export default router;

Frontend call

fetch('/api/admin/galleries/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(galleryData)
});

Security
- Protect admin routes (session-based auth or a server-side token).
- Limit fields returned to the frontend.
- Log admin operations.
