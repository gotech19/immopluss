import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Navigation, 
  Home, 
  Building2, 
  Tag, 
  ArrowRight 
} from 'lucide-react';
import { PropertyCategory, TransactionType } from '../types';

export const HeroSection: React.FC = () => {
  const { 
    t, 
    filters, 
    setFilters, 
    setActiveTab, 
    requestUserLocation, 
    locationLoading 
  } = useApp();

  const [expandedFilters, setExpandedFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('properties');
  };

  const handleLocateMe = async () => {
    const loc = await requestUserLocation();
    if (loc) {
      setFilters(prev => ({ ...prev, city: 'Position actuelle' }));
      setActiveTab('map');
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#0B3D91] via-[#093278] to-[#062456] text-white py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-inner">
      
      {/* Background Architectural Accent lines and overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gridPattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#ffffff" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>
      </div>

      {/* Decorative Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        
        {/* Brand Slogan Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FBBF24] text-[11px] sm:text-xs font-bold tracking-wider mb-5 shadow-sm">
          <span>{t('slogan')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
          <span className="text-white font-medium normal-case hidden sm:inline">{t('subSlogan')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight drop-shadow-sm">
          {t('heroTitle')}
        </h1>
        <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Main Search Box Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white text-left">
          
          {/* Transaction Type Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'all' }))}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                filters.transactionType === 'all'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('allTransactions')}
            </button>
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'sale' }))}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                filters.transactionType === 'sale'
                  ? 'bg-[#FBBF24] text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('forSale')}
            </button>
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, transactionType: 'rent' }))}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-all cursor-pointer ${
                filters.transactionType === 'rent'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('forRent')}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Keyword / Search Input */}
              <div className="md:col-span-5 relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" />
                </div>
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 transition-all"
                />
              </div>

              {/* Property Category dropdown */}
              <div className="md:col-span-3">
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value as PropertyCategory | 'all' }))}
                  className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-800 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 transition-all cursor-pointer"
                >
                  <option value="all">{t('allTypes')}</option>
                  <option value="house_villa">{t('catHouses')}</option>
                  <option value="apartment">{t('catApartments')}</option>
                  <option value="land">{t('catLand')}</option>
                  <option value="agricultural_land">{t('catAgriLand')}</option>
                  <option value="commercial">{t('catCommercial')}</option>
                  <option value="warehouse">{t('catWarehouse')}</option>
                  <option value="duplex_studio">{t('catDuplex')}</option>
                </select>
              </div>

              {/* City / Wilaya Input */}
              <div className="md:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                  <MapPin className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
                </div>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder={t('cityPlaceholder')}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 transition-all"
                />
              </div>

              {/* Submit Search Button in Energetic Yellow #FBBF24 */}
              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  id="hero-submit-search-btn"
                  className="w-full py-3 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>{t('searchBtn')}</span>
                </button>
              </div>

            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              
              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={locationLoading}
                className="inline-flex items-center gap-1.5 text-[#0B3D91] dark:text-blue-400 hover:underline font-bold cursor-pointer py-1"
              >
                <Navigation className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                <span>{locationLoading ? 'Recherche GPS...' : t('useCurrentLocation')}</span>
              </button>

              {/* Toggle extra filters */}
              <button
                type="button"
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium py-1 cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{expandedFilters ? t('lessFilters') : t('moreFilters')}</span>
              </button>
            </div>

            {/* Expanded Advanced Filters */}
            {expandedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('minPrice')}</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('maxPrice')}</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('sortBy')}</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] cursor-pointer"
                  >
                    <option value="newest">{t('sortNewest')}</option>
                    <option value="price_asc">{t('sortPriceAsc')}</option>
                    <option value="price_desc">{t('sortPriceDesc')}</option>
                    <option value="surface_desc">{t('sortSurfaceDesc')}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 pb-2">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                      className="rounded-sm border-slate-300 text-[#0B3D91] focus:ring-[#0B3D91]"
                    />
                    <span>{t('verifiedListing')}</span>
                  </label>
                </div>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
};
