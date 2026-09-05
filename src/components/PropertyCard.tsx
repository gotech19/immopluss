import React from 'react';
import { Property } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { t, isFavorite, toggleFavorite, setSelectedProperty } = useApp();
  const favorited = isFavorite(property.id);

  const formatPrice = (num: number, currency: string, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(num);
    if (period) {
      const periodLabel = period === 'monthly' ? '/mois' : period === 'weekly' ? '/sem' : period === 'daily' ? '/jour' : '/an';
      return `${formatted} ${currency}${periodLabel}`;
    }
    return `${formatted} ${currency}`;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(property);
    } else {
      setSelectedProperty(property);
    }
  };

  return (
    <div 
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0B3D91]/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Card Image Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-[#181818]">
        <img 
          src={property.images[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Transaction Badge */}
        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-lg shadow-md ${
            property.transactionType === 'sale'
              ? 'bg-[#FBBF24] text-slate-950'
              : 'bg-[#0B3D91] text-white'
          }`}>
            {property.transactionType === 'sale' ? t('forSale') : t('forRent')}
          </span>

          {property.verified && (
            <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white shadow-md inline-flex items-center gap-1 backdrop-blur-xs" title="Annonce vérifiée">
              <ShieldCheck className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          id={`fav-btn-${property.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all z-10 cursor-pointer ${
            favorited 
              ? 'bg-rose-500 text-white scale-110' 
              : 'bg-white/80 dark:bg-[#0a0a0a]/60 text-slate-700 dark:text-white hover:text-rose-500 border border-white/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Price displayed over bottom of image */}
        <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 text-white z-10">
          <p className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md">
            {formatPrice(property.price, property.currency, property.rentPeriod)}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#999999] text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400 shrink-0" />
            <span className="truncate">{property.location.city}, {property.location.country}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0B3D91] dark:group-hover:text-blue-400 transition-colors mb-2">
            {property.title}
          </h3>
        </div>

        {/* Specs Pill List (Bedrooms, Bathrooms, Surface) */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-xs text-slate-600 dark:text-[#999999]">
          
          {/* Bedrooms */}
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <div className="flex items-center gap-1 font-semibold">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms}</span>
            </div>
          )}

          {/* Bathrooms */}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex items-center gap-1 font-semibold">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms}</span>
            </div>
          )}

          {/* Surface */}
          <div className="flex items-center gap-1 font-semibold">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {property.surface >= 10000 
                ? `${(property.surface / 10000).toFixed(0)} ha` 
                : `${property.surface} m²`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
