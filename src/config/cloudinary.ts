// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'demo_preset',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
};

export const CLOUDINARY_API_BASE = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}`;