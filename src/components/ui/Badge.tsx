import React from 'react';
import type { VaultCategory } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: VaultCategory | 'safran' | 'turquoise' | 'hibiscus' | 'lime' | 'default';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-[#20243F] text-[#A9ABC4] border-[#2D3357]',
    safran: 'bg-[#FFB400]/15 text-[#FFB400] border-[#FFB400]/40',
    turquoise: 'bg-[#19D3C5]/15 text-[#19D3C5] border-[#19D3C5]/40',
    hibiscus: 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/40',
    lime: 'bg-[#B6F23A]/15 text-[#B6F23A] border-[#B6F23A]/40',
    login: 'bg-[#19D3C5]/15 text-[#19D3C5] border-[#19D3C5]/50',
    card: 'bg-[#FFB400]/15 text-[#FFB400] border-[#FFB400]/50',
    note: 'bg-[#B6F23A]/15 text-[#B6F23A] border-[#B6F23A]/50',
    server: 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/50',
    identity: 'bg-purple-500/15 text-purple-300 border-purple-500/50',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
        variantStyles[variant] || variantStyles.default
      } ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
