import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Map as MapIcon, 
  Grid, 
  X, 
  Filter 
} from 'lucide-react';
import { PropertyCategory } from '../types';

export const PropertiesListView: React.FC = () => {
  const { 
    properties,
    filteredProperties, 
    filters, 
    setFilters, 
    resetFilters, 
    t, 
    setSelectedProperty,
    setActiveTab
  } = useApp();

  const [showMapSplit, setShowMapSplit] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header Bar */}
      <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Keyword search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#0B3D91] dark:text-blue-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 transition-all"
            />
          </div>

          {/* Transaction Type Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            {(['all', 'sale', 'rent'] as const).map((type) => {
              const isSelected = filters.transactionType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, transactionType: type }))}
                  className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    isSelected
                      ? type === 'sale'
                        ? 'bg-[#FBBF24] text-slate-950 shadow-xs'
                        : 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {type === 'all' ? t('allTransactions') : type === 'sale' ? t('forSale') : t('forRent')}
                </button>
              );
            })}
          </div>

          {/* Property Category Select */}
          <div className="w-full md:w-48">
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value as PropertyCategory | 'all' }))}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20 transition-all cursor-pointer"
            >
              <option value="all">{t('allTypes')}</option>
              <option value="apartment">{t('catApartments')}</option>
              <option value="house_villa">{t('catHouses')}</option>
              <option value="land">{t('catLand')}</option>
              <option value="agricultural_land">{t('catAgriLand')}</option>
              <option value="commercial">{t('catCommercial')}</option>
              <option value="warehouse">{t('catWarehouse')}</option>
            </select>
          </div>

          {/* Controls: Split Map Toggle & Filters Button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowMapSplit(!showMapSplit)}
              className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                showMapSplit 
                  ? 'border-[#0B3D91] bg-blue-50 dark:bg-blue-950/40 text-[#0B3D91] dark:text-blue-400' 
                  : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-700 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
              <span className="hidden sm:inline">{showMapSplit ? t('hideMap') : t('showMap')}</span>
            </button>

            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#181818] dark:hover:bg-[#202020] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#e5e5e5] hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
              <span>{t('filtersBtn')}</span>
            </button>
          </div>

        </div>

        {/* Secondary Filter Drawer */}
        {filterDrawerOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.08] text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-[#999999] mb-1">{t('cityPlaceholder')}</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                placeholder="ex: Alger, Oran, Sétif..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-[#999999] mb-1">{t('minPrice')}</label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || undefined }))}
                placeholder="Min DA"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-[#999999] mb-1">{t('maxPrice')}</label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))}
                placeholder="Max DA"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-[#999999] mb-1">{t('sortBy')}</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white focus:border-[#0B3D91] cursor-pointer"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="price_asc">{t('sortPriceAsc')}</option>
                <option value="price_desc">{t('sortPriceDesc')}</option>
                <option value="surface_desc">{t('sortSurfaceDesc')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('navProperties')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#999999] mt-0.5">
            {filteredProperties.length} {filteredProperties.length > 1 ? t('propertiesFound') : t('propertyFound')}
          </p>
        </div>

        {/* Clear filters button if any filter applied */}
        {(filters.keyword || filters.city || filters.propertyType !== 'all' || filters.transactionType !== 'all') && (
          <button
            onClick={resetFilters}
            className="text-xs font-bold uppercase tracking-wider text-[#0B3D91] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('clearFilters')}</span>
          </button>
        )}
      </div>

      {/* Content Area: Grid or Split Map */}
      {showMapSplit ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24">
            <InteractiveMap 
              properties={filteredProperties} 
              className="h-[600px]"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="bg-white dark:bg-[#121212] rounded-2xl p-10 sm:p-14 text-center border border-slate-200/80 dark:border-white/10 my-8 shadow-sm max-w-lg mx-auto">
          <Search className="w-12 h-12 text-slate-300 dark:text-[#444444] mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {properties.length === 0 ? t('noPropertiesYetTitle') : t('noPropertiesMatch')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#999999] mt-1 max-w-sm mx-auto mb-5">
            {properties.length === 0 ? t('noPropertiesYetDesc') : t('noPropertiesSub')}
          </p>
          {properties.length === 0 ? (
            <button
              onClick={() => setActiveTab('publish')}
              className="px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-95"
            >
              {t('navPublish')}
            </button>
          ) : (
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-95"
            >
              {t('viewAllProperties')}
            </button>
          )}
        </div>
      )}

    </div>
  );
};
