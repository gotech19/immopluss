import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from './HeroSection';
import { CategoryChips } from './CategoryChips';
import { PropertyCard } from './PropertyCard';
import { InteractiveMap } from './InteractiveMap';
import { 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  PhoneCall, 
  PlusCircle, 
  Building2 
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { properties, setActiveTab, t } = useApp();

  const published = properties.filter(p => p.status === 'published');
  const featured = published.filter(p => p.featured).slice(0, 4);
  const recent = published.slice(0, 6);

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0a0a0a] text-slate-900 dark:text-[#e5e5e5] transition-colors">
      {/* 1. Hero Search Section */}
      <HeroSection />

      {/* 2. Category Chips */}
      <CategoryChips />

      {/* 3. Featured / Exclusive Properties (if any) */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16 bg-white dark:bg-[#0f0f0f] border-b border-slate-200/70 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] dark:text-[#FBBF24] uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('featuredBadge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t('featuredProperties')}
                </h2>
              </div>

              <button
                onClick={() => setActiveTab('properties')}
                className="text-xs font-bold uppercase tracking-wider text-[#0B3D91] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {featured.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Recent Properties or Clean Empty Slate */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('recentProperties')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('recentPropertiesSub')}
              </p>
            </div>

            {published.length > 0 && (
              <button
                onClick={() => setActiveTab('properties')}
                className="text-xs font-bold uppercase tracking-wider text-[#0B3D91] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {recent.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 dark:border-white/[0.08] shadow-sm max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0B3D91]/10 text-[#0B3D91] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                <Building2 className="w-8 h-8 stroke-[1.75]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {t('noPropertiesYetTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {t('noPropertiesYetDesc')}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('publish')}
                  className="px-6 py-3 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('publishFirstAd')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Interactive Map Section Teaser */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#0f0f0f] border-y border-slate-200/70 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] dark:text-[#FBBF24] uppercase tracking-wider mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('mapBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('mapSectionTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('mapSectionSub')}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('map')}
              className="px-5 py-2.5 rounded-xl bg-[#0B3D91] hover:bg-[#082E6E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <span>{t('openFullMap')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <InteractiveMap 
            properties={published} 
            className="h-80 sm:h-96"
          />
        </div>
      </section>

      {/* 6. Why ImmoPlus Trust Section */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              {t('whyChooseUsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('whyChooseUsSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md space-y-3.5 hover:border-[#0B3D91]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0B3D91]/10 text-[#0B3D91] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('verifiedListingsTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('verifiedListingsDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md space-y-3.5 hover:border-[#0B3D91]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/20 text-amber-600 dark:bg-amber-400/10 dark:text-[#FBBF24] flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('directContactTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('directContactDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md space-y-3.5 hover:border-[#0B3D91]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0B3D91]/10 text-[#0B3D91] dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('multilingualTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('multilingualDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0B3D91] via-[#093278] to-[#062456] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t('ctaBannerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                {t('ctaBannerDesc')}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('publish')}
              className="px-6 py-3.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg inline-flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>{t('navPublish')}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
