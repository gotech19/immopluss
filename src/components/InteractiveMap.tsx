import React, { useEffect, useRef } from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import L from 'leaflet';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const { setSelectedProperty } = useApp();

  // Create custom marker icon
  const createPropertyIcon = (price: number, currency: string, isSelected: boolean) => {
    const formattedPrice = price >= 1000000 
      ? `${(price / 1000000).toFixed(1)}M ${currency}`
      : `${(price / 1000).toFixed(0)}k ${currency}`;

    return L.divIcon({
      className: 'custom-property-pin',
      html: `
        <div style="
          background: ${isSelected ? '#c5a36c' : '#141414'};
          color: ${isSelected ? '#0a0a0a' : '#c5a36c'};
          padding: 5px 10px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          white-space: nowrap;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6);
          border: 1px solid ${isSelected ? '#ffffff' : 'rgba(197, 163, 108, 0.6)'};
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transform: translate(-50%, -100%);
          transition: all 0.2s ease;
        ">
          <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${isSelected ? '#0a0a0a' : '#c5a36c'};"></span>
          <span>${formattedPrice}</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  const createPickerIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #c5a36c;
          border: 2px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) translate(-10px, -10px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #0a0a0a;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initial center: Algeria center or first property
    const initialLat = pickerCoordinates?.lat || properties[0]?.location.lat || 36.7538;
    const initialLng = pickerCoordinates?.lng || properties[0]?.location.lng || 3.0588;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: isPickerMode ? 14 : 7,
      zoomControl: true,
      attributionControl: false
    });

    const isDark = document.documentElement.classList.contains('dark') || true;
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // In picker mode, allow user to click on map to move marker
    if (isPickerMode) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng });
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update picker marker
  useEffect(() => {
    if (!isPickerMode || !mapInstanceRef.current) return;

    const lat = pickerCoordinates?.lat || 36.7538;
    const lng = pickerCoordinates?.lng || 3.0588;

    if (!pickerMarkerRef.current) {
      const marker = L.marker([lat, lng], {
        icon: createPickerIcon(),
        draggable: true
      }).addTo(mapInstanceRef.current);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: pos.lat, lng: pos.lng });
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    }

    mapInstanceRef.current.panTo([lat, lng]);
  }, [pickerCoordinates, isPickerMode]);

  // Update property markers
  useEffect(() => {
    if (isPickerMode || !mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds: L.LatLngBoundsExpression = [];

    properties.forEach((prop) => {
      const isSelected = selectedProperty?.id === prop.id;
      const marker = L.marker([prop.location.lat, prop.location.lng], {
        icon: createPropertyIcon(prop.price, prop.currency, isSelected)
      });

      marker.on('click', () => {
        if (onSelectProperty) {
          onSelectProperty(prop);
        } else {
          setSelectedProperty(prop);
        }
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.push([prop.location.lat, prop.location.lng]);
    });

    if (bounds.length > 0 && !selectedProperty) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [properties, selectedProperty, isPickerMode]);

  // Focus on selected property
  useEffect(() => {
    if (!selectedProperty || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedProperty.location.lat, selectedProperty.location.lng],
      14,
      { duration: 1.2 }
    );
  }, [selectedProperty]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {isPickerMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#121212]/95 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-[#e5e5e5] shadow-2xl border border-[#c5a36c]/40 pointer-events-none z-20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c5a36c]" />
          <span>Cliquez sur la carte ou déplacez le repère pour positionner votre bien</span>
        </div>
      )}
    </div>
  );
};
