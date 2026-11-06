import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'turquoise' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#FFB400] text-[#0E1020] border-2 border-[#FFB400] hover:bg-[#ffbe1a] shadow-[4px_4px_0px_#171A30]',
    secondary:
      'bg-[#171A30] text-[#FFF6E5] border-2 border-[#2D3357] hover:border-[#FFB400] shadow-[4px_4px_0px_rgba(0,0,0,0.5)]',
    turquoise:
      'bg-[#19D3C5] text-[#0E1020] border-2 border-[#19D3C5] hover:bg-[#20e2d4] shadow-[4px_4px_0px_#171A30]',
    danger:
      'bg-[#FF4D6D] text-white border-2 border-[#FF4D6D] hover:bg-[#ff617d] shadow-[4px_4px_0px_#171A30]',
    ghost:
      'bg-transparent text-[#A9ABC4] hover:text-[#FFF6E5] hover:bg-[#171A30]/60 border-2 border-transparent',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px' }}
      transition={{ duration: 0.1 }}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer select-none transition-colors duration-150 font-display disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </motion.button>
  );
};
