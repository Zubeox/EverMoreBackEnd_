import React, { useState, useEffect } from 'react';
import { Gallery } from '../../types';
import { getGalleries, deleteGallery } from '../../services/galleryService';
import { CloudinaryService } from '../../services/cloudinaryService';
import { Plus, CreditCard as Edit, Trash2, Calendar, Images, Eye, AlertCircle } from 'lucide-react';

interface GalleryListProps {
  onCreateGallery: () => void;
  onEditGallery: (gallery: Gallery) => void;
}

export const GalleryList: React.FC<GalleryListProps> = ({ 
  onCreateGallery, 
  onEditGallery 
}) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const cloudinaryService = CloudinaryService.getInstance();

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGalleries();
      setGalleries(data);
    } catch (err) {
      console.error('Gallery loading error:', err);
      setError('Unable to connect to database. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете галерията "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteGallery(id);
      setGalleries(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Няма дата';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boho-brown"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-boho-terracotta mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-boho-brown mb-2 boho-heading">Грешка при зареждане</h3>
        <p className="text-boho-rust mb-4 font-boho">{error}</p>
        <button
          onClick={loadGalleries}
          className="boho-button px-6 py-3 text-boho-cream rounded-boho font-boho"
        >
          Опитай отново
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-boho-rust font-boho">
            {galleries.length} {galleries.length === 1 ? 'галерия' : 'галерии'} в портфолиото
          </p>
        </div>
        <button
          onClick={onCreateGallery}
          className="boho-button px-6 py-3 text-boho-cream rounded-boho flex items-center space-x-2 font-boho"
        >
          <Plus className="w-4 h-4" />
          <span>Нова галерия</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {galleries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto bg-boho-warm bg-opacity-30 rounded-full flex items-center justify-center mb-6 border-3 border-boho-brown border-opacity-20">
            <Images className="w-16 h-16 text-boho-brown text-opacity-60" />
          </div>
          <h3 className="text-2xl font-semibold text-boho-brown mb-3 boho-heading">Все още няма галерии</h3>
          <p className="text-boho-rust mb-6 font-boho">Създайте първата си портфолио галерия.</p>
          <button
            onClick={onCreateGallery}
            className="boho-button px-8 py-4 text-boho-cream rounded-boho flex items-center space-x-2 mx-auto font-boho"
          >
            <Plus className="w-5 h-5" />
            <span>Създай галерия</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="boho-card rounded-boho overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              {/* Cover Image */}
              <div className="aspect-video bg-boho-warm bg-opacity-20 relative overflow-hidden">
                {gallery.cover_image ? (
                  <img
                    src={cloudinaryService.getOptimizedUrl(gallery.cover_image, { 
                      width: 400, 
                      height: 225,
                      crop: 'fill',
                      quality: 'auto'
                    })}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-16 h-16 text-boho-brown text-opacity-40" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-boho-brown bg-opacity-0 hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditGallery(gallery)}
                      className="p-3 bg-boho-sage rounded-boho text-boho-cream hover:bg-boho-dusty transition-all duration-200 hover:scale-110"
                      title="Редактиране"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gallery.id, gallery.title)}
                      disabled={deletingId === gallery.id}
                      className="p-3 bg-boho-terracotta rounded-boho text-boho-cream hover:bg-red-600 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                      title="Изтриване"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery Details */}
              <div className="p-4">
                <h3 className="font-semibold text-boho-brown text-lg mb-2 boho-heading">
                  {gallery.title}
                </h3>
                
                {gallery.subtitle && (
                  <p className="text-boho-rust text-sm mb-3 font-boho">
                    {gallery.subtitle}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-boho-rust">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(gallery.event_date)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Images className="w-3 h-3" />
                      <span>{gallery.images.length} снимки</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};