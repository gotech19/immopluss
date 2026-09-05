import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  Menu, 
  X, 
  Globe, 
  ShieldCheck, 
  LogOut,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { Language } from '../types';

export const Header: React.FC = () => {
  const { 
    lang, 
    setLang, 
    t, 
    theme, 
    toggleTheme, 
    activeTab, 
    setActiveTab, 
    favorites, 
    unreadNotificationsCount,
    setAuthModalOpen,
    setAuthModalMode,
    notifications,
    markNotificationAsRead
  } = useApp();

  const { userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Logo 
          size="md" 
          showSubtitle={true}
          variant="light"
          onClick={() => handleNav('home')} 
        />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          <button
            id="nav-home-btn"
            onClick={() => handleNav('home')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#0B3D91] bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
            }`}
          >
            {t('navHome')}
          </button>

          <button
            id="nav-properties-btn"
            onClick={() => handleNav('properties')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'properties'
                ? 'text-[#0B3D91] bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
            }`}
          >
            {t('navProperties')}
          </button>

          <button
            id="nav-map-btn"
            onClick={() => handleNav('map')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'text-[#0B3D91] bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
            {t('navMap')}
          </button>

          {/* Publish Property Button Highlight */}
          <button
            id="nav-publish-btn"
            onClick={() => {
              if (!userProfile) {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              } else {
                handleNav('publish');
              }
            }}
            className="ml-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#0B3D91] hover:bg-[#082E6E] shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>{t('navPublish')}</span>
          </button>
        </nav>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Favorites Button */}
          <button
            id="nav-favorites-btn"
            onClick={() => handleNav('favorites')}
            title={t('navFavorites')}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FBBF24] text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Messages Button */}
          <button
            id="nav-messages-btn"
            onClick={() => {
              if (!userProfile) {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              } else {
                handleNav('messages');
              }
            }}
            title={t('navMessages')}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            {userProfile && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0B3D91] dark:bg-blue-400 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="nav-notifications-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              title={t('navNotifications')}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FBBF24] text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">{t('navNotifications')}</span>
                  <span className="text-[10px] text-[#0B3D91] dark:text-blue-400 font-semibold">{unreadNotificationsCount} non lues</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.link) handleNav(n.link);
                        setNotifDropdownOpen(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title="Changer de thème"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#0B3D91] dark:hover:text-[#FBBF24] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FBBF24]" /> : <Moon className="w-4 h-4 text-[#0B3D91]" />}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="lang-select-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#0B3D91] hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
              <span className="tracking-wider">{lang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left rtl:text-right flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      lang === l.code ? 'font-bold text-[#0B3D91] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D91] dark:bg-[#FBBF24]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Profile Menu */}
          {userProfile ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-[#0B3D91] bg-slate-50 dark:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
                  {userProfile.displayName || userProfile.firstName}
                </span>
                <img 
                  src={userProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0B3D91]/30 dark:ring-blue-400/40"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userProfile.displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                    {userProfile.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-sm bg-blue-100 text-[#0B3D91] dark:bg-blue-900/40 dark:text-blue-300">
                        ADMINISTRATEUR
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleNav('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left rtl:text-right text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0B3D91] flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{t('navDashboard')}</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNav('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left rtl:text-right text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0B3D91] flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0B3D91] dark:text-blue-400" />
                    <span>{t('navAdmin')}</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left rtl:text-right text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('navLogout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="header-login-btn"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0B3D91] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                {t('navLogin')}
              </button>
              <button
                id="header-register-btn"
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 shadow-xs transition-colors hidden sm:inline-block cursor-pointer"
              >
                {t('navRegister')}
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left rtl:text-right px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === 'home' ? 'bg-blue-50 text-[#0B3D91] font-bold dark:bg-blue-900/30 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => handleNav('properties')}
            className={`w-full text-left rtl:text-right px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === 'properties' ? 'bg-blue-50 text-[#0B3D91] font-bold dark:bg-blue-900/30 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('navProperties')}
          </button>
          <button
            onClick={() => handleNav('map')}
            className={`w-full text-left rtl:text-right px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
              activeTab === 'map' ? 'bg-blue-50 text-[#0B3D91] font-bold dark:bg-blue-900/30 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" />
            <span>{t('navMap')}</span>
          </button>
          <button
            onClick={() => {
              if (!userProfile) {
                setAuthModalMode('login');
                setAuthModalOpen(true);
              } else {
                handleNav('publish');
              }
            }}
            className="w-full text-center px-4 py-3 rounded-xl text-xs font-bold bg-[#0B3D91] hover:bg-[#082E6E] text-white shadow-sm flex items-center justify-center gap-2 mt-3 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FBBF24]" />
            <span>{t('navPublish')}</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-around">
            <button 
              onClick={() => handleNav('dashboard')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0B3D91] py-2 cursor-pointer"
            >
              {t('navDashboard')}
            </button>
            <button 
              onClick={() => handleNav('admin')}
              className="text-xs font-semibold text-[#0B3D91] dark:text-blue-400 py-2 cursor-pointer"
            >
              {t('navAdmin')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
