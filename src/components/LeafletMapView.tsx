import React, { useEffect, useRef, useState } from 'react';
import { Property, PropertyCategory } from '../types';
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
  const [currentZoom, setCurrentZoom] = useState<number>(7);

  const { setSelectedProperty } = useApp();

  // Expose window callback for popup actions
  useEffect(() => {
    (window as any).__immoplusOpenProp = (id: string) => {
      const target = properties.find(p => p.id === id);
      if (target) {
        if (onSelectProperty) {
          onSelectProperty(target);
        } else {
          setSelectedProperty(target);
        }
      }
    };

    return () => {
      delete (window as any).__immoplusOpenProp;
    };
  }, [properties, onSelectProperty, setSelectedProperty]);

  // Create innovative zoom-reactive icons:
  // 1. Zoom < 12: Pure Vibrant Red Dot with pulse
  // 2. 12 <= Zoom < 15: Red Dot + Category badge + Compact Price
  // 3. Zoom >= 15: Progressive Photo Pin with pointer, scaling up as zoom gets closer
  const createPropertyIcon = (prop: Property, zoom: number, isSelected: boolean) => {
    const categoryLabel = getCategoryShortLabel(prop.propertyType);
    const compactPrice = formatPriceCompact(prop.price || 0, prop.currency || 'DA');
    const imageUrl = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80';

    // 1. Vue éloignée (Zoom < 12) -> Point Rouge 🔴
    if (zoom < 12) {
      return L.divIcon({
        className: 'immoplus-marker-dot',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translate(-50%, -50%);">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: immoplus-radar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #EF4444; border: 2px solid #FFFFFF; box-shadow: 0 2px 10px rgba(239, 68, 68, 0.8); z-index: 2; transition: transform 0.2s;"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    }

    // 2. Zoom intermédiaire (12 <= Zoom < 15) -> 🔴 Villa / 🔴 Appartement + Prix
    if (zoom < 15) {
      return L.divIcon({
        className: 'immoplus-marker-pill',
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: ${isSelected ? '#0F172A' : '#111827'};
            color: #FFFFFF;
            padding: 4px 10px;
            border-radius: 9999px;
            border: 2px solid ${isSelected ? '#FFFFFF' : '#EF4444'};
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
            cursor: pointer;
            font-family: inherit;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            transform: translate(-50%, -100%);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            <span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background: #EF4444; box-shadow: 0 0 6px #EF4444;"></span>
            <span style="color: #FCA5A5; font-weight: 800;">${categoryLabel}</span>
            <span style="color: rgba(255,255,255,0.35);">•</span>
            <span style="color: #FFFFFF;">${compactPrice}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
    }

    // 3. Zoom rapproché (Zoom >= 15) -> Photo miniature qui s'agrandit progressivement
    // Zoom 15: 62px × 46px
    // Zoom 16: 84px × 64px
    // Zoom 17+: 112px × 84px
    let photoWidth = 62;
    let photoHeight = 46;
    if (zoom === 16) {
      photoWidth = 84;
      photoHeight = 64;
    } else if (zoom >= 17) {
      photoWidth = 112;
      photoHeight = 84;
    }

    return L.divIcon({
      className: 'immoplus-marker-photo',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: translate(-50%, -100%);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.6));
        ">
          <!-- Photo Container -->
          <div style="
            width: ${photoWidth}px;
            height: ${photoHeight}px;
            border-radius: 12px;
            overflow: hidden;
            border: 2.5px solid ${isSelected ? '#FFFFFF' : '#EF4444'};
            box-shadow: 0 0 ${isSelected ? '16px rgba(255,255,255,0.9)' : '12px rgba(239, 68, 68, 0.6)'};
            position: relative;
            background: #111827;
          ">
            <img src="${imageUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            
            <!-- Type Pill in photo -->
            <div style="
              position: absolute;
              top: 3px;
              left: 3px;
              background: rgba(0,0,0,0.75);
              backdrop-filter: blur(2px);
              color: #FCA5A5;
              font-size: 8.5px;
              font-weight: 800;
              padding: 1px 4px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">
              ${categoryLabel}
            </div>

            <!-- Price Overlay Bar -->
            <div style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 2px 4px;
              background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 100%);
              color: #FFFFFF;
              font-size: 9.5px;
              font-weight: 800;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              ${compactPrice}
            </div>
          </div>

          <!-- Red Pointer Needle -->
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #EF4444;
            margin-top: -1px;
          "></div>
          
          <!-- Exact Anchor Point -->
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #EF4444;
            border: 1.5px solid #FFFFFF;
            margin-top: -3px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Create Rich Preview Popup HTML for Pin Click
  const createPropertyPopupContent = (prop: Property): string => {
    const categoryLabel = getCategoryShortLabel(prop.propertyType);
    const fullPrice = formatPriceFull(prop.price || 0, prop.currency || 'DA');
    const imageUrl = prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80';
    const cleanTitle = String(prop.title || 'Bien immobilier').replace(/"/g, '&quot;');
    const locationText = prop.location?.neighborhood 
      ? `${prop.location.neighborhood}, ${prop.location.city || ''}`
      : `${prop.location?.city || 'Algérie'}${prop.location?.region ? `, ${prop.location.region}` : ''}`;
    const cleanLocation = locationText.replace(/"/g, '&quot;');

    return `
      <div class="immoplus-popup-card" style="
        width: 280px;
        background: #0F172A;
        color: #F8FAFC;
        border-radius: 18px;
        border: 1.5px solid rgba(239, 68, 68, 0.5);
        box-shadow: 0 20px 45px -8px rgba(0,0,0,0.85);
        overflow: hidden;
        font-family: inherit;
      ">
        <!-- Clickable Photo Header -->
        <div style="position: relative; width: 100%; height: 140px; cursor: pointer; background: #1E293B;" onclick="window.__immoplusOpenProp('${prop.id}')" title="Cliquer pour ouvrir la fiche complète">
          <img src="${imageUrl}" alt="${cleanTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          
          <div style="
            position: absolute;
            top: 10px;
            left: 10px;
            background: #EF4444;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          ">
            ${prop.transactionType === 'sale' ? 'À VENDRE' : 'À LOUER'}
          </div>

          <div style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            color: #F8FAFC;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.15);
          ">
            ${categoryLabel}
          </div>

          <div style="
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            color: #FFFFFF;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
          ">
            🔍 Agrandir
          </div>
        </div>

        <!-- Details Body -->
        <div style="padding: 14px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.3;">
            ${cleanTitle}
          </h4>

          <div style="display: flex; align-items: center; gap: 4px; color: #94A3B8; font-size: 11px; margin-bottom: 8px;">
            <span style="color: #EF4444; font-size: 12px;">📍</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cleanLocation}</span>
          </div>

          <!-- Highlighted Price -->
          <div style="font-size: 17px; font-weight: 800; color: #F59E0B; margin-bottom: 10px; letter-spacing: -0.02em;">
            ${fullPrice}
          </div>

          <!-- Specs (Surface & Rooms) -->
          <div style="display: flex; align-items: center; gap: 10px; font-size: 11px; color: #CBD5E1; padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 5px;">📐 <strong>${prop.surface || 0} m²</strong></span>
            ${prop.bedrooms ? `<span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 5px;">🛏 <strong>${prop.bedrooms} ch.</strong></span>` : ''}
            ${prop.bathrooms ? `<span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 5px;">🚿 <strong>${prop.bathrooms} sdb</strong></span>` : ''}
          </div>

          <!-- [Voir le bien] Action Button -->
          <button
            type="button"
            onclick="window.__immoplusOpenProp('${prop.id}')"
            style="
              width: 100%;
              padding: 10px 14px;
              background: #EF4444;
              color: #FFFFFF;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border: none;
              border-radius: 12px;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45);
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            "
            onmouseover="this.style.background='#DC2626'; this.style.transform='scale(1.02)';"
            onmouseout="this.style.background='#EF4444'; this.style.transform='scale(1)';"
          >
            <span>Voir le bien</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;
  };

  const createPickerIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="position: relative; cursor: grab; transform: translate(-50%, -100%);">
          <!-- Pulse animation around picker pin -->
          <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: immoplus-radar 2s infinite;"></div>
          
          <!-- Pin body -->
          <div style="
            background: #EF4444;
            color: #FFFFFF;
            padding: 6px 12px;
            border-radius: 9999px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.6);
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span>📍 Position du bien</span>
          </div>

          <!-- Pointer Needle -->
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 9px solid #EF4444;
            margin: -1px auto 0 auto;
          "></div>
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #EF4444;
            border: 1.5px solid #FFFFFF;
            margin: -3px auto 0 auto;
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const firstValidProp = properties.find(p => p?.location?.lat && p?.location?.lng);
    const initialLat = pickerCoordinates?.lat || firstValidProp?.location.lat || 36.7538;
    const initialLng = pickerCoordinates?.lng || firstValidProp?.location.lng || 3.0588;
    const startZoom = isPickerMode ? 14 : 7;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: startZoom,
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
    setCurrentZoom(startZoom);

    // Track zoom dynamically to trigger reactive point-to-photo transitions!
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

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

  // Update property markers when properties, selection, or currentZoom changes!
  useEffect(() => {
    if (isPickerMode || !mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds: L.LatLngBoundsExpression = [];

    properties.forEach((prop) => {
      if (
        !prop?.location ||
        typeof prop.location.lat !== 'number' ||
        typeof prop.location.lng !== 'number' ||
        isNaN(prop.location.lat) ||
        isNaN(prop.location.lng)
      ) {
        return;
      }

      const isSelected = selectedProperty?.id === prop.id;
      const marker = L.marker([prop.location.lat, prop.location.lng], {
        icon: createPropertyIcon(prop, currentZoom, isSelected)
      });

      // Bind custom interactive popup with photo and [Voir le bien] button
      marker.bindPopup(createPropertyPopupContent(prop), {
        className: 'immoplus-map-popup-container',
        offset: currentZoom >= 15 ? [0, -35] : [0, -10],
        closeButton: false
      });

      marker.on('click', () => {
        marker.openPopup();
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.push([prop.location.lat, prop.location.lng]);
    });

    if (bounds.length > 0 && !selectedProperty && currentZoom === 7) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch {
        // ignore
      }
    }
  }, [properties, selectedProperty, isPickerMode, currentZoom]);

  // Focus on selected property
  useEffect(() => {
    if (
      !selectedProperty?.location ||
      typeof selectedProperty.location.lat !== 'number' ||
      typeof selectedProperty.location.lng !== 'number' ||
      !mapInstanceRef.current
    ) {
      return;
    }

    try {
      mapInstanceRef.current.flyTo(
        [selectedProperty.location.lat, selectedProperty.location.lng],
        16,
        { duration: 1.2 }
      );
    } catch {
      // ignore
    }
  }, [selectedProperty]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

