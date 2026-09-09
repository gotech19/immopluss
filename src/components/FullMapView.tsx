import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { PropertyCard } from './PropertyCard';
import { Property, PropertyCategory, TransactionType } from '../types';
import { 
  Navigation, 
  Search, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal,
  X,
  ArrowRight,
  Maximize2,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const FullMapView: React.FC = () => {
  const { 
    filteredProperties = [], 
    selectedProperty, 
    setSelectedProperty, 
    requestUserLocation, 
    locationLoading,
    filters,
    setFilters,
    resetFilters,
    t 
  } = useApp();

  // On mobile (< 768px), default to map view; on desktop/tablet, show sidebar
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchZoneInput, setSearchZoneInput] = useState(filters.city || filters.keyword || '');

  // Quick Algerian cities for instant map exploration
  const popularZones = [
    { label: 'Toutes zones', value: '' },
    { label: 'Alger', value: 'Alger' },
    { label: 'Bab Ezzouar', value: 'Bab Ezzouar' },
    { label: 'Hydra', value: 'Hydra' },
    { label: 'Oran', value: 'Oran' },
    { label: 'Sétif', value: 'Sétif' },
    { label: 'Rouiba', value: 'Rouiba' },
  ];

  const handleZoneSearch = (zoneName: string) => {
    setSearchZoneInput(zoneName);
    setFilters(prev => ({
      ...prev,
      city: zoneName,
      keyword: ''
    }));
  };

  const handleTransactionChange = (type: TransactionType | 'all') => {
    setFilters(prev => ({
      ...prev,
      transactionType: type
    }));
  };

  const handleTypeChange = (type: PropertyCategory | 'all') => {
    setFilters(prev => ({
      ...prev,
      propertyType: type
    }));
  };

  const activeFiltersCount = 
    (filters.transactionType !== 'all' ? 1 : 0) +
    (filters.propertyType !== 'all' ? 1 : 0) +
    (filters.city ? 1 : 0) +
    ((filters.minPrice && filters.minPrice > 0) || (filters.maxPrice && filters.maxPrice > 0) ? 1 : 0) +
    ((filters.minSurface && filters.minSurface > 0) || (filters.maxSurface && filters.maxSurface > 0) ? 1 : 0) +
    (filters.bedrooms && filters.bedrooms !== 'all' ? 1 : 0);

  return (
    <div className="relative h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-5rem-4.5rem)] lg:h-[calc(100vh-5rem)] min-h-[460px] w-full overflow-hidden flex flex-col">
      
      {/* Top Floating Map Search & Filters Toolbar */}
      <div className="z-20 bg-slate-900/95 backdrop-blur-md border-b border-white/10 px-3 py-2.5 sm:px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          
          {/* Search Input for Ville / Quartier / Zone */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
            <input
              type="text"
              value={searchZoneInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchZoneInput(val);
                setFilters(prev => ({ ...prev, city: val }));
              }}
              placeholder="Rechercher par ville, quartier ou zone (ex: Alger, Bab Ezzouar, Oran...)"
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-white/15 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {searchZoneInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchZoneInput('');
                  setFilters(prev => ({ ...prev, city: '' }));
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Controls (Vente / Location & Types) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            
            {/* Vente / Location */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => handleTransactionChange('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filters.transactionType === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => handleTransactionChange('sale')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filters.transactionType === 'sale'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Vente
              </button>
              <button
                type="button"
                onClick={() => handleTransactionChange('rent')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filters.transactionType === 'rent'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Location
              </button>
            </div>

            {/* Property Category Select */}
            <select
              value={filters.propertyType || 'all'}
              onChange={(e) => handleTypeChange(e.target.value as any)}
              className="bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-rose-500 shrink-0 cursor-pointer"
            >
              <option value="all">Tous types</option>
              <option value="house_villa">Villa</option>
              <option value="apartment">Appartement</option>
              <option value="land">Terrain</option>
              <option value="warehouse">Hangar</option>
              <option value="commercial">Local commercial</option>
              <option value="office">Bureau</option>
            </select>

            {/* More Filters button (Prix, Surface, Pièces) */}
            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-white/10 text-slate-200 hover:border-white/30'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Reset Filters button if any active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchZoneInput('');
                  resetFilters();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Réinitialiser les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Result count pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-xl border border-white/10 text-xs text-slate-300 shrink-0 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span><strong>{filteredProperties.length}</strong> {filteredProperties.length > 1 ? 'biens' : 'bien'}</span>
            </div>
          </div>
        </div>

        {/* Quick Algerian Zones Chips */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Zones populaires :</span>
          {popularZones.map(zone => {
            const isSelected = (!zone.value && !filters.city) || (filters.city?.toLowerCase() === zone.value.toLowerCase());
            return (
              <button
                key={zone.label}
                type="button"
                onClick={() => handleZoneSearch(zone.value)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-rose-600 text-white font-bold shadow-xs' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/5'
                }`}
              >
                {zone.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map + Drawer Area */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Interactive Map taking full area */}
        <div className="flex-1 h-full relative">
          <InteractiveMap
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(p) => setSelectedProperty(p)}
            className="h-full rounded-none border-0"
          />

          {/* Feature Badge: Innovation ImmoPlus Map Effect Explanation */}
          <div className="hidden md:flex absolute top-3 left-3 z-20 items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-rose-500/30 text-white text-[11px] shadow-xl pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 immoplus-radar-ring" />
            <span><strong>Innovation ImmoPlus :</strong> Zoomez vers un point rouge 📍 pour voir apparaître sa photo et ses détails !</span>
          </div>

          {/* Floating Geolocation Button */}
          <button
            onClick={requestUserLocation}
            disabled={locationLoading}
            className="absolute bottom-20 sm:bottom-6 right-3 sm:right-6 z-20 p-2.5 sm:p-3 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-white/15 hover:border-rose-500 cursor-pointer flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
            title={t('useCurrentLocation')}
          >
            <Navigation className={`w-4 h-4 text-rose-500 ${locationLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locationLoading ? 'Recherche GPS...' : t('useCurrentLocation')}</span>
          </button>

          {/* Floating Toggle Sidebar button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute bottom-20 sm:bottom-6 left-3 sm:left-4 z-20 p-2 sm:p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white hover:text-rose-400 shadow-2xl border border-white/15 hover:border-rose-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>{sidebarOpen ? 'Masquer la liste' : `Liste (${filteredProperties.length})`}</span>
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-rose-500" /> : <ChevronRight className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Floating Selected Property Bottom Card (Requirement #4: En cliquant sur le bien, une fiche résumée apparaît) */}
          {selectedProperty && (
            <div className="absolute bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-25 w-[94vw] sm:w-[420px] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-rose-500/60 shadow-2xl p-3 flex gap-3 relative backdrop-blur-lg">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white z-10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div 
                  className="w-28 h-28 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative cursor-pointer group"
                  onClick={() => setSelectedProperty(selectedProperty)}
                >
                  <img
                    src={selectedProperty.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    {selectedProperty.transactionType === 'sale' ? 'Vente' : 'Location'}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-bold text-sm text-white truncate">
                      {selectedProperty.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-400 truncate mt-0.5">
                      <span className="text-rose-500">📍</span>
                      <span className="truncate">
                        {selectedProperty.location?.neighborhood ? `${selectedProperty.location.neighborhood}, ${selectedProperty.location.city}` : selectedProperty.location?.city}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-amber-400 mt-1">
                      {selectedProperty.price?.toLocaleString('fr-FR')} {selectedProperty.currency || 'DA'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span>📐 {selectedProperty.surface || 0} m²</span>
                      {selectedProperty.bedrooms ? <span>• 🛏 {selectedProperty.bedrooms} ch.</span> : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).__immoplusOpenProp) {
                        (window as any).__immoplusOpenProp(selectedProperty.id);
                      } else {
                        setSelectedProperty(selectedProperty);
                      }
                    }}
                    className="mt-2 w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Voir le bien</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Side Drawer with Property Cards */}
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-25 bg-black/50 backdrop-blur-xs"
            />

            <div className="fixed lg:relative inset-y-0 right-0 z-30 w-[88vw] sm:w-96 bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl transition-all animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t('navProperties')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {filteredProperties.length} {filteredProperties.length > 1 ? t('propertiesFound') : t('propertyFound')}
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((prop) => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))
                ) : (
                  <div className="text-center py-16 px-4 space-y-3">
                    <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-300">
                      Aucun bien dans cette zone
                    </p>
                    <p className="text-xs text-slate-500">
                      Essayez d'élargir vos filtres ou de sélectionner une autre ville.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchZoneInput('');
                        resetFilters();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Advanced Filters Modal (Prix, Surface, Pièces...) */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-lg text-white">Filtres de recherche</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prix Min / Max */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Fourchette de prix (DA)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Min</span>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Max</span>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Illimité"
                    className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-white/15 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Surface Min / Max */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Surface (m²)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Min</span>
                  <input
                    type="number"
                    value={filters.minSurface || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minSurface: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="0 m²"
                    className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Max</span>
                  <input
                    type="number"
                    value={filters.maxSurface || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxSurface: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Illimité"
                    className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-white/15 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Nombre de pièces / chambres */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nombre de pièces / chambres minimum
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['all', '1', '2', '3', '4'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, bedrooms: val }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      (filters.bedrooms || 'all') === val
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {val === 'all' ? 'Tous' : `${val}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/15 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg cursor-pointer transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
