import React from 'react';
import { useApp } from '../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { Heart, ArrowRight } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { properties, favorites, setActiveTab, t } = useApp();

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-rose-500 fill-current" />
          <span>{t('favoritesTitle')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#888888] mt-1">
          {favoriteProperties.length} bien(s) sauvegardé(s) pour consultation ultérieure.
        </p>
      </div>

      {favoriteProperties.length === 0 ? (
        <div className="bg-white dark:bg-[#0f0f0f] rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 my-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('noFavorites')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#888888] mt-1 max-w-sm mx-auto mb-5">
            {t('noFavoritesDesc')}
          </p>
          <button
            onClick={() => setActiveTab('properties')}
            className="px-6 py-2.5 rounded-xl bg-[#0B3D91] hover:bg-[#082d6c] text-white text-xs font-extrabold uppercase tracking-wider shadow-md inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>{t('browseProperties')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {favoriteProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  );
};
