import React from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-boho-sage text-boho-sage',
    green: 'bg-boho-dusty text-boho-dusty',
    yellow: 'bg-boho-warm text-boho-warm',
    red: 'bg-boho-terracotta text-boho-terracotta',
    purple: 'bg-boho-rust text-boho-rust',
  };

  return (
    <div className="boho-card rounded-boho p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className="w-full h-full border-2 border-boho-brown rounded-full transform rotate-12"></div>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-boho-rust uppercase tracking-wide font-boho">
            {title}
          </p>
          <p className="text-4xl font-bold text-boho-brown mt-3 boho-heading">
            {value}
          </p>
          
          {trend && (
            <div className={`flex items-center mt-3 text-sm font-boho ${
              trend.isPositive ? 'text-boho-sage' : 'text-boho-terracotta'
            }`}>
              <span className="font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-boho-brown text-opacity-70 ml-1">спрямо миналия месец</span>
            </div>
          )}
        </div>
        
        <div className={`p-4 rounded-boho bg-opacity-20 border-2 border-opacity-30 ${colorClasses[color]}`}>
          <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
};