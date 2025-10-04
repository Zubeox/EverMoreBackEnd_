import React, { useState, useEffect } from 'react';
import { ClientGallery } from '../../types';
import { getClientGalleries, deleteClientGallery } from '../../services/clientGalleryService';
import { CloudinaryService } from '../../services/cloudinaryService';
import { Plus, CreditCard as Edit, Trash2, Calendar, Images, Mail, Eye, AlertCircle, Clock, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

interface ClientGalleryListProps {
  onCreateGallery: () => void;
  onEditGallery: (gallery: ClientGallery) => void;
  onViewDetails: (gallery: ClientGallery) => void;
}

export const ClientGalleryList: React.FC<ClientGalleryListProps> = ({
  onCreateGallery,
  onEditGallery,
  onViewDetails
}) => {
  const [galleries, setGalleries] = useState<ClientGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const cloudinaryService = CloudinaryService.getInstance();

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientGalleries();
      setGalleries(data);
    } catch (err) {
      console.error('Client gallery loading error:', err);
      setError('Unable to load client galleries. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, names: string) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете галерията на ${names}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteClientGallery(id);
      setGalleries(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery');
    } finally {
      setDeletingId(null);
    }
  };

  const copyCredentials = (gallery: ClientGallery) => {
    const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;
    const credentials = `Галерия: ${galleryUrl}\nКод за достъп: ${gallery.access_code}`;
    navigator.clipboard.writeText(credentials);
    setCopiedId(gallery.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Няма дата';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (gallery: ClientGallery) => {
    const daysLeft = getDaysUntilExpiration(gallery.expiration_date);

    if (gallery.status === 'expired' || daysLeft < 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Изтекла</span>
        </span>
      );
    }

    if (daysLeft <= 7) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{daysLeft} дни</span>
        </span>
      );
    }

    if (gallery.view_count === 0) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center space-x-1">
          <Mail className="w-3 h-3" />
          <span>Нова</span>
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center space-x-1">
        <CheckCircle className="w-3 h-3" />
        <span>Активна</span>
      </span>
    );
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
      <div className="flex justify-between items-center">
        <div>
          <p className="text-boho-rust font-boho">
            {galleries.length} {galleries.length === 1 ? 'клиентска галерия' : 'клиентски галерии'}
          </p>
        </div>
        <button
          onClick={onCreateGallery}
          className="boho-button px-6 py-3 text-boho-cream rounded-boho flex items-center space-x-2 font-boho"
        >
          <Plus className="w-4 h-4" />
          <span>Нова Клиентска Галерия</span>
        </button>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto bg-boho-warm bg-opacity-30 rounded-full flex items-center justify-center mb-6 border-3 border-boho-brown border-opacity-20">
            <Images className="w-16 h-16 text-boho-brown text-opacity-60" />
          </div>
          <h3 className="text-2xl font-semibold text-boho-brown mb-3 boho-heading">Все още няма клиентски галерии</h3>
          <p className="text-boho-rust mb-6 font-boho">Създайте първата си клиентска сватбена галерия.</p>
          <button
            onClick={onCreateGallery}
            className="boho-button px-8 py-4 text-boho-cream rounded-boho flex items-center space-x-2 mx-auto font-boho"
          >
            <Plus className="w-5 h-5" />
            <span>Създай Галерия</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="boho-card rounded-boho overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-video bg-boho-warm bg-opacity-20 relative overflow-hidden">
                {gallery.cover_image ? (
                  <img
                    src={cloudinaryService.getOptimizedUrl(gallery.cover_image, {
                      width: 400,
                      height: 225,
                      crop: 'fill',
                      quality: 'auto'
                    })}
                    alt={`${gallery.bride_name} & ${gallery.groom_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-16 h-16 text-boho-brown text-opacity-40" />
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  {getStatusBadge(gallery)}
                </div>

                <div className="absolute inset-0 bg-boho-brown bg-opacity-0 hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(gallery)}
                      className="p-3 bg-boho-sage rounded-boho text-boho-cream hover:bg-boho-dusty transition-all duration-200 hover:scale-110"
                      title="Преглед"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditGallery(gallery)}
                      className="p-3 bg-boho-sage rounded-boho text-boho-cream hover:bg-boho-dusty transition-all duration-200 hover:scale-110"
                      title="Редактиране"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(gallery.id, `${gallery.bride_name} & ${gallery.groom_name}`)}
                      disabled={deletingId === gallery.id}
                      className="p-3 bg-boho-terracotta rounded-boho text-boho-cream hover:bg-red-600 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                      title="Изтриване"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-boho-brown text-lg mb-2 boho-heading">
                  {gallery.bride_name} & {gallery.groom_name}
                </h3>

                <div className="space-y-2 text-sm text-boho-rust mb-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{gallery.client_email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(gallery.wedding_date)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Images className="w-3 h-3" />
                      <span>{gallery.images.length} снимки</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{gallery.view_count} прегледи</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{getDaysUntilExpiration(gallery.expiration_date)}д</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => copyCredentials(gallery)}
                  className="w-full py-2 px-3 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho text-sm font-medium hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2"
                >
                  {copiedId === gallery.id ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Копирано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Копирай Данни</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};