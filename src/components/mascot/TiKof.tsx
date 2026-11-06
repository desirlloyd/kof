import React from 'react';
import { motion } from 'framer-motion';
import type { MascotMood } from '../../types';

interface TiKofProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  bubbleText?: string;
}

export const TiKof: React.FC<TiKofProps> = ({
  mood = 'neutral',
  size = 'md',
  className = '',
  bubbleText,
}) => {
  const sizePx = {
    sm: 48,
    md: 80,
    lg: 120,
    xl: 160,
  }[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center relative ${className}`}>
      {bubbleText && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4 }}
          className="mb-3 px-3 py-2 bg-[#171A30] border-2 border-[#FFB400] text-[#FFF6E5] text-xs md:text-sm font-medium rounded-xl tap-shadow-safran relative max-w-xs text-center"
        >
          {bubbleText}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#FFB400]" />
        </motion.div>
      )}

      <motion.svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          y: mood === 'sleeping' ? [0, 2, 0] : [0, -3, 0],
          rotate: mood === 'happy' ? [0, -2, 2, 0] : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: mood === 'sleeping' ? 3.5 : 2.5,
          ease: 'easeInOut',
        }}
      >
        {/* Poignée / Arceau du coffre */}
        <path
          d="M38 18C38 11.3726 43.3726 6 50 6C56.6274 6 62 11.3726 62 18V24H38V18Z"
          fill="#20243F"
          stroke="#FFB400"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Corps du coffre */}
        <rect
          x="10"
          y="22"
          width="80"
          height="68"
          rx="18"
          fill="#171A30"
          stroke="#FFB400"
          strokeWidth="4"
        />

        {/* Renforts métalliques style tap-tap haïtien */}
        <path
          d="M10 40H90"
          stroke="#20243F"
          strokeWidth="3"
          strokeDasharray="4 4"
        />
        <circle cx="18" cy="30" r="2.5" fill="#19D3C5" />
        <circle cx="82" cy="30" r="2.5" fill="#19D3C5" />
        <circle cx="18" cy="80" r="2.5" fill="#19D3C5" />
        <circle cx="82" cy="80" r="2.5" fill="#19D3C5" />

        {/* Serrure / Nez en losange doré */}
        <polygon
          points="50,48 56,56 50,64 44,56"
          fill="#FFB400"
        />
        <circle cx="50" cy="55" r="2" fill="#0E1020" />
        <path d="M50 56V60" stroke="#0E1020" strokeWidth="1.5" strokeLinecap="round" />

        {/* YEUX & EXPRESSIONS */}
        {mood === 'neutral' && (
          <g>
            {/* Oeil gauche */}
            <circle cx="34" cy="42" r="6" fill="#19D3C5" />
            <circle cx="35.5" cy="40.5" r="2" fill="#FFFFFF" />
            {/* Oeil droit */}
            <circle cx="66" cy="42" r="6" fill="#19D3C5" />
            <circle cx="67.5" cy="40.5" r="2" fill="#FFFFFF" />
            {/* Bouche */}
            <path
              d="M44 72C46.5 75 53.5 75 56 72"
              stroke="#FFF6E5"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}

        {mood === 'happy' && (
          <g>
            {/* Yeux joyeux en arc ^ ^ */}
            <path
              d="M28 44C31 38 37 38 40 44"
              stroke="#B6F23A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M60 44C63 38 69 38 72 44"
              stroke="#B6F23A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Joues roses hibiscus */}
            <circle cx="26" cy="50" r="3.5" fill="#FF4D6D" opacity="0.8" />
            <circle cx="74" cy="50" r="3.5" fill="#FF4D6D" opacity="0.8" />
            {/* Grand sourire */}
            <path
              d="M42 68C44 76 56 76 58 68"
              fill="#FF4D6D"
              stroke="#FFF6E5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Petites étincelles dorées au dessus */}
            <path d="M50 0L51 4L55 5L51 6L50 10L49 6L45 5L49 4Z" fill="#FFB400" />
          </g>
        )}

        {mood === 'worried' && (
          <g>
            {/* Sourcils inquiets */}
            <path d="M28 34L38 38" stroke="#FF4D6D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M72 34L62 38" stroke="#FF4D6D" strokeWidth="2.5" strokeLinecap="round" />
            {/* Yeux ronds inquiets */}
            <circle cx="34" cy="44" r="7" fill="#FFF6E5" />
            <circle cx="34" cy="44" r="3.5" fill="#0E1020" />
            <circle cx="66" cy="44" r="7" fill="#FFF6E5" />
            <circle cx="66" cy="44" r="3.5" fill="#0E1020" />
            {/* Goutte de sueur */}
            <path
              d="M80 34C80 34 83 37 83 39C83 40.6 81.6 42 80 42C78.4 42 77 40.6 77 39C77 37 80 34 80 34Z"
              fill="#19D3C5"
            />
            {/* Bouche tremblante */}
            <path
              d="M43 72Q46 75 50 72Q54 69 57 72"
              stroke="#FF4D6D"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {mood === 'sleeping' && (
          <g>
            {/* Yeux fermés - - */}
            <path d="M28 44H40" stroke="#A9ABC4" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M60 44H72" stroke="#A9ABC4" strokeWidth="3.5" strokeLinecap="round" />
            {/* Bouche relaxée */}
            <ellipse cx="50" cy="71" rx="4" ry="2" fill="#20243F" stroke="#A9ABC4" strokeWidth="2" />
            {/* Lettres Z z z flottantes */}
            <text x="76" y="24" fill="#19D3C5" fontSize="14" fontWeight="bold" fontFamily="monospace">
              z
            </text>
            <text x="86" y="16" fill="#19D3C5" fontSize="11" fontWeight="bold" fontFamily="monospace">
              z
            </text>
          </g>
        )}
      </motion.svg>
    </div>
  );
};
