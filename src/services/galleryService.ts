// src/services/galleryService.ts
import { supabaseClient } from '../lib/supabaseClient';
import { Gallery } from '../types';

export async function getGalleries(): Promise<Gallery[]> {
  try {
    const { data, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
      .from('galleries')
      .insert([gallery])
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
    const { data, error } = await supabaseClient
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
  const { error } = await supabaseClient
    .from('galleries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}