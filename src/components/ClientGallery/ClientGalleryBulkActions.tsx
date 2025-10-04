import React, { useState } from 'react';
import { Trash2, Clock, X, Mail } from 'lucide-react';

interface ClientGalleryBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkExtend: (days: number) => void;
  onClearSelection: () => void;
}

export const ClientGalleryBulkActions: React.FC<ClientGalleryBulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkExtend,
  onClearSelection
}) => {
  const [showExtendOptions, setShowExtendOptions] = useState(false);

  const handleExtend = (days: number) => {
    onBulkExtend(days);
    setShowExtendOptions(false);
  };

  return (
    <div className="mb-6 p-4 bg-boho-sage bg-opacity-10 rounded-boho border border-boho-sage border-opacity-30 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-boho-sage text-boho-cream rounded-full flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-boho-brown font-medium">
            {selectedCount} {selectedCount === 1 ? 'gallery' : 'galleries'} selected
          </span>
        </div>

        <div className="h-6 w-px bg-boho-brown bg-opacity-20"></div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowExtendOptions(!showExtendOptions)}
              className="px-4 py-2 bg-boho-sage bg-opacity-20 text-boho-brown rounded-boho hover:bg-opacity-30 transition-all flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Extend Expiration</span>
            </button>

            {showExtendOptions && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-boho shadow-lg border border-boho-brown border-opacity-20 py-2 z-10 min-w-[200px]">
                <button
                  onClick={() => handleExtend(30)}
                  className="w-full px-4 py-2 text-left text-boho-brown hover:bg-boho-warm hover:bg-opacity-20 transition-all"
                >
                  Extend by 30 days
                </button>
                <button
                  onClick={() => handleExtend(60)}
                  className="w-full px-4 py-2 text-left text-boho-brown hover:bg-boho-warm hover:bg-opacity-20 transition-all"
                >
                  Extend by 60 days
                </button>
                <button
                  onClick={() => handleExtend(90)}
                  className="w-full px-4 py-2 text-left text-boho-brown hover:bg-boho-warm hover:bg-opacity-20 transition-all"
                >
                  Extend by 90 days
                </button>
                <button
                  onClick={() => handleExtend(180)}
                  className="w-full px-4 py-2 text-left text-boho-brown hover:bg-boho-warm hover:bg-opacity-20 transition-all"
                >
                  Extend by 6 months
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onBulkDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-boho hover:bg-red-200 transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      </div>

      <button
        onClick={onClearSelection}
        className="p-2 text-boho-rust hover:text-boho-terracotta transition-all"
        title="Clear selection"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
