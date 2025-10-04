import React from 'react';
import { Calendar, TrendingUp, Users, Filter } from 'lucide-react';

interface FilterState {
  search: string;
  status: 'all' | 'active' | 'expired' | 'expiring_soon' | 'new';
  sortBy: 'created_desc' | 'created_asc' | 'wedding_date' | 'expiration' | 'views' | 'name';
  dateRange: { start: string; end: string } | null;
}

interface ClientGalleryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const ClientGalleryFilters: React.FC<ClientGalleryFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleStatusChange = (status: FilterState['status']) => {
    onFiltersChange({ ...filters, status });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleDateRangeChange = (start: string, end: string) => {
    onFiltersChange({
      ...filters,
      dateRange: start && end ? { start, end } : null
    });
  };

  const clearDateRange = () => {
    onFiltersChange({ ...filters, dateRange: null });
  };

  return (
    <div className="mb-6 p-4 bg-boho-warm bg-opacity-10 rounded-boho border border-boho-brown border-opacity-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-boho-brown mb-2">
            Status Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'expiring_soon', label: 'Expiring Soon' },
              { value: 'expired', label: 'Expired' },
              { value: 'new', label: 'New' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value as FilterState['status'])}
                className={`px-3 py-1.5 rounded-boho text-sm font-medium transition-all ${
                  filters.status === value
                    ? 'bg-boho-sage text-boho-cream'
                    : 'bg-boho-sage bg-opacity-20 text-boho-brown hover:bg-opacity-30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-boho-brown mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
            className="w-full px-4 py-2 border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="wedding_date">Wedding Date</option>
            <option value="expiration">Expiration Date</option>
            <option value="views">Most Viewed</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-boho-brown mb-2">
            Wedding Date Range
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange(e.target.value, filters.dateRange?.end || '')}
              className="flex-1 px-3 py-2 text-sm border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              placeholder="Start"
            />
            <span className="text-boho-rust">to</span>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange(filters.dateRange?.start || '', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-boho-brown border-opacity-30 rounded-boho focus:outline-none focus:border-boho-sage"
              placeholder="End"
            />
            {filters.dateRange && (
              <button
                onClick={clearDateRange}
                className="px-2 py-2 text-boho-rust hover:text-boho-terracotta transition-all"
                title="Clear date range"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
