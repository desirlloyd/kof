import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  isMono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, isMono = false, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs md:text-sm font-semibold text-[#FFF6E5] flex items-center justify-between">
            <span>{label}</span>
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-[#A9ABC4] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#171A30] text-[#FFF6E5] placeholder-[#A9ABC4]/50 border-2 border-[#2D3357] rounded-xl px-3.5 py-2.5 text-sm md:text-base outline-none transition-all duration-150 focus:border-[#FFB400] focus:shadow-[3px_3px_0px_#FFB400] ${
              icon ? 'pl-10' : ''
            } ${rightElement ? 'pr-12' : ''} ${isMono ? 'font-mono' : ''} ${
              error ? 'border-[#FF4D6D] focus:border-[#FF4D6D] focus:shadow-[3px_3px_0px_#FF4D6D]' : ''
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2.5 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <span className="text-xs text-[#FF4D6D] font-medium">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
