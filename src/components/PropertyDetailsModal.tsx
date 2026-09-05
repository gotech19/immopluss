import React, { useState } from 'react';
import { Property, PropertyReport } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { InteractiveMap } from './InteractiveMap';
import { 
  X, 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Copy, 
  Check, 
  Send 
} from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose }) => {
  const { 
    t, 
    isFavorite, 
    toggleFavorite, 
    startConversationWithSeller,
    submitReport,
    setAuthModalOpen
  } = useApp();
  const { userProfile } = useAuth();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<PropertyReport['reason']>('wrong_info');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const favorited = isFavorite(property.id);

  const formatPrice = (num: number, currency: string, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(num);
    if (period) {
      const periodLabel = period === 'monthly' ? '/mois' : period === 'weekly' ? '/sem' : period === 'daily' ? '/jour' : '/an';
      return `${formatted} ${currency}${periodLabel}`;
    }
    return `${formatted} ${currency}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Découvrez ce bien immobilier sur ImmoPlus: ${property.title} (${property.referenceNumber})`,
          url: window.location.href
        });
      } catch (err) {
        // cancelled
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport(property.id, property.title, reportReason, reportDetails);
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setReportModalOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="property-details-modal"
        className="relative bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-[#e5e5e5] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10"
      >
        
        {/* Sticky Header with Controls */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
              property.transactionType === 'sale'
                ? 'bg-[#FBBF24] text-slate-950'
                : 'bg-[#0B3D91] text-white'
            }`}>
              {property.transactionType === 'sale' ? t('forSale') : t('forRent')}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-[#888888]">
              {t('reference')}: {property.referenceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleNativeShare}
              title={t('shareListing')}
              className="p-2 rounded-xl text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(property.id)}
              title={t('navFavorites')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                favorited 
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' 
                  : 'text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
            </button>

            {/* Report */}
            <button
              onClick={() => setReportModalOpen(true)}
              title={t('reportListing')}
              className="p-2 rounded-xl text-slate-400 dark:text-[#888888] hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              id="close-property-details-btn"
              className="p-2 rounded-xl text-slate-600 dark:text-[#999999] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Gallery Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#181818] shadow-md border border-slate-200/80 dark:border-white/10">
              <img 
                src={property.images[activePhotoIndex]?.url || property.images[0]?.url} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                {activePhotoIndex + 1} / {property.images.length}
              </div>
            </div>

            {/* Thumbnails row */}
            {property.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIndex === idx 
                        ? 'border-[#0B3D91] dark:border-[#FBBF24] scale-102 shadow-md' 
                        : 'border-slate-200 dark:border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#999999] text-sm font-semibold mb-1">
                <MapPin className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" />
                <span>{property.location.address || `${property.location.city}, ${property.location.country}`}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {property.title}
              </h2>
            </div>

            <div className="sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-[#0B3D91] dark:text-[#FBBF24]">
                {formatPrice(property.price, property.currency, property.rentPeriod)}
              </div>
              {property.isDemo && (
                <span className="inline-block mt-1 text-[11px] font-bold text-[#0B3D91] dark:text-[#FBBF24] bg-blue-50 dark:bg-yellow-500/10 border border-blue-200 dark:border-yellow-500/30 px-2 py-0.5 rounded-lg">
                  {t('demoNotice')}
                </span>
              )}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[#0B3D91] dark:text-blue-400">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#888888]">{t('surface')}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{property.surface} m²</p>
              </div>
            </div>

            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[#0B3D91] dark:text-blue-400">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#888888]">{t('bedrooms')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{property.bedrooms}</p>
                </div>
              </div>
            )}

            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[#0B3D91] dark:text-blue-400">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#888888]">{t('bathrooms')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{property.bathrooms}</p>
                </div>
              </div>
            )}

            {property.yearBuilt && (
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[#0B3D91] dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-[#888888]">{t('yearBuilt')}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{property.yearBuilt}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('description')}</h3>
            <p className="text-sm text-slate-600 dark:text-[#cccccc] leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities checklist */}
          {property.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('amenities')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#e5e5e5] bg-slate-50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-[#0B3D91] dark:text-blue-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('locationOnMap')}</h3>
            {property.locationPrivacy === 'approximate' && (
              <p className="text-xs text-amber-600 dark:text-[#FBBF24] font-semibold">
                {t('approximateLocationNotice')}
              </p>
            )}
            <InteractiveMap 
              properties={[property]} 
              selectedProperty={property}
              className="h-64 sm:h-72" 
            />
          </div>

          {/* Advertiser Profile Card & Direct Action Buttons */}
          <div className="bg-slate-50 dark:bg-[#141414] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={property.ownerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'} 
                  alt={property.ownerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#0B3D91] dark:ring-[#FBBF24]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{property.ownerName}</h4>
                    {property.ownerVerified && (
                      <span title="Annonceur vérifié" className="text-[#0B3D91] dark:text-[#FBBF24]">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#888888] capitalize">
                    {property.ownerType.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              
              {/* Internal Messaging */}
              <button
                type="button"
                onClick={() => {
                  startConversationWithSeller(property);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-[#0B3D91] hover:bg-[#082d6c] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('sendMessage')}</span>
              </button>

              {/* Direct WhatsApp button */}
              {property.ownerWhatsapp && (
                <a
                  href={`https://wa.me/${property.ownerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je vous contacte au sujet de votre annonce "${property.title}" (${property.referenceNumber}) sur ImmoPlus.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.818-.981z" />
                  </svg>
                  <span>{t('openWhatsapp')}</span>
                </a>
              )}

              {/* Direct Phone Call */}
              <a
                href={`tel:${property.ownerPhone}`}
                className="py-3 px-4 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>{property.ownerPhone}</span>
              </a>

            </div>
          </div>

        </div>

      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141414] text-slate-900 dark:text-[#e5e5e5] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{t('shareListing')}</h4>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1c1c1c] text-xs font-semibold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#252525] transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Copy className="w-4 h-4 text-[#0B3D91] dark:text-blue-400" />
                  <span>Copier le lien</span>
                </span>
                {copiedLink && <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copié</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal Dialog */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141414] text-slate-900 dark:text-[#e5e5e5] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{t('reportListing')}</h4>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-center text-xs font-bold">
                Merci, votre signalement a été transmis à l'équipe de modération.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-[#999999] mb-1">Motif</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:border-[#0B3D91]"
                  >
                    <option value="wrong_info">Informations incorrectes</option>
                    <option value="fake">Fausse annonce</option>
                    <option value="scam">Arnaque suspectée</option>
                    <option value="duplicate">Annonce en double</option>
                    <option value="wrong_location">Mauvaise localisation</option>
                    <option value="inappropriate">Contenu inapproprié</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-[#999999] mb-1">Détails</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Précisez votre signalement..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#0B3D91]"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-[#999999] dark:hover:text-white cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 shadow-md cursor-pointer transition-all"
                  >
                    Envoyer le signalement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
