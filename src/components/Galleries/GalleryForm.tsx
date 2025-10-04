import React, { useState, useEffect } from 'react';
import { Gallery, CloudinaryImage } from '../../types';
import { createGallery, updateGallery } from '../../services/galleryService';
import { CloudinaryService } from '../../services/cloudinaryService';
import { DropZone } from '../ImageUpload/DropZone';
import { 
  Save, 
  X, 
  Calendar, 
  Type, 
  FileText, 
  Image as ImageIcon,
  Star,
  Trash2,
  Plus
} from 'lucide-react';

interface GalleryFormProps {
  gallery?: Gallery;
  onSave: (gallery: Gallery) => void;
  onCancel: () => void;
  availableImages: CloudinaryImage[];
}

export const GalleryForm: React.FC<GalleryFormProps> = ({ 
  gallery, 
  onSave, 
  onCancel,
  availableImages 
}) => {
  const [formData, setFormData] = useState({
    title: gallery?.title || '',
    subtitle: gallery?.subtitle || '',
    event_date: gallery?.event_date || '',
    cover_image: gallery?.cover_image || '',
    images: gallery?.images || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const cloudinaryService = CloudinaryService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Заглавието е задължително');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const galleryData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        event_date: formData.event_date || null,
        cover_image: formData.cover_image || null,
        images: formData.images
      };

      let result: Gallery;
      if (gallery) {
        result = await updateGallery(gallery.id, galleryData);
      } else {
        result = await createGallery(galleryData);
      }

      onSave(result);
    } catch (err) {
      if (err instanceof Error && err.message === 'Gallery not found') {
        setError('Галерията не беше намерена. Може да е била изтрита.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save gallery');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newImages: CloudinaryImage[]) => {
    // Add new images to available images and select them
    const newPublicIds = newImages.map(img => img.public_id);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newPublicIds]
    }));
  };

  const toggleImageSelection = (publicId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.includes(publicId)
        ? prev.images.filter(id => id !== publicId)
        : [...prev.images, publicId]
    }));
  };

  const setCoverImage = (publicId: string) => {
    setFormData(prev => ({
      ...prev,
      cover_image: publicId
    }));
    setShowCoverSelector(false);
  };

  const removeImage = (publicId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(id => id !== publicId),
      cover_image: prev.cover_image === publicId ? '' : prev.cover_image
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-boho-brown boho-heading">
          {gallery ? 'Редактиране на галерия' : 'Нова галерия'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-boho-brown hover:text-boho-terracotta rounded-boho transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-boho-terracotta bg-opacity-20 border border-boho-terracotta rounded-boho p-4">
          <p className="text-boho-terracotta font-boho">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-lg font-semibold text-boho-brown mb-4 flex items-center space-x-2 boho-heading">
            <FileText className="w-5 h-5" />
            <span>Основна информация</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                <Type className="w-4 h-4 inline mr-1" />
                Заглавие *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-boho-brown border-opacity-30 rounded-boho focus:border-boho-sage focus:outline-none bg-boho-cream font-boho"
                placeholder="напр. Мария и Георги"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Подзаглавие
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-3 border border-boho-brown border-opacity-30 rounded-boho focus:border-boho-sage focus:outline-none bg-boho-cream font-boho"
                placeholder="напр. Елегантна сватба"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                <Calendar className="w-4 h-4 inline mr-1" />
                Дата на събитието
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full px-4 py-3 border border-boho-brown border-opacity-30 rounded-boho focus:border-boho-sage focus:outline-none bg-boho-cream font-boho"
              />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-lg font-semibold text-boho-brown mb-4 flex items-center space-x-2 boho-heading">
            <Star className="w-5 h-5" />
            <span>Корица на галерията</span>
          </h3>
          
          {formData.cover_image ? (
            <div className="relative inline-block">
              <img
                src={cloudinaryService.getOptimizedUrl(formData.cover_image, { 
                  width: 300, 
                  height: 200,
                  crop: 'fill',
                  quality: 'auto'
                })}
                alt="Cover"
                className="w-72 h-48 object-cover rounded-boho border-2 border-boho-brown border-opacity-20"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                className="absolute -top-2 -right-2 p-2 bg-boho-terracotta text-boho-cream rounded-full hover:bg-red-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-16 h-16 text-boho-brown text-opacity-40 mx-auto mb-4" />
              <p className="text-boho-rust mb-4 font-boho">Няма избрана корица</p>
            </div>
          )}
          
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setShowCoverSelector(!showCoverSelector)}
              className="px-4 py-2 bg-boho-sage text-boho-cream rounded-boho hover:bg-boho-dusty transition-colors duration-200 font-boho mr-3"
            >
              {formData.cover_image ? 'Смени от качените' : 'Избери от качените'}
            </button>
            
            <div>
              <p className="text-sm text-boho-rust mb-2 font-boho">Или качете нова корица:</p>
              <DropZone onUploadComplete={(newImages) => {
                if (newImages.length > 0) {
                  setFormData(prev => ({ ...prev, cover_image: newImages[0].public_id }));
                }
              }} />
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-lg font-semibold text-boho-brown mb-4 flex items-center space-x-2 boho-heading">
            <ImageIcon className="w-5 h-5" />
            <span>Изображения в галерията ({formData.images.length})</span>
          </h3>
          
          {/* Selected Images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {formData.images.map((publicId) => (
                <div key={publicId} className="relative group">
                  <img
                    src={cloudinaryService.getOptimizedUrl(publicId, { 
                      width: 150, 
                      height: 150,
                      crop: 'fill',
                      quality: 'auto'
                    })}
                    alt=""
                    className="w-full h-24 object-cover rounded-boho border border-boho-brown border-opacity-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(publicId)}
                    className="absolute -top-1 -right-1 p-1 bg-boho-terracotta text-boho-cream rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {formData.cover_image === publicId && (
                    <div className="absolute bottom-1 left-1 p-1 bg-boho-sage text-boho-cream rounded-full">
                      <Star className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowImageSelector(!showImageSelector)}
              className="px-4 py-2 bg-boho-sage text-boho-cream rounded-boho hover:bg-boho-dusty transition-colors duration-200 font-boho flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Избери от качените изображения</span>
            </button>
            
            {/* Upload new images */}
            <div>
              <p className="text-sm text-boho-rust mb-2 font-boho">Или качете нови изображения:</p>
              <DropZone onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>

        {/* Image Selector Modal */}
        {(showImageSelector || showCoverSelector) && (
          <div className="fixed inset-0 bg-boho-brown bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-boho-cream rounded-boho max-w-4xl max-h-full overflow-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-boho-brown boho-heading">
                  {showCoverSelector ? 'Избери корица' : 'Избери изображения'}
                </h3>
                <button
                  onClick={() => {
                    setShowImageSelector(false);
                    setShowCoverSelector(false);
                  }}
                  className="p-2 text-boho-brown hover:text-boho-terracotta rounded-boho transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableImages.map((image) => (
                  <div 
                    key={image.public_id} 
                    className={`relative cursor-pointer rounded-boho overflow-hidden border-2 transition-all duration-200 ${
                      showCoverSelector
                        ? 'hover:border-boho-sage'
                        : formData.images.includes(image.public_id)
                        ? 'border-boho-sage'
                        : 'border-boho-brown border-opacity-20 hover:border-boho-sage'
                    }`}
                    onClick={() => {
                      if (showCoverSelector) {
                        setCoverImage(image.public_id);
                      } else {
                        toggleImageSelection(image.public_id);
                      }
                    }}
                  >
                    <img
                      src={cloudinaryService.getOptimizedUrl(image.public_id, { 
                        width: 150, 
                        height: 150,
                        crop: 'fill',
                        quality: 'auto'
                      })}
                      alt=""
                      className="w-full h-24 object-cover"
                    />
                    {!showCoverSelector && formData.images.includes(image.public_id) && (
                      <div className="absolute inset-0 bg-boho-sage bg-opacity-50 flex items-center justify-center">
                        <div className="w-6 h-6 bg-boho-sage rounded-full flex items-center justify-center">
                          <span className="text-boho-cream text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!showCoverSelector && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowImageSelector(false)}
                    className="px-6 py-3 bg-boho-sage text-boho-cream rounded-boho hover:bg-boho-dusty transition-colors duration-200 font-boho"
                  >
                    Готово ({formData.images.length} избрани)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-boho-brown border-opacity-30 text-boho-brown rounded-boho hover:bg-boho-warm hover:bg-opacity-30 transition-colors duration-200 font-boho"
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="boho-button px-6 py-3 text-boho-cream rounded-boho flex items-center space-x-2 disabled:opacity-50 font-boho"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Запазване...' : 'Запази галерия'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};