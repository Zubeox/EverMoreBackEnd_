import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const authSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are not set.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    const validationResult = authSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ message: 'Invalid request body', issues: validationResult.error.issues }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { email, code } = validationResult.data;

    const { data: gallery, error } = await supabase
      .from('client_galleries')
      .select('*')
      .eq('client_email', email.toLowerCase())
      .eq('access_code', code)
      .single();

    if (error || !gallery) {
      return new Response(
        JSON.stringify({ message: 'Invalid credentials or gallery not found' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (new Date(gallery.expiration_date) < new Date()) {
      return new Response(
        JSON.stringify({ message: 'Gallery has expired' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24); // 24-hour session

    const session = {
      gallery_id: gallery.id,
      gallery_slug: gallery.gallery_slug,
      client_email: gallery.client_email,
      code: gallery.access_code,
      accessed_at: new Date().toISOString(),
      expires_at: expiration.toISOString(),
    };

    // Asynchronously update view count and last accessed time
    supabase
      .from('client_galleries')
      .update({
        view_count: (gallery.view_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', gallery.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          console.error('Failed to update gallery stats:', updateError);
        }
      });

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});