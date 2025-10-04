import { useState } from 'react';
import { ClientGallery } from '../../types';
import { ClientGalleryList } from '../ClientGallery/ClientGalleryList';
import { ClientGalleryForm } from '../ClientGallery/ClientGalleryForm';
import { ClientGalleryDetails } from '../ClientGallery/ClientGalleryDetails';

export default function ClientGalleryManagement() {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedGallery, setSelectedGallery] = useState<ClientGallery | null>(null);

  const handleCreateGallery = () => {
    setSelectedGallery(null);
    setView('form');
  };

  const handleEditGallery = (gallery: ClientGallery) => {
    setSelectedGallery(gallery);
    setView('form');
  };

  const handleViewDetails = (gallery: ClientGallery) => {
    setSelectedGallery(gallery);
    setView('details');
  };

  const handleSave = () => {
    setView('list');
    setSelectedGallery(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedGallery(null);
  };

  const handleBack = () => {
    setView('list');
  };

  switch (view) {
    case 'form':
      return (
        <ClientGalleryForm
          gallery={selectedGallery || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      );
    case 'details':
      return selectedGallery ? (
        <ClientGalleryDetails gallery={selectedGallery} onBack={handleBack} />
      ) : null;
    case 'list':
    default:
      return (
        <ClientGalleryList
          onCreateGallery={handleCreateGallery}
          onEditGallery={handleEditGallery}
          onViewDetails={handleViewDetails}
        />
      );
  }
}