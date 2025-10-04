import React, { useState, useEffect } from 'react';
import { cloudinaryService } from '../../utils/cloudinaryService';
import { ClientGallery, ClientGalleryStats } from '../../types';
import { getGalleryStats, extendExpiration, updateClientGallery } from '../../services/clientGalleryService';
import { sendCredentialsEmail } from '../../services/emailService';
import { CloudinaryService } from '../../services/cloudinaryService';
import { ArrowLeft, Eye, Download, Heart, Users, Calendar, Clock, Mail, Copy, CheckCircle, Link as LinkIcon, RefreshCw, AlertTriangle, Settings, BarChart3, Image as ImageIcon, Activity, QrCode, ExternalLink, Trash2 } from 'lucide-react';

interface ClientGalleryDetailsEnhancedProps {
  gallery: ClientGallery;
  onBack: () => void;
  onUpdate: () => void;
}

type TabType = 'overview' | 'analytics' | 'images' | 'settings';

export const ClientGalleryDetailsEnhanced: React.FC<ClientGalleryDetailsEnhancedProps> = ({
  gallery,
  onBack,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<ClientGalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);
  const [resending, setResending] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
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
      onUpdate();
    } catch (error) {
      console.error('Error extending expiration:', error);
      alert('Failed to extend expiration');
    } finally {
      setExtending(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;
      await sendCredentialsEmail({ gallery, galleryUrl });
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to send email');
    } finally {
      setResending(false);
    }
  };

  const handleRemoveImages = async () => {
    if (!confirm(`Remove ${selectedImages.size} images from this gallery?`)) return;

    try {
      const remainingImages = gallery.images.filter(id => !selectedImages.has(id));
      await updateClientGallery(gallery.id, { images: remainingImages });
      setSelectedImages(new Set());
      onUpdate();
    } catch (error) {
      console.error('Error removing images:', error);
      alert('Failed to remove images');
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No data';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-boho-brown hover:text-boho-rust transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to List</span>
        </button>
        <a
          href={galleryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 bg-boho-sage text-boho-cream rounded-boho hover:bg-opacity-90 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Live Gallery</span>
        </a>
      </div>

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
              <ImageIcon className="w-20 h-20 text-boho-brown text-opacity-40" />
            </div>
          )}
        </div>

        <div className="p-6 border-b border-boho-brown border-opacity-20">
          <h2 className="text-3xl font-semibold text-boho-brown mb-2 boho-heading">
            {gallery.bride_name} & {gallery.groom_name}
          </h2>
          <p className="text-boho-rust flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>{gallery.client_email}</span>
          </p>
        </div>

        <div className="border-b border-boho-brown border-opacity-20">
          <div className="flex space-x-1 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 flex items-center space-x-2 font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-boho-sage border-boho-sage'
                      : 'text-boho-rust border-transparent hover:text-boho-brown'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boho-brown"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="boho-card rounded-boho p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-boho">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-boho-brown">{stats?.totalViews || 0}</p>
                          <p className="text-sm text-boho-rust">Total Views</p>
                        </div>
                      </div>
                    </div>

                    <div className="boho-card rounded-boho p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-boho">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-boho-brown">{stats?.uniqueVisitors || 0}</p>
                          <p className="text-sm text-boho-rust">Unique Visitors</p>
                        </div>
                      </div>
                    </div>

                    <div className="boho-card rounded-boho p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 rounded-boho">
                          <Download className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-boho-brown">{stats?.totalDownloads || 0}</p>
                          <p className="text-sm text-boho-rust">Downloads</p>
                        </div>
                      </div>
                    </div>

                    <div className="boho-card rounded-boho p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-red-100 rounded-boho">
                          <Heart className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-boho-brown">{stats?.totalFavorites || 0}</p>
                          <p className="text-sm text-boho-rust">Favorites</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
                        <LinkIcon className="w-5 h-5" />
                        <span>Access Credentials</span>
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-boho-rust mb-2">Gallery URL</label>
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
                          <label className="block text-sm font-medium text-boho-rust mb-2">Access Code</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={gallery.access_code || 'Not set'}
                              readOnly
                              className="flex-1 px-4 py-2 bg-boho-warm bg-opacity-10 border border-boho-brown border-opacity-20 rounded-boho text-lg font-mono uppercase tracking-wider"
                            />
                            <button
                              onClick={() => copyToClipboard(gallery.access_code || '', 'code')}
                              className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
                              disabled={!gallery.access_code}
                            >
                              {copied === 'code' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-boho-rust mt-2">
                            Clients use this code with their email or gallery URL to access
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleResendEmail}
                            disabled={resending}
                            className="py-3 bg-boho-sage text-boho-cream rounded-boho hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2"
                          >
                            {resending ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-5 h-5" />
                                <span>Resend Email</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowQR(!showQR)}
                            className="py-3 bg-boho-dusty bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2"
                          >
                            <QrCode className="w-5 h-5" />
                            <span>QR Code</span>
                          </button>
                        </div>

                        {showQR && (
                          <div className="p-4 bg-white rounded-boho border border-boho-brown border-opacity-20 text-center">
                            <p className="text-sm text-boho-rust mb-2">Scan to access gallery</p>
                            <div className="inline-block p-4 bg-white">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(galleryUrl)}`}
                                alt="QR Code"
                                className="w-48 h-48"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-xl font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Gallery Information</span>
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Wedding Date</span>
                          <span className="text-boho-brown font-medium">
                            {gallery.wedding_date
                              ? new Date(gallery.wedding_date).toLocaleDateString('en-US')
                              : 'No date'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Total Images</span>
                          <span className="text-boho-brown font-medium">{gallery.images.length}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Last Accessed</span>
                          <span className="text-boho-brown font-medium">
                            {stats?.lastAccessed ? formatDate(stats.lastAccessed) : 'Never'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Created On</span>
                          <span className="text-boho-brown font-medium">
                            {formatDate(gallery.created_at)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-boho-rust flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Expires In</span>
                          </span>
                          <span className={`font-bold ${
                            stats && stats.daysUntilExpiration < 7 ? 'text-red-600' : 'text-boho-brown'
                          }`}>
                            {stats?.daysUntilExpiration} days
                          </span>
                        </div>
                      </div>

                      {stats && stats.daysUntilExpiration < 14 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-boho">
                          <div className="flex items-start space-x-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 font-medium">Gallery expiring soon</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleExtendExpiration(30)}
                              disabled={extending}
                              className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                            >
                              +30 days
                            </button>
                            <button
                              onClick={() => handleExtendExpiration(60)}
                              disabled={extending}
                              className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                            >
                              +60 days
                            </button>
                            <button
                              onClick={() => handleExtendExpiration(90)}
                              disabled={extending}
                              className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-boho hover:bg-yellow-700 transition-all"
                            >
                              +90 days
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {gallery.welcome_message && (
                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-xl font-semibold text-boho-brown mb-3 boho-heading">
                        Welcome Message
                      </h3>
                      <p className="text-boho-rust">{gallery.welcome_message}</p>
                    </div>
                  )}

                  {gallery.admin_notes && (
                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-xl font-semibold text-boho-brown mb-3 boho-heading">
                        Admin Notes
                      </h3>
                      <p className="text-boho-rust">{gallery.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-lg font-semibold text-boho-brown mb-4 boho-heading flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Engagement Metrics</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-boho-rust">Views</span>
                            <span className="text-boho-brown font-bold">{stats?.totalViews || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-boho-warm bg-opacity-20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${Math.min(100, ((stats?.totalViews || 0) / 100) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-boho-rust">Downloads</span>
                            <span className="text-boho-brown font-bold">{stats?.totalDownloads || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-boho-warm bg-opacity-20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${Math.min(100, ((stats?.totalDownloads || 0) / 50) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-boho-rust">Favorites</span>
                            <span className="text-boho-brown font-bold">{stats?.totalFavorites || 0}</span>
                          </div>
                          <div className="w-full h-2 bg-boho-warm bg-opacity-20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${Math.min(100, ((stats?.totalFavorites || 0) / gallery.images.length) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="boho-card rounded-boho p-6">
                      <h3 className="text-lg font-semibold text-boho-brown mb-4 boho-heading">
                        Quick Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Avg. Views per Visitor</span>
                          <span className="text-boho-brown font-bold">
                            {stats?.uniqueVisitors ? ((stats.totalViews / stats.uniqueVisitors).toFixed(1)) : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-boho-brown border-opacity-10">
                          <span className="text-boho-rust">Downloads per Image</span>
                          <span className="text-boho-brown font-bold">
                            {gallery.images.length ? ((stats?.totalDownloads || 0) / gallery.images.length).toFixed(2) : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-boho-rust">Favorite Rate</span>
                          <span className="text-boho-brown font-bold">
                            {gallery.images.length ? (((stats?.totalFavorites || 0) / gallery.images.length) * 100).toFixed(1) : '0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-6">
                  {selectedImages.size > 0 && (
                    <div className="flex items-center justify-between p-4 bg-boho-sage bg-opacity-10 rounded-boho border border-boho-sage border-opacity-30">
                      <span className="text-boho-brown font-medium">
                        {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleRemoveImages}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-boho hover:bg-red-200 transition-all flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Selected</span>
                        </button>
                        <button
                          onClick={() => setSelectedImages(new Set())}
                          className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {gallery.images.map((imageId) => (
                      <div
                        key={imageId}
                        onClick={() => toggleImageSelection(imageId)}
                        className={`aspect-square rounded-boho overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedImages.has(imageId)
                            ? 'border-boho-sage ring-2 ring-boho-sage ring-offset-2'
                            : 'border-boho-brown border-opacity-20 hover:border-opacity-40'
                        }`}
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
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="boho-card rounded-boho p-6">
                    <h3 className="text-lg font-semibold text-boho-brown mb-4">Gallery Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-boho-brown border-opacity-10">
                        <div>
                          <p className="font-medium text-boho-brown">Allow Downloads</p>
                          <p className="text-sm text-boho-rust">Clients can download images</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={gallery.allow_downloads}
                          readOnly
                          className="w-5 h-5 text-boho-sage border-boho-brown rounded focus:ring-boho-sage"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-boho-brown border-opacity-10">
                        <div>
                          <p className="font-medium text-boho-brown">Status</p>
                          <p className="text-sm text-boho-rust">Current gallery status</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          gallery.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {gallery.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
