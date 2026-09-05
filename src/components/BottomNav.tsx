import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Search, 
  MapPin, 
  PlusSquare, 
  Heart, 
  User, 
  MessageSquare 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    t, 
    favorites, 
    setAuthModalOpen, 
    setAuthModalMode 
  } = useApp();
  const { userProfile } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0d0d0d]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/[0.08] px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#0B3D91] dark:text-[#FBBF24] font-bold'
              : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('navHome')}</span>
        </button>

        {/* Search / Properties */}
        <button
          id="mobile-nav-search"
          onClick={() => setActiveTab('properties')}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] transition-colors cursor-pointer ${
            activeTab === 'properties'
              ? 'text-[#0B3D91] dark:text-[#FBBF24] font-bold'
              : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('navProperties')}</span>
        </button>

        {/* Map */}
        <button
          id="mobile-nav-map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'text-[#0B3D91] dark:text-[#FBBF24] font-bold'
              : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('navMap')}</span>
        </button>

        {/* Publish Button (Center highlight) */}
        <button
          id="mobile-nav-publish"
          onClick={() => {
            if (!userProfile) {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            } else {
              setActiveTab('publish');
            }
          }}
          className="flex flex-col items-center justify-center -mt-5 p-1 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
            <PlusSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-extrabold text-[#0B3D91] dark:text-[#FBBF24] mt-0.5 uppercase tracking-wider">
            {t('navPublish')}
          </span>
        </button>

        {/* Favorites */}
        <button
          id="mobile-nav-favorites"
          onClick={() => setActiveTab('favorites')}
          className={`relative flex flex-col items-center justify-center p-1.5 min-w-[56px] transition-colors cursor-pointer ${
            activeTab === 'favorites'
              ? 'text-[#0B3D91] dark:text-[#FBBF24] font-bold'
              : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
          }`}
        >
          <Heart className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-[#FBBF24] text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5">{t('navFavorites')}</span>
        </button>

        {/* Profile / Account */}
        <button
          id="mobile-nav-profile"
          onClick={() => {
            if (!userProfile) {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            } else {
              setActiveTab('dashboard');
            }
          }}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-[#0B3D91] dark:text-[#FBBF24] font-bold'
              : 'text-slate-500 dark:text-[#888888] hover:text-slate-900 dark:hover:text-[#e5e5e5]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('navDashboard')}</span>
        </button>

      </div>
    </div>
  );
};
