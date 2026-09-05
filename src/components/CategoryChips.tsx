import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCategory } from '../types';

export const CategoryChips: React.FC = () => {
  const { t, filters, setFilters, setActiveTab } = useApp();

  const categories: { id: PropertyCategory; label: string; icon: React.ReactNode }[] = [
    {
      id: 'house_villa',
      label: t('catHouses'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chimney */}
          <rect x="30" y="10" width="4" height="8" rx="1" fill="#FBBF24" />
          {/* Main Roof */}
          <path d="M 24 8 L 8 22 L 12 24 L 24 13 L 36 24 L 40 22 Z" fill="#0B3D91" />
          {/* Main House Body */}
          <rect x="13" y="22" width="22" height="18" rx="2" fill="#0B3D91" />
          {/* 4 Yellow Windows */}
          <rect x="17" y="26" width="5" height="5" rx="1" fill="#FBBF24" />
          <rect x="26" y="26" width="5" height="5" rx="1" fill="#FBBF24" />
          <rect x="17" y="33" width="5" height="5" rx="1" fill="#FBBF24" />
          <rect x="26" y="33" width="5" height="5" rx="1" fill="#FBBF24" />
        </svg>
      )
    },
    {
      id: 'apartment',
      label: t('catApartments'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Building Frame */}
          <rect x="12" y="8" width="24" height="34" rx="2" fill="#0B3D91" />
          {/* Grid of yellow windows */}
          <rect x="16" y="13" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="22" y="13" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="28" y="13" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="16" y="20" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="22" y="20" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="28" y="20" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="16" y="27" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="22" y="27" width="4" height="4" rx="0.5" fill="#FBBF24" />
          <rect x="28" y="27" width="4" height="4" rx="0.5" fill="#FBBF24" />
          {/* Main Entrance Door */}
          <rect x="21" y="34" width="6" height="8" rx="1" fill="#FBBF24" />
        </svg>
      )
    },
    {
      id: 'land',
      label: t('catLand'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Yellow Map Pin Location Marker */}
          <path d="M 24 6 C 18 6 13 11 13 17 C 13 24 24 33 24 33 C 24 33 35 24 35 17 C 35 11 30 6 24 6 Z" fill="#FBBF24" />
          <circle cx="24" cy="16" r="4.5" fill="#0B3D91" />
          {/* Blue Land Plot Lines */}
          <path d="M 8 36 L 40 36 M 12 40 L 36 40 M 18 44 L 30 44" stroke="#0B3D91" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'agricultural_land',
      label: t('catAgriLand'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Yellow Soil Ground Curve */}
          <ellipse cx="24" cy="38" rx="16" ry="4" fill="#FBBF24" />
          {/* Blue Sprout Stem */}
          <path d="M 24 38 L 24 18" stroke="#0B3D91" strokeWidth="3" strokeLinecap="round" />
          {/* Blue Sprout Leaves */}
          <path d="M 24 26 C 19 20 11 23 15 29 C 19 31 22 28 24 26 Z" fill="#0B3D91" />
          <path d="M 24 20 C 29 14 37 17 33 23 C 29 25 26 22 24 20 Z" fill="#0B3D91" />
          {/* Yellow Sun */}
          <circle cx="24" cy="12" r="3.5" fill="#FBBF24" />
        </svg>
      )
    },
    {
      id: 'commercial',
      label: t('catCommercial'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Store Awning with Blue & Yellow contrast */}
          <path d="M 8 18 L 40 18 L 37 10 L 11 10 Z" fill="#0B3D91" />
          <path d="M 8 18 Q 12 23 16 18 Q 20 23 24 18 Q 28 23 32 18 Q 36 23 40 18" fill="none" stroke="#FBBF24" strokeWidth="2.5" />
          {/* Shop Body */}
          <rect x="11" y="20" width="26" height="20" rx="1.5" fill="#0B3D91" />
          {/* Shop Window Display */}
          <rect x="14" y="24" width="10" height="12" rx="1" fill="#FBBF24" />
          {/* Shop Door */}
          <rect x="27" y="24" width="7" height="16" rx="1" fill="#FBBF24" />
        </svg>
      )
    },
    {
      id: 'warehouse',
      label: t('catWarehouse'),
      icon: (
        <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Warehouse Gable Body */}
          <path d="M 6 22 L 24 12 L 42 22 L 42 39 L 6 39 Z" fill="#0B3D91" />
          {/* Industrial Garage Gate Frame */}
          <rect x="16" y="24" width="16" height="15" rx="1" fill="#FBBF24" />
          {/* Corrugation Lines */}
          <line x1="18" y1="27" x2="30" y2="27" stroke="#0B3D91" strokeWidth="1.8" />
          <line x1="18" y1="31" x2="30" y2="31" stroke="#0B3D91" strokeWidth="1.8" />
          <line x1="18" y1="35" x2="30" y2="35" stroke="#0B3D91" strokeWidth="1.8" />
        </svg>
      )
    }
  ];

  const handleSelect = (catId: PropertyCategory) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType === catId ? 'all' : catId
    }));
    setActiveTab('properties');
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = filters.propertyType === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-${cat.id}`}
                onClick={() => handleSelect(cat.id)}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all text-center group cursor-pointer ${
                  isSelected
                    ? 'border-[#0B3D91] bg-white dark:bg-slate-900 ring-2 ring-[#0B3D91]/20 shadow-md scale-102'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0B3D91]/40 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                <div className="mb-2.5 transition-transform group-hover:scale-110 flex items-center justify-center">
                  {cat.icon}
                </div>
                <span className={`text-xs sm:text-sm font-semibold tracking-tight leading-snug ${
                  isSelected ? 'text-[#0B3D91] dark:text-blue-400 font-bold' : 'text-slate-800 dark:text-slate-200 group-hover:text-[#0B3D91]'
                }`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
