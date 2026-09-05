import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InteractiveMap } from './InteractiveMap';
import { PropertyCard } from './PropertyCard';
import { Property } from '../types';
import { 
  Navigation, 
  Search, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal 
} from 'lucide-react';

export const FullMapView: React.FC = () => {
  const { 
    filteredProperties, 
    selectedProperty, 
    setSelectedProperty, 
    requestUserLocation, 
    locationLoading, 
    t 
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative h-[calc(100vh-140px)] min-h-[500px] w-full overflow-hidden flex">
      
      {/* Interactive Map taking full container */}
      <div className="flex-1 h-full relative">
        <InteractiveMap
          properties={filteredProperties}
          selectedProperty={selectedProperty}
          onSelectProperty={(p) => setSelectedProperty(p)}
          className="h-full rounded-none border-0"
        />

        {/* Floating Geolocation Button */}
        <button
          onClick={requestUserLocation}
          disabled={locationLoading}
          className="absolute bottom-6 right-6 z-20 p-3 rounded-xl bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md text-slate-800 dark:text-[#e5e5e5] shadow-xl border border-slate-200 dark:border-white/10 hover:border-[#0B3D91] cursor-pointer flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
          title={t('useCurrentLocation')}
        >
          <Navigation className={`w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400 ${locationLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{locationLoading ? 'Recherche GPS...' : t('useCurrentLocation')}</span>
        </button>

        {/* Floating Toggle Sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md text-slate-800 dark:text-[#e5e5e5] hover:text-[#0B3D91] shadow-xl border border-slate-200 dark:border-white/10 hover:border-[#0B3D91] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span>{sidebarOpen ? t('hideMap') : `${t('navProperties')} (${filteredProperties.length})`}</span>
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" /> : <ChevronRight className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" />}
        </button>
      </div>

      {/* Floating or Side Drawer for Properties */}
      {sidebarOpen && (
        <div className="w-full sm:w-96 bg-white dark:bg-[#0f0f0f] border-l border-slate-200 dark:border-white/10 h-full flex flex-col z-20 shadow-2xl transition-all">
          <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {t('navProperties')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#999999] mt-0.5">
                {filteredProperties.length} {filteredProperties.length > 1 ? t('propertiesFound') : t('propertyFound')}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-transparent">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))
            ) : (
              <div className="text-center py-12 px-4 space-y-3">
                <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t('noPropertiesYetTitle')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('noPropertiesYetDesc')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
