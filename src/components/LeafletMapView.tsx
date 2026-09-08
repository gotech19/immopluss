import React, { useEffect, useRef } from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import L from 'leaflet';

interface LeafletMapViewProps {
  properties?: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (p: Property) => void;
  isPickerMode?: boolean;
  pickerCoordinates?: { lat: number; lng: number };
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  properties = [],
  selectedProperty,
  onSelectProperty,
  isPickerMode = false,
  pickerCoordinates,
  onCoordinatesChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const { setSelectedProperty } = useApp();

  const createPropertyIcon = (price: number, currency: string, isSelected: boolean) => {
    // Sanitize currency string to guarantee strict text safety inside Leaflet HTML
    const cleanCurrency = String(currency || 'DA').replace(/[^a-zA-Z0-9\s€$]/g, '').trim().slice(0, 8) || 'DA';
    const safePrice = Number.isFinite(price) && price >= 0 ? price : 0;
    const formattedPrice = safePrice >= 1000000 
      ? `${(safePrice / 1000000).toFixed(1)}M ${cleanCurrency}`
      : `${(safePrice / 1000).toFixed(0)}k ${cleanCurrency}`;


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

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const firstValidProp = properties.find(p => p?.location?.lat && p?.location?.lng);
    const initialLat = pickerCoordinates?.lat || firstValidProp?.location.lat || 36.7538;
    const initialLng = pickerCoordinates?.lng || firstValidProp?.location.lng || 3.0588;

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

    const resizeTimeout = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // ignore
      }
    }, 200);

    if (isPickerMode) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat, lng });
        }
      });
    }

    return () => {
      clearTimeout(resizeTimeout);
      try {
        map.remove();
      } catch {
        // ignore
      }
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
      if (!prop?.location || typeof prop.location.lat !== 'number' || typeof prop.location.lng !== 'number' || isNaN(prop.location.lat) || isNaN(prop.location.lng)) {
        return;
      }

      const isSelected = selectedProperty?.id === prop.id;
      const marker = L.marker([prop.location.lat, prop.location.lng], {
        icon: createPropertyIcon(prop.price || 0, prop.currency || 'DA', isSelected)
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
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch {
        // ignore
      }
    }
  }, [properties, selectedProperty, isPickerMode]);

  // Focus on selected property
  useEffect(() => {
    if (!selectedProperty?.location || typeof selectedProperty.location.lat !== 'number' || typeof selectedProperty.location.lng !== 'number' || !mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.flyTo(
        [selectedProperty.location.lat, selectedProperty.location.lng],
        14,
        { duration: 1.2 }
      );
    } catch {
      // ignore
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};
