import React, { useEffect, useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  useMap, 
  useApiLoadingStatus, 
  APILoadingStatus 
} from '@vis.gl/react-google-maps';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { 
  GOOGLE_MAPS_API_KEY, 
  GMP_ATTRIBUTION_ID, 
  GOOGLE_MAPS_MAP_ID, 
  DEFAULT_MAP_CENTER 
} from '../config/maps';
import { AlertCircle, Layers, RefreshCw } from 'lucide-react';

interface GoogleMapsViewProps {
  properties?: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (p: Property) => void;
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number };
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  onFallbackToLeaflet?: () => void;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

// Controller component to handle camera movements and bounds fitting
const MapCameraController: React.FC<{
  properties: Property[];
  selectedProperty?: Property | null;
  pickerCoordinates?: { lat: number; lng: number };
  isPickerMode?: boolean;
}> = ({ properties, selectedProperty, pickerCoordinates, isPickerMode }) => {
  const map = useMap();

  // Pan to picker coordinates
  useEffect(() => {
    if (!map || !isPickerMode || !pickerCoordinates) return;
    map.panTo({ lat: pickerCoordinates.lat, lng: pickerCoordinates.lng });
  }, [map, isPickerMode, pickerCoordinates?.lat, pickerCoordinates?.lng]);

  // Pan to selected property
  useEffect(() => {
    if (!map || !selectedProperty?.location?.lat || !selectedProperty?.location?.lng) return;
    map.panTo({
      lat: selectedProperty.location.lat,
      lng: selectedProperty.location.lng
    });
    map.setZoom(15);
  }, [map, selectedProperty]);

  // Fit bounds to properties
  useEffect(() => {
    if (!map || isPickerMode || selectedProperty) return;
    const validProps = properties.filter(
      p => p?.location?.lat && p?.location?.lng && !isNaN(p.location.lat) && !isNaN(p.location.lng)
    );

    if (validProps.length === 0) return;

    if (validProps.length === 1) {
      map.panTo({
        lat: validProps[0].location.lat,
        lng: validProps[0].location.lng
      });
      map.setZoom(13);
      return;
    }

    try {
      const bounds = new google.maps.LatLngBounds();
      validProps.forEach(p => {
        bounds.extend({ lat: p.location.lat, lng: p.location.lng });
      });
      map.fitBounds(bounds, 50);
    } catch {
      // ignore if google is not yet defined
    }
  }, [map, properties, selectedProperty, isPickerMode]);

  return null;
};

