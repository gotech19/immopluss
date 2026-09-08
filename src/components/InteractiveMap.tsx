import React, { useState } from 'react';
import { Property } from '../types';
import { GoogleMapsView } from './GoogleMapsView';
import { LeafletMapView } from './LeafletMapView';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { Layers, Map as MapIcon, Globe, MapPin } from 'lucide-react';

interface InteractiveMapProps {
  properties?: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (p: Property) => void;
  // Picker mode for Publish Wizard
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number };
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties = [],
  selectedProperty,
  onSelectProperty,
  isPickerMode = false,
  pickerCoordinates,
  onCoordinatesChange,
  className = 'h-[500px]'
}) => {
  const [provider, setProvider] = useState<'google' | 'leaflet'>(() => {
    return GOOGLE_MAPS_API_KEY ? 'google' : 'leaflet';
  });
  const [googleMapType, setGoogleMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');


  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] ${className}`}>
      
      {/* Top Map Switcher & Type Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#121212]/90 backdrop-blur-md p-1 rounded-xl border border-white/15 shadow-xl">
        {/* Provider Switcher */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setProvider('google')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              provider === 'google'
                ? 'bg-[#c5a36c] text-[#0a0a0a] shadow-md'
                : 'text-[#aaaaaa] hover:text-white'
            }`}
            title="Google Maps Platform"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </button>
          <button
            type="button"
            onClick={() => setProvider('leaflet')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              provider === 'leaflet'
                ? 'bg-[#c5a36c] text-[#0a0a0a] shadow-md'
                : 'text-[#aaaaaa] hover:text-white'
            }`}
            title="OpenStreetMap / CartoDB"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plan OSM</span>
          </button>
        </div>

        {/* Google Maps View Type (Roadmap / Satellite) */}
        {provider === 'google' && (
          <div className="flex items-center pl-1 border-l border-white/10">
            <button
              type="button"
              onClick={() =>
                setGoogleMapType(prev => (prev === 'roadmap' ? 'hybrid' : 'roadmap'))
              }
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                googleMapType === 'hybrid'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-[#cccccc]'
              }`}
              title={googleMapType === 'hybrid' ? 'Basculer en vue Plan' : 'Basculer en vue Satellite'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">
                {googleMapType === 'hybrid' ? 'Satellite' : 'Plan'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Picker Mode Instruction Banner */}
      {isPickerMode && (
        <div className="absolute top-3 left-3 z-20 max-w-[calc(100%-190px)] sm:max-w-md bg-[#121212]/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium text-[#e5e5e5] shadow-2xl border border-[#c5a36c]/40 pointer-events-none flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#c5a36c] shrink-0" />
          <span className="truncate">Cliquez sur la carte ou déplacez le repère pour positionner votre bien</span>
        </div>
      )}

      {/* Render Map Implementation */}
      {provider === 'google' ? (
        <GoogleMapsView
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
          isPickerMode={isPickerMode}
          pickerCoordinates={pickerCoordinates}
          onCoordinatesChange={onCoordinatesChange}
          mapType={googleMapType}
          onFallbackToLeaflet={() => setProvider('leaflet')}
        />
      ) : (
        <LeafletMapView
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={onSelectProperty}
          isPickerMode={isPickerMode}
          pickerCoordinates={pickerCoordinates}
          onCoordinatesChange={onCoordinatesChange}
        />
      )}
    </div>
  );
};
