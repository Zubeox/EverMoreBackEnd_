// src/services/contactService.ts
import { supabaseAdmin } from '../lib/supabaseClient';
import { Contact } from '../types';

export async function submitContact(
  contact: Omit<Contact, 'id' | 'created_at'>
): Promise<Contact> {
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}