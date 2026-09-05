import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  ShieldCheck, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Heart,
  Globe 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, lang, setLang, setActiveTab } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('ImmoPlus est prêt à être installé via le menu de votre navigateur ("Ajouter à l\'écran d\'accueil").');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <footer className="bg-[#0B1E3F] text-slate-200 dark:bg-[#070b14] dark:text-slate-300 border-t border-blue-950/80 pt-14 pb-24 lg:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand & Slogan */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" variant="white" showSubtitle={true} />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Plateforme immobilière professionnelle multilingue pour acheter, louer et vendre des biens d'exception partout en Algérie et à l'international.
            </p>

            {/* PWA App Install Button */}
            <div className="pt-2">
              <button
                id="install-pwa-btn"
                onClick={handleInstallPWA}
                className="px-4 py-2.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Installer l'application ImmoPlus (PWA)</span>
              </button>
            </div>
          </div>

          {/* Real Estate Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Catégories</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catApartments')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catHouses')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catLand')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catAgriLand')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catCommercial')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('catWarehouse')}</button></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('navHome')}</button></li>
              <li><button onClick={() => setActiveTab('properties')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('navProperties')}</button></li>
              <li><button onClick={() => setActiveTab('map')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('navMap')}</button></li>
              <li><button onClick={() => setActiveTab('publish')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('navPublish')}</button></li>
              <li><button onClick={() => setActiveTab('favorites')} className="hover:text-[#FBBF24] transition-colors cursor-pointer">{t('navFavorites')}</button></li>
              <li><button onClick={() => setActiveTab('admin')} className="hover:text-[#FBBF24] text-white font-semibold transition-colors cursor-pointer">{t('navAdmin')}</button></li>
            </ul>
          </div>

          {/* Contact & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">Contact & Confiance</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span>Sétif / Alger, Algérie</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span>+213 (0) 555 12 34 56</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span>contact@immoplus.dz</span>
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#FBBF24] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Plateforme certifiée & vérifiée</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ImmoPlus. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Conditions Générales</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Politique de Confidentialité</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Sécurité des transactions</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
