import React from 'react';
import { useApp } from '../context/AppContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'white';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSlogan = false, 
  showSubtitle = false,
  variant = 'light',
  className = '',
  onClick 
}) => {
  const { t } = useApp();

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const isWhiteText = variant === 'white' || variant === 'dark';

  return (
    <div 
      id="immoplus-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none transition-transform active:scale-95 ${className}`}
    >
      {/* SVG Icon matching exact WhatsApp flyer pin + house + orbit */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient id="logoPinGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="45%" stopColor="#FBBF24" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="logoOrbitGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0B3D91" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#0B3D91" />
            </linearGradient>
            <linearGradient id="logoInnerSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* 3D Orbit Swoosh Underneath Pin */}
          <path
            d="M 14 74 C 14 66, 86 66, 86 74 C 86 84, 14 84, 14 74 Z"
            fill="none"
            stroke="url(#logoOrbitGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M 28 75 C 28 70, 72 70, 72 75 C 72 80, 28 80, 28 75 Z"
            fill="none"
            stroke="url(#logoInnerSwoosh)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Yellow Map Pin */}
          <path 
            d="M 50 8 C 30.5 8 15 23.5 15 42 C 15 60.5 41 83 48.2 88.6 C 49.3 89.4 50.7 89.4 51.8 88.6 C 59 83 85 60.5 85 42 C 85 23.5 69.5 8 50 8 Z" 
            fill="url(#logoPinGrad)" 
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
          />

          {/* White Circular Medallion inside Pin */}
          <circle cx="50" cy="40" r="23.5" fill="#FFFFFF" />

          {/* Deep Navy House Silhouette inside (#0B3D91) */}
          {/* Chimney */}
          <rect x="58.5" y="25" width="4.2" height="9" rx="0.8" fill="#0B3D91" />
          {/* Roof */}
          <path d="M 50 22 L 32.5 38 L 36.5 40.5 L 50 27 L 63.5 40.5 L 67.5 38 Z" fill="#0B3D91" />
          {/* House body */}
          <path d="M 37.5 38 L 62.5 38 L 62.5 56 C 62.5 57 61.5 58 60.5 58 L 39.5 58 C 38.5 58 37.5 57 37.5 56 Z" fill="#0B3D91" />

          {/* 4-Square Yellow Windows (#FBBF24) */}
          <rect x="45" y="42" width="3.8" height="3.8" rx="0.6" fill="#FBBF24" />
          <rect x="51.2" y="42" width="3.8" height="3.8" rx="0.6" fill="#FBBF24" />
          <rect x="45" y="48.2" width="3.8" height="3.8" rx="0.6" fill="#FBBF24" />
          <rect x="51.2" y="48.2" width="3.8" height="3.8" rx="0.6" fill="#FBBF24" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-bold tracking-tight flex items-baseline ${textSizes[size]}`}>
          <span className={`${isWhiteText ? 'text-white' : 'text-[#0B3D91] dark:text-white'} font-black transition-colors`}>
            Immo
          </span>
          <span className="text-[#F59E0B] font-black">
            Plus
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#0B3D91] dark:text-blue-300 tracking-wider uppercase mt-1">
            <span>{t('slogan')}</span>
          </div>
        )}

        {showSlogan && !showSubtitle && (
          <span className={`text-[10px] font-medium tracking-wide mt-1 ${isWhiteText ? 'text-blue-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {t('subSlogan')}
          </span>
        )}
      </div>
    </div>
  );
};
