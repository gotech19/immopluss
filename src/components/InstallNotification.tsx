import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, X, Smartphone, Monitor, ChevronRight, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

export const InstallNotification: React.FC = () => {
  const { t, lang } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedGuideTab, setSelectedGuideTab] = useState<'android' | 'ios' | 'windows' | 'mac'>('android');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (PWA installed)
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (checkStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);
    if (isIosDevice) {
      setSelectedGuideTab('ios');
    }

    // Check if user dismissed notification in this session
    const isDismissed = sessionStorage.getItem('immoplus_install_notif_dismissed');
    if (isDismissed) {
      return;
    }

    // Listen to beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowNotification(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Fallback: If on iOS or mobile device and not installed, show after 2 seconds
    const timer = setTimeout(() => {
      if (!isDismissed && !checkStandalone) {
        setShowNotification(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowNotification(false);
          setDeferredPrompt(null);
        }
      } catch (e) {
        console.warn('Install prompt error:', e);
        setShowGuideModal(true);
      }
    } else {
      // If no native prompt available (iOS Safari, Firefox, or already prompted), show the illustrated guide
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    sessionStorage.setItem('immoplus_install_notif_dismissed', 'true');
  };

  if (isStandalone || !showNotification) {
    return showGuideModal ? renderGuideModal() : null;
  }

  function renderGuideModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div 
          className="bg-white dark:bg-[#121824] text-slate-900 dark:text-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Close button */}
          <button
            onClick={() => setShowGuideModal(false)}
            className="absolute top-5 end-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#1E40AF] flex items-center justify-center shadow-md shrink-0">
              <Download className="w-6 h-6 text-[#FBBF24]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {t('installModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('installModalSub')}
              </p>
            </div>
          </div>

          {/* OS Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5 text-xs font-semibold">
            <button
              onClick={() => setSelectedGuideTab('android')}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                selectedGuideTab === 'android'
                  ? 'bg-white dark:bg-slate-900 text-[#0B3D91] dark:text-[#FBBF24] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setSelectedGuideTab('ios')}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                selectedGuideTab === 'ios'
                  ? 'bg-white dark:bg-slate-900 text-[#0B3D91] dark:text-[#FBBF24] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              iOS (iPhone)
            </button>
            <button
              onClick={() => setSelectedGuideTab('windows')}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                selectedGuideTab === 'windows'
                  ? 'bg-white dark:bg-slate-900 text-[#0B3D91] dark:text-[#FBBF24] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Windows
            </button>
            <button
              onClick={() => setSelectedGuideTab('mac')}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                selectedGuideTab === 'mac'
                  ? 'bg-white dark:bg-slate-900 text-[#0B3D91] dark:text-[#FBBF24] shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mac
            </button>
          </div>

          {/* Tab Instructions Content */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 space-y-3.5 mb-5 text-xs text-slate-700 dark:text-slate-300">
            {selectedGuideTab === 'android' && (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <p>{t('androidGuide1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <p>{t('androidGuide2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <p className="font-semibold text-[#0B3D91] dark:text-[#FBBF24]">{t('androidGuide3')}</p>
                </div>
              </>
            )}

            {selectedGuideTab === 'ios' && (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <p>{t('iosGuide1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <p>{t('iosGuide2')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-blue-500 shrink-0" />
                    <p>{t('iosGuide3')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                  <p className="font-semibold text-[#0B3D91] dark:text-[#FBBF24]">{t('iosGuide4')}</p>
                </div>
              </>
            )}

            {selectedGuideTab === 'windows' && (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <p>{t('windowsGuide1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <p>{t('windowsGuide2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <p className="font-semibold text-[#0B3D91] dark:text-[#FBBF24]">{t('windowsGuide3')}</p>
                </div>
              </>
            )}

            {selectedGuideTab === 'mac' && (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <p>{t('macGuide1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <p>{t('macGuide2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <p className="font-semibold text-[#0B3D91] dark:text-[#FBBF24]">{t('macGuide3')}</p>
                </div>
              </>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => setShowGuideModal(false)}
            className="w-full py-3 rounded-xl bg-[#0B3D91] hover:bg-[#082d6b] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {t('close') || 'Compris'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Modern Notification Banner */}
      <aside
        id="pwa-install-notification"
        aria-label="Installation de l'application"
        className="fixed bottom-20 lg:bottom-6 end-4 sm:end-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#0e1626]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-blue-900/40 shadow-2xl transition-all duration-300 transform translate-y-0"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-start gap-3.5">
          {/* ImmoPlus Logo Icon */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#0B3D91] to-[#1E40AF] p-2 flex items-center justify-center shrink-0 shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              <path 
                d="M 50 8 C 30.5 8 15 23.5 15 42 C 15 60.5 41 83 48.2 88.6 C 49.3 89.4 50.7 89.4 51.8 88.6 C 59 83 85 60.5 85 42 C 85 23.5 69.5 8 50 8 Z" 
                fill="#FBBF24" 
              />
              <circle cx="50" cy="40" r="23" fill="#FFFFFF" />
              <path d="M 50 24 L 34 38 L 38 40.5 L 50 29 L 62 40.5 L 66 38 Z" fill="#0B3D91" />
              <rect x="39" y="38" width="22" height="18" fill="#0B3D91" rx="0.5" />
              <rect x="45.5" y="42" width="3.5" height="3.5" fill="#FBBF24" />
              <rect x="51" y="42" width="3.5" height="3.5" fill="#FBBF24" />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <Smartphone className="w-3 h-3" />
                <span>Application PWA</span>
              </div>
              
              {/* Dismiss X */}
              <button
                onClick={handleDismiss}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
              {t('installBannerTitle')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {t('installBannerSub')}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2.5 mt-3 pt-1">
              <button
                id="pwa-install-action-btn"
                onClick={handleInstallClick}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('installNow')}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                {t('installLater')}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Guide Modal if user requests instructions */}
      {showGuideModal && renderGuideModal()}
    </>
  );
};