// Component inside APIProvider to check loading status
const MapContent: React.FC<GoogleMapsViewProps> = ({
  properties = [],
  selectedProperty,
  onSelectProperty,
  isPickerMode = false,
  pickerCoordinates,
  onCoordinatesChange,
  onFallbackToLeaflet,
  mapType = 'roadmap'
}) => {
  const status = useApiLoadingStatus();
  const { setSelectedProperty } = useApp();

  const firstValidProp = properties.find(p => p?.location?.lat && p?.location?.lng);
  const initialCenter = {
    lat: pickerCoordinates?.lat || firstValidProp?.location.lat || DEFAULT_MAP_CENTER.lat,
    lng: pickerCoordinates?.lng || firstValidProp?.location.lng || DEFAULT_MAP_CENTER.lng
  };

  // Format price for markers
  const formatPrice = (price: number, currency: string) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M ${currency}`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}k ${currency}`;
    return `${price} ${currency}`;
  };

  // If loading failed (e.g. billing not enabled on key or network issue)
  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-[#121212] text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base font-serif font-bold text-white mb-2">
          Initialisation Google Maps Platform
        </h4>
        <p className="text-xs text-[#aaaaaa] max-w-md leading-relaxed mb-4">
          La clé API fournie nécessite l'activation de la <strong>facturation (Billing)</strong> sur votre console Google Cloud pour autoriser l'affichage des tuiles Google Maps.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onFallbackToLeaflet && (
            <button
              onClick={onFallbackToLeaflet}
              className="px-4 py-2.5 bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Afficher la carte alternative (OpenStreetMap)</span>
            </button>
          )}
          <a
            href="https://console.cloud.google.com/project/_/billing/enable"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all"
          >
            Activer la facturation Google Cloud
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={initialCenter}
        defaultZoom={isPickerMode ? 14 : 7}
        mapId={GOOGLE_MAPS_MAP_ID}
        mapTypeId={mapType}
        gestureHandling="greedy"
        disableDefaultUI={false}
        streetViewControl={true}
        mapTypeControl={true}
        fullscreenControl={false}
        internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
        onClick={(e) => {
          if (isPickerMode && e.detail.latLng && onCoordinatesChange) {
            onCoordinatesChange({
              lat: e.detail.latLng.lat,
              lng: e.detail.latLng.lng
            });
          }
        }}
      >
        <MapCameraController
          properties={properties}
          selectedProperty={selectedProperty}
          pickerCoordinates={pickerCoordinates}
          isPickerMode={isPickerMode}
        />

        {/* Picker Mode Draggable Marker */}
        {isPickerMode && pickerCoordinates && (
          <AdvancedMarker
            position={{ lat: pickerCoordinates.lat, lng: pickerCoordinates.lng }}
            draggable={true}
            onDragEnd={(e) => {
              if (e.latLng && onCoordinatesChange) {
                onCoordinatesChange({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                });
              }
            }}
            title="Déplacez ce repère pour localiser le bien"
          >
            <div className="relative cursor-grab active:cursor-grabbing group">
              <div className="w-9 h-9 bg-[#c5a36c] border-2 border-white rounded-full rounded-br-none -rotate-45 shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110">
                <div className="w-3 h-3 bg-[#0a0a0a] rounded-full rotate-45" />
              </div>
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow border border-white/20 pointer-events-none">
                Bien à publier
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Property Markers */}
        {!isPickerMode &&
          properties.map((prop) => {
            if (
              !prop?.location ||
              typeof prop.location.lat !== 'number' ||
              typeof prop.location.lng !== 'number' ||
              isNaN(prop.location.lat) ||
              isNaN(prop.location.lng)
            ) {
              return null;
            }

            const isSelected = selectedProperty?.id === prop.id;
            const priceText = formatPrice(prop.price || 0, prop.currency || 'DA');

            return (
              <AdvancedMarker
                key={prop.id}
                position={{ lat: prop.location.lat, lng: prop.location.lng }}
                onClick={() => {
                  if (onSelectProperty) {
                    onSelectProperty(prop);
                  } else {
                    setSelectedProperty(prop);
                  }
                }}
                zIndex={isSelected ? 100 : 10}
                title={prop.title}
              >
                <div
                  className={`cursor-pointer px-2.5 py-1.5 rounded-full font-bold text-[11px] tracking-wide shadow-xl flex items-center gap-1.5 transition-all duration-200 transform hover:scale-105 select-none ${
                    isSelected
                      ? 'bg-[#c5a36c] text-[#0a0a0a] border-2 border-white scale-110 shadow-2xl'
                      : 'bg-[#141414]/95 text-[#c5a36c] border border-[#c5a36c]/60 hover:bg-[#1f1f1f]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#0a0a0a]' : 'bg-[#c5a36c]'
                    }`}
                  />
                  <span>{priceText}</span>
                </div>
              </AdvancedMarker>
            );
          })}
      </Map>
    </div>
  );
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = (props) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-[#121212] text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#c5a36c]/10 border border-[#c5a36c]/20 flex items-center justify-center mb-4 text-[#c5a36c]">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base font-serif font-bold text-white mb-2">
          Clé Google Maps sécurisée
        </h4>
        <p className="text-xs text-[#aaaaaa] max-w-md leading-relaxed mb-4">
          Conformément aux bonnes pratiques de sécurité, aucune clé API n'est codée en dur dans le code source client. La carte alternative OpenStreetMap est disponible sans clé.
        </p>
        {props.onFallbackToLeaflet && (
          <button
            onClick={props.onFallbackToLeaflet}
            className="px-4 py-2.5 bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Afficher la carte alternative (OpenStreetMap)</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      libraries={['marker', 'places', 'geometry']}
    >
      <MapContent {...props} />
    </APIProvider>
  );
};

