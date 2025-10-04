import React from 'react';
import { TrendingUp, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface StatsData {
  total: number;
  active: number;
  expiringSoon: number;
  totalViews: number;
}

interface ClientGalleryStatsProps {
  stats: StatsData;
}

export const ClientGalleryStats: React.FC<ClientGalleryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="boho-card rounded-boho p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-blue-100 rounded-boho">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-boho">
            All Galleries
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-boho-brown">{stats.total}</p>
          <p className="text-sm text-boho-rust">Total Galleries</p>
        </div>
      </div>

      <div className="boho-card rounded-boho p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-green-100 rounded-boho">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-boho">
            Active
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-boho-brown">{stats.active}</p>
          <p className="text-sm text-boho-rust">Active Galleries</p>
        </div>
      </div>

      <div className="boho-card rounded-boho p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-yellow-100 rounded-boho">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-boho">
            Attention
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-boho-brown">{stats.expiringSoon}</p>
          <p className="text-sm text-boho-rust">Expiring Soon</p>
        </div>
      </div>

      <div className="boho-card rounded-boho p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-purple-100 rounded-boho">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-boho">
            Engagement
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-boho-brown">{stats.totalViews.toLocaleString()}</p>
          <p className="text-sm text-boho-rust">Total Views</p>
        </div>
      </div>
    </div>
  );
};
