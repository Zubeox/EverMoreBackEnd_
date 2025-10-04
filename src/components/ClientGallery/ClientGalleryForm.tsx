// ClientGalleryForm.tsx

import React, { useState, useEffect } from 'react';
import { ClientGallery, CloudinaryImage } from '../../types';
import {
  createClientGallery,
  updateClientGallery,
  generateUniqueSlug,
  generateClientName,
  generateAccessCode
} from '../../services/clientGalleryService';
import { DropZone } from '../ImageUpload/DropZone';
import { CloudinaryService } from '../../services/cloudinaryService';
import { Save, X, Mail, Copy, CircleCheck as CheckCircle, RefreshCw, Calendar, Image as ImageIcon, CircleAlert as AlertCircle } from 'lucide-react';

interface ClientGalleryFormProps {
  gallery?: ClientGallery;
  onSave: (gallery: ClientGallery) => void;
  onCancel: () => void;
}

export const ClientGalleryForm: React.FC<ClientGalleryFormProps> = ({
  gallery,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    client_email: gallery?.client_email || '',
    bride_name: gallery?.bride_name || '',
    groom_name: gallery?.groom_name || '',
    wedding_date: gallery?.wedding_date || '',
    gallery_slug: gallery?.gallery_slug || '',
    access_code: gallery?.access_code || '',
    cover_image: gallery?.cover_image || '',
    images: [...new Set(gallery?.images || [])],
    expiration_date: gallery?.expiration_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: (gallery?.status || 'active') as 'active' | 'expired' | 'archived' | 'draft',
    allow_downloads: gallery?.allow_downloads ?? true,
    welcome_message: gallery?.welcome_message || '',
    admin_notes: gallery?.admin_notes || '',
    view_count: gallery?.view_count || 0,
    last_accessed_at: gallery?.last_accessed_at || null
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImage[]>([]);
  const cloudinaryService = CloudinaryService.getInstance();

  useEffect(() => {
    if (!gallery && formData.bride_name && formData.groom_name) {
      generateSlug();
    }
  }, [formData.bride_name, formData.groom_name]);

  const generateSlug = async () => {
    if (!formData.bride_name || !formData.groom_name) return;
    const slug = await generateUniqueSlug(formData.bride_name, formData.groom_name);
    setFormData(prev => ({ ...prev, gallery_slug: slug }));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(formData.access_code || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleImageUpload = (newImages: CloudinaryImage[]) => {
    const imageIds = newImages.map(img => img.public_id);

    setUploadedImages(prev => {
      const allUploaded = [...prev, ...newImages];
      const uniqueUploaded = allUploaded.filter(
        (v, i, a) => a.findIndex(t => t.public_id === v.public_id) === i
      );
      return uniqueUploaded;
    });

    setFormData(prev => {
      const combinedImages = [...prev.images, ...imageIds];
      const uniqueImages = [...new Set(combinedImages)];

      return {
        ...prev,
        images: uniqueImages,
        cover_image: prev.cover_image || imageIds[0]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.client_email || !formData.bride_name || !formData.groom_name) {
      setError('Моля попълнете всички задължителни полета');
      return;
    }

    if (formData.images.length === 0 && uploadedImages.length === 0) {
      setError('Моля качете поне една снимка');
      return;
    }

    setSaving(true);
    try {
      const allImageIds = [...new Set([...formData.images, ...uploadedImages.map(img => img.public_id)])];

      const galleryDataToSave = {
        ...formData,
        wedding_date: formData.wedding_date || null,
        welcome_message: formData.welcome_message || null,
        admin_notes: formData.admin_notes || null,
        images: allImageIds
      };

      let savedGallery: ClientGallery;

      if (gallery?.id) {
        savedGallery = await updateClientGallery(gallery.id, galleryDataToSave);
      } else {
        const clientName = generateClientName(galleryDataToSave.bride_name, galleryDataToSave.groom_name);
        savedGallery = await createClientGallery({
          ...galleryDataToSave,
          client_name: clientName,
          access_code: generateAccessCode()
        } as any);
      }

      console.log(`✅ Gallery saved successfully`);

      setUploadedImages([]);
      onSave(savedGallery);

    } catch (err) {
      console.error('Error saving gallery:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save gallery.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="boho-card rounded-boho p-6">
        <h3 className="text-2xl font-semibold text-boho-brown mb-6 boho-heading">
          {gallery ? 'Редактиране на Галерия' : 'Нова Клиентска Галерия'}
        </h3>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-boho flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-boho-brown mb-2">
              Име на Булката *
            </label>
            <input
              type="text"
              value={formData.bride_name}
              onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
              className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-boho-brown mb-2">
              Име на Младоженеца *
            </label>
            <input
              type="text"
              value={formData.groom_name}
              onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
              className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-boho-brown mb-2">
              Email на Клиента *
            </label>
            <input
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-boho-brown mb-2">
              Дата на Сватбата
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-boho-rust w-5 h-5" />
              <input
                type="date"
                value={formData.wedding_date || ''}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-boho-brown mb-2">
            URL Slug *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.gallery_slug}
              onChange={(e) => setFormData({ ...formData, gallery_slug: e.target.value })}
              className="flex-1 px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              placeholder="maria-ivan-2025"
              required
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
              title="Генерирай отново"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-boho-rust mt-1">
            Галерията ще бъде достъпна на: {window.location.origin}/client-gallery/{formData.gallery_slug}
          </p>
        </div>

        {gallery && formData.access_code && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-boho-brown mb-2">
              Access Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.access_code}
                readOnly
                className="flex-1 px-4 py-2 bg-boho-warm bg-opacity-10 border border-boho-brown border-opacity-20 rounded-boho font-mono uppercase tracking-wider text-lg"
              />
              <button
                type="button"
                onClick={copyCode}
                className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
                title="Copy Code"
              >
                {copiedCode ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {!gallery && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-boho">
            <p className="text-sm text-blue-800">
              <strong>Access Code:</strong> Will be automatically generated when you save the gallery.
            </p>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-boho-brown mb-2">
            Дата на Изтичане
          </label>
          <input
            type="date"
            value={formData.expiration_date.split('T')[0]}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setFormData({ ...formData, expiration_date: date.toISOString() });
            }}
            className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-boho-brown mb-2">
            Съобщение за Добре Дошли
          </label>
          <textarea
            value={formData.welcome_message || ''}
            onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
            placeholder="Благодарим ви, че споделихте този специален ден с нас!"
          />
        </div>

        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.allow_downloads}
              onChange={(e) => setFormData({ ...formData, allow_downloads: e.target.checked })}
              className="w-4 h-4 text-boho-sage border-boho-brown rounded focus:ring-boho-sage"
            />
            <span className="text-sm text-boho-brown">Разреши изтегляне на снимки</span>
          </label>
        </div>
      </div>

      <div className="boho-card rounded-boho p-6">
        <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
          <ImageIcon className="w-5 h-5" />
          <span>Снимки в Галерията</span>
        </h3>

        <DropZone onUploadComplete={handleImageUpload} />

        {[...new Set(formData.images)].length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-boho-rust mb-3">
              {[...new Set(formData.images)].length} снимки качени
            </p>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {[...new Set(formData.images)].map((imageId) => (
                <div
                  key={imageId}
                  className={`aspect-square rounded-boho overflow-hidden border-2 cursor-pointer transition-all ${
                    formData.cover_image === imageId
                      ? 'border-boho-sage shadow-lg'
                      : 'border-boho-brown border-opacity-20 hover:border-opacity-40'
                  }`}
                  onClick={() => setFormData({ ...formData, cover_image: imageId })}
                  title={formData.cover_image === imageId ? 'Корица на галерията' : 'Кликни за корица'}
                >
                  <img
                    src={cloudinaryService.getOptimizedUrl(imageId, {
                      width: 150,
                      height: 150,
                      crop: 'fill',
                      quality: 'auto'
                    })}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-boho-rust mt-2">
              Кликнете на снимка, за да я изберете като корица на галерията
            </p>
          </div>
        )}
      </div>

      {!gallery && (
        <div className="boho-card rounded-boho p-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="w-5 h-5 text-boho-sage border-boho-brown rounded focus:ring-boho-sage"
            />
            <div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-boho-brown" />
                <span className="text-sm font-medium text-boho-brown">
                  Изпрати email с данните за достъп
                </span>
              </div>
              <p className="text-xs text-boho-rust mt-1">
                Клиентът ще получи email с линк към галерията и паролата за достъп
              </p>
            </div>
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-boho-brown border-opacity-30 text-boho-brown rounded-boho hover:bg-boho-warm hover:bg-opacity-20 transition-all flex items-center space-x-2"
          disabled={saving}
        >
          <X className="w-4 h-4" />
          <span>Отказ</span>
        </button>
        <button
          type="submit"
          className="boho-button px-6 py-3 text-boho-cream rounded-boho flex items-center space-x-2"
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Запазване...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{gallery ? 'Актуализирай' : 'Създай и Изпрати'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};