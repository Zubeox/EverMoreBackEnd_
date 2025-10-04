import React, { useState } from 'react';
import { ClientGallery } from '../../types';
import { CloudinaryService } from '../../services/cloudinaryService';
import { Eye, CreditCard as Edit2, Trash2, Copy, CheckCircle, AlertCircle, AlertTriangle, Mail, Calendar, Images, Clock, Download, Heart, Users, Link as LinkIcon, QrCode } from 'lucide-react';

interface ClientGalleryCardProps {
  gallery: ClientGallery;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (gallery: ClientGallery) => void;
  onEdit: (gallery: ClientGallery) => void;
  onDelete: (id: string) => void;
}

export const ClientGalleryCard: React.FC<ClientGalleryCardProps> = ({
  gallery,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const cloudinaryService = CloudinaryService.getInstance();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiration(gallery.expiration_date);

  const getStatusInfo = () => {
    if (gallery.status === 'expired' || daysLeft < 0) {
      return {
        badge: 'Expired',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        iconColor: 'text-red-600'
      };
    }

    if (daysLeft <= 7) {
      return {
        badge: `${daysLeft}d left`,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600'
      };
    }

    if (gallery.view_count === 0) {
      return {
        badge: 'New',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Mail,
        iconColor: 'text-blue-600'
      };
    }

    return {
      badge: 'Active',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDelete = () => {
    if (confirm(`Delete gallery for ${gallery.bride_name} & ${gallery.groom_name}? This cannot be undone.`)) {
      onDelete(gallery.id);
    }
  };

  const galleryUrl = `${window.location.origin}/client-gallery/${gallery.gallery_slug}`;
  const expirationProgress = Math.max(0, Math.min(100, (daysLeft / 90) * 100));

  return (
    <div
      className={`boho-card rounded-boho overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-boho-sage ring-offset-2' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative aspect-video bg-boho-warm bg-opacity-20 overflow-hidden group">
        {gallery.cover_image ? (
          <img
            src={cloudinaryService.getOptimizedUrl(gallery.cover_image, {
              width: 400,
              height: 225,
              crop: 'fill',
              quality: 'auto'
            })}
            alt={`${gallery.bride_name} & ${gallery.groom_name}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Images className="w-16 h-16 text-boho-brown text-opacity-40" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <label
            className="flex items-center space-x-2 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(gallery.id)}
              className="w-5 h-5 text-boho-sage border-2 border-white rounded focus:ring-boho-sage bg-white bg-opacity-90"
            />
          </label>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 ${statusInfo.color} text-xs font-semibold rounded-full border flex items-center space-x-1 backdrop-blur-sm`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.badge}</span>
          </span>
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-t from-boho-brown via-boho-brown/60 to-transparent transition-opacity duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4">
            <button
              onClick={() => onView(gallery)}
              className="p-3 bg-white rounded-boho text-boho-brown hover:bg-boho-sage hover:text-boho-cream transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(gallery)}
              className="p-3 bg-white rounded-boho text-boho-brown hover:bg-boho-dusty hover:text-boho-cream transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Edit Gallery"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => copyToClipboard(galleryUrl, 'url')}
              className="p-3 bg-white rounded-boho text-boho-brown hover:bg-blue-500 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Copy Gallery URL"
            >
              {copiedItem === 'url' ? <CheckCircle className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-white rounded-boho text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
              title="Delete Gallery"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-boho-brown text-lg mb-1 boho-heading hover:text-boho-sage transition-colors cursor-pointer" onClick={() => onView(gallery)}>
            {gallery.bride_name} & {gallery.groom_name}
          </h3>
          <div className="flex items-center space-x-2 text-xs text-boho-rust">
            <Mail className="w-3 h-3" />
            <span className="truncate">{gallery.client_email}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center space-x-2 text-boho-rust">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(gallery.wedding_date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-boho-rust">
            <Images className="w-3 h-3" />
            <span>{gallery.images.length} photos</span>
          </div>
          <div className="flex items-center space-x-2 text-boho-rust">
            <Eye className="w-3 h-3" />
            <span>{gallery.view_count} views</span>
          </div>
          <div className="flex items-center space-x-2 text-boho-rust">
            <Clock className="w-3 h-3" />
            <span className={daysLeft < 7 ? 'text-red-600 font-semibold' : ''}>
              {daysLeft}d left
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-boho-rust mb-1">
            <span>Days until expiration</span>
            <span className="font-semibold">{daysLeft} / 90</span>
          </div>
          <div className="w-full h-2 bg-boho-warm bg-opacity-20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                daysLeft < 7 ? 'bg-red-500' : daysLeft < 14 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${expirationProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => copyToClipboard(gallery.access_code || '', 'code')}
            className="flex-1 py-2 px-3 bg-boho-sage bg-opacity-10 text-boho-brown rounded-boho text-sm font-medium hover:bg-opacity-20 transition-all flex items-center justify-center space-x-2"
            disabled={!gallery.access_code}
          >
            {copiedItem === 'code' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            onClick={() => copyToClipboard(`URL: ${galleryUrl}\nCode: ${gallery.access_code}`, 'credentials')}
            className="py-2 px-3 bg-boho-dusty bg-opacity-10 text-boho-brown rounded-boho text-sm hover:bg-opacity-20 transition-all"
            title="Copy All Credentials"
            disabled={!gallery.access_code}
          >
            {copiedItem === 'credentials' ? <CheckCircle className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
