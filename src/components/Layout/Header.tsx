import React, { useState } from 'react';
import { Bell, Settings, LogOut, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  return (
    <header className="bg-gradient-to-r from-boho-cream to-boho-sand border-b-2 border-boho-brown border-opacity-20 px-6 py-4 boho-pattern">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-boho-brown boho-heading">{title}</h2>
          {subtitle && (
            <p className="text-boho-rust mt-1 font-boho">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-3 text-boho-brown hover:text-boho-rust hover:bg-boho-warm hover:bg-opacity-30 rounded-boho transition-all duration-300 hover:scale-110">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-boho-terracotta rounded-full border border-boho-cream"></span>
          </button>
          
          {/* Settings */}
          <button className="p-3 text-boho-brown hover:text-boho-rust hover:bg-boho-warm hover:bg-opacity-30 rounded-boho transition-all duration-300 hover:scale-110">
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-2 hover:bg-boho-warm hover:bg-opacity-30 rounded-boho transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-boho-sage to-boho-dusty rounded-full flex items-center justify-center border-2 border-boho-brown border-opacity-30">
                <User className="w-4 h-4 text-boho-cream" />
              </div>
              <span className="text-boho-brown font-medium font-boho">Админ</span>
            </button>
          </div>
          
          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            className="p-3 text-boho-brown hover:text-boho-terracotta hover:bg-boho-terracotta hover:bg-opacity-20 rounded-boho transition-all duration-300 hover:scale-110"
            title="Изход"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-boho-brown bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="boho-card rounded-boho p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-boho-brown border-opacity-20">
            <h3 className="text-2xl font-semibold text-boho-brown mb-4 boho-heading">
              Потвърждение за изход
            </h3>
            <p className="text-boho-rust mb-6 font-boho">
              Сигурни ли сте, че искате да излезете от админ панела?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmLogout}
                className="flex-1 boho-button py-3 rounded-boho text-boho-cream font-medium shadow-lg hover:shadow-xl transition-all duration-300 font-boho"
              >
                Да, изход
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 bg-boho-cream bg-opacity-50 text-boho-brown py-3 rounded-boho font-medium border-2 border-boho-brown border-opacity-30 hover:bg-opacity-70 transition-all duration-300 font-boho"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};