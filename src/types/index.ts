export interface Gallery {
  id: string;
  title: string;
  subtitle: string | null;
  event_date: string | null;
  cover_image: string | null;
  images: string[];
  created_at: string;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at?: string;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  logo_url: string;
  website: string;
  description?: string;
}

export interface ClientGallery {
  id: string;
  client_email: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  gallery_slug: string;
  access_code: string;
  cover_image: string;
  images: string[];
  expiration_date: string;
}

export interface GallerySession {
  gallery_id: string;
  gallery_slug?: string;
  client_email?: string;
  code: string;
  accessed_at: string;
  expires_at: string;
}