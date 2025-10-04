import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import {
  createClientGallery,
  generateUniqueSlug,
  generateRandomPassword,
  generateAccessCode,
  generateClientName
} from '../../services/clientGalleryService';

interface CreateGalleryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGalleryModal({ onClose, onSuccess }: CreateGalleryModalProps) {
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    clientEmail: '',
    weddingDate: '',
    access_password: generateRandomPassword(),
    welcomeMessage: '',
    expiresInDays: 90,
    allowDownloads: true
  });
  const [loading, setLoading] = useState(false);
  const [createdGallery, setCreatedGallery] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = await generateUniqueSlug(formData.brideName, formData.groomName);
      const accessCode = generateAccessCode();
      const clientName = generateClientName(formData.brideName, formData.groomName);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + formData.expiresInDays);

      const gallery = await createClientGallery({
        client_email: formData.clientEmail.toLowerCase(),
        client_name: clientName,
        bride_name: formData.brideName,
        groom_name: formData.groomName,
        wedding_date: formData.weddingDate,
        gallery_slug: slug,
        access_code: accessCode,
        welcome_message: formData.welcomeMessage || null,
        expiration_date: expirationDate.toISOString(),
        status: 'active',
        allow_downloads: formData.allowDownloads,
        view_count: 0,
        images: [],
        cover_image: null,
        last_accessed_at: null,
        admin_notes: null
      } as any);

      setCreatedGallery({ ...gallery, frontendUrl: window.location.origin });
    } catch (error) {
      console.error('Error creating gallery:', error);
      alert('Failed to create gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleClose = () => {
    if (createdGallery) {
      onSuccess();
    }
    onClose();
  };

  if (createdGallery) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-2xl font-serif text-neutral-900">Gallery Created Successfully!</h2>
            <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">
                Gallery for {createdGallery.bride_name} & {createdGallery.groom_name} has been created!
              </p>
              <p className="text-sm text-green-700">
                Share these credentials with your client. They have two ways to access their gallery:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Method 1: Direct Link</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Gallery URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={`${createdGallery.frontendUrl}/client-gallery/${createdGallery.gallery_slug}`}
                        className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(
                          `${createdGallery.frontendUrl}/client-gallery/${createdGallery.gallery_slug}`,
                          'url'
                        )}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {copiedField === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Access Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={createdGallery.access_code}
                        className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(createdGallery.access_code, 'access_code')}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {copiedField === 'access_code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Authentication Methods</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Gallery URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={`${createdGallery.frontendUrl}/client-gallery`}
                        className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(`${createdGallery.frontendUrl}/client-gallery`, 'general-url')}
                        className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {copiedField === 'general-url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={createdGallery.client_email}
                        className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(createdGallery.client_email, 'email')}
                        className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Access Code</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={createdGallery.access_code}
                        className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded text-sm font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(createdGallery.access_code, 'code')}
                        className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        {copiedField === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">Additional Info</h3>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• Expires: {new Date(createdGallery.expiration_date).toLocaleDateString()}</li>
                  <li>• Downloads: {createdGallery.allow_downloads ? 'Enabled' : 'Disabled'}</li>
                  <li>• Status: {createdGallery.status}</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-neutral-900">Create New Gallery</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bride's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brideName}
                onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Maria"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Groom's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.groomName}
                onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="John"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Client Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Wedding Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.weddingDate}
              onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Welcome Message (Optional)
            </label>
            <textarea
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="A personalized message for your clients..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Expires In (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.expiresInDays}
                onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowDownloads}
                  onChange={(e) => setFormData({ ...formData, allowDownloads: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Allow Downloads</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}