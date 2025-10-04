// ✅ Fixed ClientGalleryDetails.tsx — deduplicated image keys

import React, { useState, useEffect } from 'react';
import { ClientGallery, ClientGalleryStats } from '../../types';
import { getGalleryStats, extendExpiration } from '../../services/clientGalleryService';
import { sendCredentialsEmail } from '../../services/emailService';
import { CloudinaryService } from '../../services/cloudinaryService';
import {
  ArrowLeft,
  Eye,
  Download,
  Heart,
  Users,
  Calendar,
  Clock,
  Mail,
  Copy,
  CheckCircle,
  Link as LinkIcon,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface ClientGalleryDetailsProps {
  gallery: ClientGallery;
  onBack: () => void;
}

export const ClientGalleryDetails: React.FC<ClientGalleryDetailsProps> = ({
  gallery,
  onBack
}) => {
  const [stats, setStats] = useState<ClientGalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);
  const [resending, setResending] = useState(false);
  const cloudinaryService = CloudinaryService.getInstance();

  useEffect(() => {
    loadStats();
  }, [gallery.id]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getGalleryStats(gallery.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExtendExpiration = async (days: number) => {
    try {
      setExtending(true);
      await extendExpiration(gallery.id, days);
      await loadStats();
    } catch (error) {
      console.error('Error extending expiration:', error);
    } finally {
      setExtending(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;
      await sendCredentialsEmail({ gallery, galleryUrl });
      alert('Email изпратен успешно!');
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Грешка при изпращане на email');
    } finally {
      setResending(false);
    }
  };

  const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Няма данни';
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boho-brown"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-boho-brown hover:text-boho-rust transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Назад към Списъка</span>
      </button>

      <div className="boho-card rounded-boho overflow-hidden">
        <div className="aspect-video bg-boho-warm bg-opacity-20 relative">
          {gallery.cover_image ? (
            <img
              src={cloudinaryService.getOptimizedUrl(gallery.cover_image, {
                width: 1200,
                height: 675,
                crop: 'fill',
                quality: 'auto'
              })}
              alt={`${gallery.bride_name} & ${gallery.groom_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-boho-brown text-opacity-40 text-lg">Няма корица</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-semibold text-boho-brown mb-2 boho-heading">
            {gallery.bride_name} & {gallery.groom_name}
          </h2>
          <p className="text-boho-rust">{gallery.client_email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="boho-card rounded-boho p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-boho">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-brown">{stats?.totalViews || 0}</p>
              <p className="text-sm text-boho-rust">Прегледи</p>
            </div>
          </div>
        </div>

        <div className="boho-card rounded-boho p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-green-100 rounded-boho">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-brown">{stats?.uniqueVisitors || 0}</p>
              <p className="text-sm text-boho-rust">Уникални</p>
            </div>
          </div>
        </div>

        <div className="boho-card rounded-boho p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-boho">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-brown">{stats?.totalDownloads || 0}</p>
              <p className="text-sm text-boho-rust">Изтегляния</p>
            </div>
          </div>
        </div>

        <div className="boho-card rounded-boho p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-red-100 rounded-boho">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-brown">{stats?.totalFavorites || 0}</p>
              <p className="text-sm text-boho-rust">Любими</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
            <LinkIcon className="w-5 h-5" />
            <span>Данни за Достъп</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-boho-rust mb-2">URL на Галерията</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={galleryUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-boho-warm bg-opacity-10 border border-boho-brown border-opacity-20 rounded-boho text-sm"
                />
                <button
                  onClick={() => copyToClipboard(galleryUrl, 'url')}
                  className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
                >
                  {copied === 'url' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-rust mb-2">Парола</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={gallery.access_code || 'Няма код'}
                  readOnly
                  className="flex-1 px-4 py-2 bg-boho-warm bg-opacity-10 border border-boho-brown border-opacity-20 rounded-boho text-sm font-mono text-boho-brown"
                />
                <button
                  onClick={() => copyToClipboard(gallery.access_code || '', 'password')}
                  className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
                >
                  {copied === 'password' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-3 bg-boho-sage text-boho-cream rounded-boho hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Изпращане...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Изпрати Email Отново</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="boho-card rounded-boho p-6">
          <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Информация</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
              <span className="text-boho-rust">Дата на Сватбата</span>
              <span className="text-boho-brown font-medium">
                {gallery.wedding_date
                  ? new Date(gallery.wedding_date).toLocaleDateString('bg-BG')
                  : 'Няма дата'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
              <span className="text-boho-rust">Снимки</span>
              <span className="text-boho-brown font-medium">{[...new Set(gallery.images)].length}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
              <span className="text-boho-rust">Последен Достъп</span>
              <span className="text-boho-brown font-medium">
                {stats?.lastAccessed ? formatDate(stats.lastAccessed) : 'Никога'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
              <span className="text-boho-rust">Създадена На</span>
              <span className="text-boho-brown font-medium">
                {formatDate(gallery.created_at)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-boho-rust flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Изтича След</span>
              </span>
              <span className={`font-bold ${
                stats && stats.daysUntilExpiration < 7 ? 'text-red-600' : 'text-boho-brown'
              }`}>
                {stats?.daysUntilExpiration} дни
              </span>
            </div>
          </div>

          {stats && stats.daysUntilExpiration < 14 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-boho flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Галерията скоро изтича</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExtendExpiration(30)}
                    disabled={extending}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                  >
                    +30 дни
                  </button>
                  <button
                    onClick={() => handleExtendExpiration(60)}
                    disabled={extending}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                  >
                    +60 дни
                  </button>
                  <button
                    onClick={() => handleExtendExpiration(90)}
                    disabled={extending}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                  >
                    +90 дни
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {gallery.welcome_message && (
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-xl font-semibold text-boho-brown mb-3 boho-heading">
            Съобщение за Добре Дошли
          </h3>
          <p className="text-boho-rust">{gallery.welcome_message}</p>
        </div>
      )}

      {gallery.admin_notes && (
        <div className="boho-card rounded-boho p-6">
          <h3 className="text-xl font-semibold text-boho-brown mb-3 boho-heading">
            Административни Бележки
          </h3>
          <p className="text-boho-rust">{gallery.admin_notes}</p>
        </div>
      )}

      <div className="boho-card rounded-boho p-6">
        <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading">
          Снимки в Галерията
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {[...new Set(gallery.images)].map((imageId) => (
            <div
              key={imageId}
              className="aspect-square rounded-boho overflow-hidden border-2 border-boho-brown border-opacity-20 hover:border-opacity-40 transition-all"
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
      </div>
    </div>
  );
};