import { supabase } from '../lib/supabase';
import { Gallery } from '../types';

export async function getGalleries(): Promise<Gallery[]> {
  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(gallery => ({
      ...gallery,
      images: gallery.images || []
    }));
  } catch (error) {
    console.error('Supabase connection error:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

export async function createGallery(gallery: Omit<Gallery, 'id' | 'created_at'>): Promise<Gallery> {
  console.log('🎨 [GalleryService] Creating gallery:', {
    title: gallery.title,
    hasSubtitle: !!gallery.subtitle,
    date: gallery.event_date
  });

  try {
    const { data, error } = await supabase
      .from('galleries')
      .insert([gallery]) // Ensure data is wrapped in an array
      .select()
      .single();

    if (error) {
      console.error('❌ [GalleryService] Create error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ [GalleryService] Gallery created successfully:', {
      id: data.id,
      title: data.title
    });
    return data;
  } catch (error: any) {
    console.error('❌ [GalleryService] Unexpected error:', error);
    throw error;
  }
}

export async function updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery> {
  try {
    const { data, error } = await supabase
      .from('galleries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Gallery not found');
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      throw new Error('Gallery not found');
    }
    throw error;
  }
}

export async function deleteGallery(id: string): Promise<void> {
  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}