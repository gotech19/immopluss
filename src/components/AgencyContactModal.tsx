import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Building2, 
  Navigation,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgencyContactModal: React.FC = () => {
  const { contactModalOpen, setContactModalOpen } = useApp();
  const [copied, setCopied] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!contactModalOpen) return null;

  const fullAddress = '42, Boulevard Didouche Mourad, Alger Centre, 16000 Alger, Algérie';
  const agencyPhone = '+213 555 12 34 56';
  const agencyEmail = 'contact@immoplus.dz';
  const agencyWhatsapp = '+213555123456';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setMsgSent(false);
      setContactModalOpen(false);
    }, 2000);
  };

  return (
    <div 
      id="agency-contact-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setContactModalOpen(false)}
    >
      <div 
        id="agency-contact-modal-dialog"
        className="bg-white dark:bg-[#121212] text-slate-900 dark:text-white rounded-3xl max-w-xl w-full border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Banner */}
        <div className="relative bg-gradient-to-r from-[#0B3D91] via-[#093278] to-[#062456] text-white p-6 sm:p-8">
          <button
            id="close-agency-modal-btn"
            onClick={() => setContactModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">Siège Officiel & Agence Centrale</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                ImmoPlus Algérie — Alger
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-blue-100/90 max-w-md">
            Retrouvez notre agence principale au cœur de la capitale pour toute estimation, transaction ou accompagnement personnalisé.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          
          {/* Exact Address Card */}
          <div className="bg-slate-50 dark:bg-[#181818] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B3D91]/10 text-[#0B3D91] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adresse Principale</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                    {fullAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Repère : À 200m de la Place Maurice Audin et de la Grande Poste d'Alger.
                  </p>
                </div>
              </div>

              <button
                id="copy-address-btn"
                onClick={handleCopyAddress}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Copier l'adresse"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            {/* Google Maps / Itinerary Action */}
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                id="open-google-maps-btn"
                href="https://www.google.com/maps/search/?api=1&query=Boulevard+Didouche+Mourad,+Alger+Centre,+Alger,+Algeria"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3D91] hover:bg-[#082E6E] transition-all shadow-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Ouvrir dans Google Maps / Itinéraire</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Quick Direct Contact Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <a
              id="call-agency-btn"
              href={`tel:${agencyPhone.replace(/\s+/g, '')}`}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#181818] hover:border-[#0B3D91] dark:hover:border-blue-500 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B3D91] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone Direct</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {agencyPhone}
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              id="whatsapp-agency-btn"
              href={`https://wa.me/${agencyWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Bonjour, je souhaite contacter l'agence ImmoPlus Alger au sujet d'un bien immobilier.")}`}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">WhatsApp Immédiat</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  Discuter avec un agent
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              id="email-agency-btn"
              href={`mailto:${agencyEmail}?subject=Demande%20d'information%20ImmoPlus%20Alger`}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#181818] hover:border-[#0B3D91] dark:hover:border-blue-500 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Officiel</span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {agencyEmail}
                </p>
              </div>
            </a>

            {/* Working Hours */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-[#181818] flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Horaires d'Ouverture</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Dimanche – Jeudi : 08h30 – 17h30
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Samedi : 09h00 – 13h00
                </p>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="border-t border-slate-100 dark:border-white/10 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Envoyer un message direct à l'agence d'Alger
            </h4>

            {msgSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Votre message a été transmis avec succès à notre équipe d'Alger. Nous vous recontacterons rapidement.</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    id="contact-name-input"
                    type="text"
                    required
                    placeholder="Votre nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] outline-none focus:border-[#0B3D91] dark:focus:border-blue-500"
                  />
                  <input
                    id="contact-phone-input"
                    type="tel"
                    required
                    placeholder="Numéro de téléphone (ex: 0555...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] outline-none focus:border-[#0B3D91] dark:focus:border-blue-500"
                  />
                </div>
                <textarea
                  id="contact-message-input"
                  rows={3}
                  required
                  placeholder="Votre question ou demande concernant un bien à Alger..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] outline-none focus:border-[#0B3D91] dark:focus:border-blue-500 resize-none"
                />
                <button
                  id="submit-contact-form-btn"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0B3D91] hover:bg-[#082E6E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>Envoyer ma demande</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
