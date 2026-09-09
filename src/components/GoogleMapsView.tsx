import React, { useEffect, useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow,
  useMap, 
  useApiLoadingStatus, 
  APILoadingStatus 
} from '@vis.gl/react-google-maps';
import { Property, PropertyCategory } from '../types';
import { useApp } from '../context/AppContext';
import { 
  GOOGLE_MAPS_API_KEY, 
  GMP_ATTRIBUTION_ID, 
  GOOGLE_MAPS_MAP_ID, 
  DEFAULT_MAP_CENTER 
} from '../config/maps';
import { AlertCircle, Layers, X, ArrowRight } from 'lucide-react';

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

const getCategoryShortLabel = (type: PropertyCategory): string => {
  switch (type) {
    case 'house_villa':
      return 'Villa';
    case 'apartment':
      return 'Appartement';
    case 'land':
      return 'Terrain';
    case 'agricultural_land':
      return 'T. Agricole';
    case 'commercial':
      return 'Local';
    case 'warehouse':
      return 'Hangar';
    case 'office':
      return 'Bureau';
    case 'duplex_studio':
      return 'Studio';
    default:
      return 'Bien';
  }
};

const formatPriceCompact = (price: number, currency: string = 'DA'): string => {
  const cleanCurrency = String(currency || 'DA').replace(/[^a-zA-Z0-9\s€$]/g, '').trim().slice(0, 8) || 'DA';
  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
  if (safePrice >= 1000000) {
    const millions = safePrice / 1000000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M ${cleanCurrency}`;
  }
  if (safePrice >= 1000) {
    return `${(safePrice / 1000).toFixed(0)}k ${cleanCurrency}`;
  }
  return `${safePrice} ${cleanCurrency}`;
};

const formatPriceFull = (price: number, currency: string = 'DA'): string => {
  const cleanCurrency = String(currency || 'DA').replace(/[^a-zA-Z0-9\s€$]/g, '').trim().slice(0, 8) || 'DA';
  const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
  return `${safePrice.toLocaleString('fr-FR')} ${cleanCurrency}`;
};

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
    map.setZoom(16);
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
      map.setZoom(12);
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
  const [currentZoom, setCurrentZoom] = useState<number>(7);
  const [activeInfoWindowProp, setActiveInfoWindowProp] = useState<Property | null>(null);

  const firstValidProp = properties.find(p => p?.location?.lat && p?.location?.lng);
  const initialCenter = {
    lat: pickerCoordinates?.lat || firstValidProp?.location.lat || DEFAULT_MAP_CENTER.lat,
    lng: pickerCoordinates?.lng || firstValidProp?.location.lng || DEFAULT_MAP_CENTER.lng
  };

  const handleOpenProperty = (prop: Property) => {
    if (onSelectProperty) {
      onSelectProperty(prop);
    } else {
      setSelectedProperty(prop);
    }
    setActiveInfoWindowProp(null);
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
              className="px-4 py-2.5 bg-[#EF4444] hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-2"
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
        onZoomChanged={(e) => {
          if (e.detail.zoom) {
            setCurrentZoom(e.detail.zoom);
          }
        }}
        onClick={(e) => {
          if (isPickerMode && e.detail.latLng && onCoordinatesChange) {
            onCoordinatesChange({
              lat: e.detail.latLng.lat,
              lng: e.detail.latLng.lng
            });
          }
          setActiveInfoWindowProp(null);
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
              <div className="relative flex flex-col items-center">
                <div className="absolute -bottom-1 w-8 h-8 rounded-full bg-rose-500/40 immoplus-radar-ring pointer-events-none" />
                <div className="bg-rose-600 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full border-2 border-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                  <span>📍 Position du bien</span>
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600 -mt-[1px]" />
                <div className="w-2 h-2 rounded-full bg-rose-600 border border-white -mt-1" />
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Property Markers with Innovative 3-Stage Zoom Effect */}
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
            const categoryLabel = getCategoryShortLabel(prop.propertyType);
            const compactPrice = formatPriceCompact(prop.price || 0, prop.currency || 'DA');
            const imageUrl = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80';

            // STAGE 1: Zoom < 12 -> Red Dot 🔴
            if (currentZoom < 12) {
              return (
                <AdvancedMarker
                  key={prop.id}
                  position={{ lat: prop.location.lat, lng: prop.location.lng }}
                  onClick={() => setActiveInfoWindowProp(prop)}
                  zIndex={isSelected ? 100 : 10}
                  title={`${prop.title} - ${compactPrice}`}
                >
                  <div className="relative w-6 h-6 flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute w-full h-full rounded-full bg-rose-500/40 immoplus-radar-ring" />
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-lg z-10 transition-transform hover:scale-125" />
                  </div>
                </AdvancedMarker>
              );
            }

            // STAGE 2: 12 <= Zoom < 15 -> 🔴 Villa / Appartement + Prix
            if (currentZoom < 15) {
              return (
                <AdvancedMarker
                  key={prop.id}
                  position={{ lat: prop.location.lat, lng: prop.location.lng }}
                  onClick={() => setActiveInfoWindowProp(prop)}
                  zIndex={isSelected ? 100 : 10}
                  title={`${prop.title} - ${compactPrice}`}
                >
                  <div
                    className={`cursor-pointer px-2.5 py-1 rounded-full font-bold text-[11px] shadow-2xl flex items-center gap-1.5 transition-all transform hover:scale-105 select-none ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-2 border-white ring-2 ring-rose-500'
                        : 'bg-[#111827] text-white border-2 border-rose-600 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                    <span className="text-rose-300 font-extrabold">{categoryLabel}</span>
                    <span className="text-white/40">•</span>
                    <span>{compactPrice}</span>
                  </div>
                </AdvancedMarker>
              );
            }

            // STAGE 3: Zoom >= 15 -> Progressive Photo Pin scaling as zoom grows!
            let photoWidthClass = 'w-16 h-12';
            if (currentZoom === 16) photoWidthClass = 'w-20 h-16';
            else if (currentZoom >= 17) photoWidthClass = 'w-28 h-20';

            return (
              <AdvancedMarker
                key={prop.id}
                position={{ lat: prop.location.lat, lng: prop.location.lng }}
                onClick={() => setActiveInfoWindowProp(prop)}
                zIndex={isSelected ? 100 : 20}
                title={`${prop.title} - ${compactPrice}`}
              >
                <div className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform duration-200">
                  <div className={`${photoWidthClass} rounded-xl overflow-hidden border-2.5 ${isSelected ? 'border-white shadow-2xl ring-2 ring-rose-500' : 'border-rose-600 shadow-xl'} relative bg-slate-900`}>
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-rose-300 font-extrabold text-[8px] px-1 py-0.5 rounded uppercase">
                      {categoryLabel}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white font-extrabold text-[9px] text-center px-1 py-0.5 truncate">
                      {compactPrice}
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600 -mt-[1px]" />
                  <div className="w-2 h-2 rounded-full bg-rose-600 border border-white -mt-1" />
                </div>
              </AdvancedMarker>
            );
          })}

        {/* Interactive Popup Card on Marker Click */}
        {activeInfoWindowProp && activeInfoWindowProp.location && (
          <InfoWindow
            position={{
              lat: activeInfoWindowProp.location.lat,
              lng: activeInfoWindowProp.location.lng
            }}
            onCloseClick={() => setActiveInfoWindowProp(null)}
            headerDisabled
            className="p-0 rounded-2xl overflow-hidden"
          >
            <div className="w-72 bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-rose-500/50 shadow-2xl">
              {/* Photo Header */}
              <div 
                className="relative h-36 bg-slate-800 cursor-pointer overflow-hidden group"
                onClick={() => handleOpenProperty(activeInfoWindowProp)}
                title="Cliquer pour ouvrir la fiche complète"
              >
                <img 
                  src={activeInfoWindowProp.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'} 
                  alt={activeInfoWindowProp.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                  {activeInfoWindowProp.transactionType === 'sale' ? 'À VENDRE' : 'À LOUER'}
                </div>
                <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                  {getCategoryShortLabel(activeInfoWindowProp.propertyType)}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoWindowProp(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-3.5">
                <h4 className="font-bold text-sm text-white truncate mb-1">
                  {activeInfoWindowProp.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-2 truncate">
                  <span className="text-rose-500">📍</span>
                  <span>{activeInfoWindowProp.location?.neighborhood ? `${activeInfoWindowProp.location.neighborhood}, ${activeInfoWindowProp.location.city}` : activeInfoWindowProp.location?.city}</span>
                </div>

                <div className="text-base font-extrabold text-amber-400 mb-2.5">
                  {formatPriceFull(activeInfoWindowProp.price || 0, activeInfoWindowProp.currency || 'DA')}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 pb-2.5 mb-2.5 border-b border-white/10">
                  <span>📐 <strong>{activeInfoWindowProp.surface || 0} m²</strong></span>
                  {activeInfoWindowProp.bedrooms ? <span>🛏 <strong>{activeInfoWindowProp.bedrooms} ch.</strong></span> : null}
                  {activeInfoWindowProp.bathrooms ? <span>🚿 <strong>{activeInfoWindowProp.bathrooms} sdb</strong></span> : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenProperty(activeInfoWindowProp)}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Voir le bien</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = (props) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-[#121212] text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
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
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-2"
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

