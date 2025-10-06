import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ClientGallery } from '../types';

const SESSION_STORAGE_KEY = 'client_gallery_session';

export interface GallerySession {
  gallery_id: string;
  gallery_slug?: string;
  client_email: string;
  code: string;
  accessed_at: string;
  expires_at: string;
}

/**
 * Authenticate client with email and access code
 */
export async function authenticateClient({
  email,
  slug,
  code,
}: {
  email?: string;
  slug?: string;
  code: string;
}): Promise<{ success: boolean; gallery?: ClientGallery; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Database not configured' };
  }

  if (!email && !slug) {
    return { success: false, error: 'Either email or slug must be provided' };
  }

  try {
    // Build the query
    let query = supabase
      .from('client_galleries')
      .select('*')
      .eq('access_code', code.toUpperCase().trim())
      .eq('status', 'active');

    // Add email or slug condition
    if (email) {
      query = query.eq('client_email', email.toLowerCase().trim());
    } else if (slug) {
      query = query.eq('gallery_slug', slug);
    }

    const { data, error: queryError } = await query.maybeSingle();

    if (queryError) {
      console.error('Authentication error:', queryError);
      return { success: false, error: 'Authentication failed' };
    }

    if (!data) {
      return { success: false, error: 'Invalid credentials' };
    }

    const gallery = data as ClientGallery;

    // Check if gallery is expired
    if (gallery.expiration_date && new Date(gallery.expiration_date) < new Date()) {
      return { success: false, error: 'Gallery has expired' };
    }

    // Update view count (fire and forget)
    supabase
      .from('client_galleries')
      .update({ 
        view_count: (gallery.view_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', gallery.id)
      .then(({ error }) => {
        if (error) console.warn('Could not update view count:', error);
      });

    // Create session
    createSession(gallery, code);

    return { success: true, gallery };
  } catch (err) {
    console.error('Unexpected authentication error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get favorites for a gallery
 */
export async function getFavorites(galleryId: string, clientEmail: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('client_gallery_favorites')
      .select('image_public_id')
      .eq('gallery_id', galleryId)
      .eq('client_email', clientEmail);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return (data || []).map((fav: any) => fav.image_public_id);
  } catch (err) {
    console.error('Unexpected error fetching favorites:', err);
    return [];
  }
}

/**
 * Toggle favorite status for an image
 */
export async function toggleFavorite(
  galleryId: string,
  clientEmail: string,
  imageId: string,
  isFavorite: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    if (isFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('client_gallery_favorites')
        .delete()
        .eq('gallery_id', galleryId)
        .eq('client_email', clientEmail)
        .eq('image_public_id', imageId);

      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('client_gallery_favorites')
        .insert({
          gallery_id: galleryId,
          client_email: clientEmail,
          image_public_id: imageId
        });

      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Unexpected error toggling favorite:', err);
    return false;
  }
}

/**
 * Create a client session
 */
export function createSession(gallery: ClientGallery, code: string): void {
  const session: GallerySession = {
    gallery_id: gallery.id,
    gallery_slug: gallery.gallery_slug,
    client_email: gallery.client_email,
    code: code.toUpperCase().trim(),
    accessed_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Get the current session
 */
export function getSession(): GallerySession | null {
  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return null;

    const session: GallerySession = JSON.parse(sessionData);

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch (err) {
    console.error('Error reading session:', err);
    return null;
  }
}

/**
 * Clear the current session
 */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Get days until gallery expiration
 */
export function getDaysUntilExpiration(gallery: ClientGallery): number | null {
  if (!gallery.expiration_date) return null;

  const expirationDate = new Date(gallery.expiration_date);
  const today = new Date();
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Check if gallery is expired
 */
export function isGalleryExpired(gallery: ClientGallery): boolean {
  if (!gallery.expiration_date) return false;
  return new Date(gallery.expiration_date) < new Date();
}