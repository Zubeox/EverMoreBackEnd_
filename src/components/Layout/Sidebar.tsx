import React from 'react';
import {
  LayoutDashboard,
  Images,
  Users,
  Settings,
  FileText,
  BarChart3,
  Upload,
  Search,
  FolderOpen,
  UserCheck,
  Handshake,
  MessageSquare,
  Mail
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userEmail?: string;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Табло' },
  { id: 'images', icon: Images, label: 'Галерия' },
  { id: 'galleries', icon: FolderOpen, label: 'Портфолио' },
  { id: 'client-galleries', icon: UserCheck, label: 'Клиентски Галерии' },
  { id: 'partners', icon: Handshake, label: 'Партньори' },
  { id: 'inquiries', icon: MessageSquare, label: 'Запитвания' },
  { id: 'contacts', icon: Mail, label: 'Контакти' },
  { id: 'upload', icon: Upload, label: 'Качване' },
  { id: 'users', icon: Users, label: 'Потребители' },
  { id: 'content', icon: FileText, label: 'Съдържание' },
  { id: 'analytics', icon: BarChart3, label: 'Анализи' },
  { id: 'settings', icon: Settings, label: 'Настройки' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, userEmail }) => {
  return (
    <div className="bg-gradient-to-b from-boho-brown to-boho-rust text-boho-cream w-64 min-h-screen flex flex-col boho-pattern relative">
      {/* Decorative elements */}
      <div className="absolute top-10 right-4 w-8 h-8 border-2 border-boho-warm rounded-full opacity-30"></div>
      <div className="absolute top-32 left-4 w-4 h-4 bg-boho-sage rounded-full opacity-40"></div>
      <div className="absolute bottom-20 right-6 w-6 h-6 border border-boho-dusty rotate-45 opacity-25"></div>
      
      {/* Header */}
      <div className="p-6 border-b border-boho-warm border-opacity-30 relative z-10">
        <h1 className="text-2xl font-bold text-boho-cream boho-heading">Админ Панел</h1>
        <p className="text-boho-warm text-sm mt-1 font-light">Управление на съдържанието</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-boho-warm border-opacity-30 relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-boho-warm w-4 h-4" />
          <input
            type="text"
            placeholder="Търсене..."
            className="w-full bg-boho-cream bg-opacity-20 text-boho-cream placeholder-boho-warm pl-10 pr-4 py-2 rounded-boho border border-boho-warm border-opacity-30 focus:border-boho-sage focus:outline-none backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative z-10">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-boho transition-all duration-300 ${
                    isActive
                      ? 'bg-boho-sage bg-opacity-80 text-boho-cream shadow-lg transform scale-105'
                      : 'text-boho-warm hover:bg-boho-cream hover:bg-opacity-20 hover:text-boho-cream'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium font-boho">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-boho-warm border-opacity-30 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-boho-sage to-boho-dusty rounded-full flex items-center justify-center border-2 border-boho-warm border-opacity-50">
            <span className="text-boho-cream font-semibold font-script text-lg">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'А'}
            </span>
          </div>
          <div>
            <p className="text-boho-cream font-medium font-boho">Админ Потребител</p>
            <p className="text-boho-warm text-sm text-xs truncate max-w-[140px]" title={userEmail}>
              {userEmail || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};