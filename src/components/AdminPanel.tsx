import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  ExternalLink,
  Users,
  Building,
  Flag,
  Sparkles
} from 'lucide-react';
import { Property, PropertyStatus } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    properties, 
    updatePropertyStatus, 
    togglePropertyVerified, 
    deleteProperty, 
    setSelectedProperty,
    reports,
    resolveReport,
    t
  } = useApp();
  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'moderation' | 'all_listings' | 'reports'>('moderation');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingProperties = properties.filter(p => p.status === 'pending');
  const reportedProperties = properties.filter(p => p.status === 'reported');

  const handleApprove = async (id: string) => {
    await updatePropertyStatus(id, 'published');
  };

  const handleReject = async (id: string) => {
    await updatePropertyStatus(id, 'rejected');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-[#161616] via-[#141414] to-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a36c]/10 border border-[#c5a36c]/30 text-[#c5a36c] text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-[#c5a36c]" />
            <span>Panneau d'Administration & Modération ImmoPlus</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white">{t('adminTitle')}</h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Gérez les annonces, validez les nouvelles publications et traitez les signalements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#1f1f1f] border border-white/10 text-[#e5e5e5] px-3.5 py-1.5 rounded-xl font-medium">
            Admin : {userProfile?.displayName || 'Oussama Guesmia'}
          </span>
        </div>
      </div>

      {/* Admin KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <p className="text-xs font-medium text-[#888888] mb-1">{t('pendingApproval')}</p>
          <p className="font-serif text-2xl font-medium text-[#c5a36c]">{pendingProperties.length}</p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <p className="text-xs font-medium text-[#888888] mb-1">Total Annonces Actives</p>
          <p className="font-serif text-2xl font-medium text-white">
            {properties.filter(p => p.status === 'published').length}
          </p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <p className="text-xs font-medium text-[#888888] mb-1">Signalements en attente</p>
          <p className="font-serif text-2xl font-medium text-rose-400">{reports.filter(r => r.status === 'pending').length}</p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <p className="text-xs font-medium text-[#888888] mb-1">Annonces Vérifiées</p>
          <p className="font-serif text-2xl font-medium text-emerald-400">{properties.filter(p => p.verified).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'moderation'
              ? 'border-[#c5a36c] text-[#c5a36c]'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <span>{t('adminModerationQueue')}</span>
          {pendingProperties.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c5a36c] text-[#0a0a0a]">
              {pendingProperties.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all_listings')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'all_listings'
              ? 'border-[#c5a36c] text-[#c5a36c]'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <span>Toutes les annonces ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'reports'
              ? 'border-[#c5a36c] text-[#c5a36c]'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>{t('adminReportedProperties')} ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          {pendingProperties.length === 0 ? (
            <div className="bg-[#0f0f0f] rounded-3xl p-12 text-center border border-white/10">
              <Check className="w-12 h-12 text-[#c5a36c] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-medium text-white">Toutes les annonces sont traitées !</h3>
              <p className="text-xs text-[#888888] mt-1">Aucune nouvelle annonce en attente de validation.</p>
            </div>
          ) : (
            pendingProperties.map((prop) => (
              <div 
                key={prop.id}
                className="bg-[#0f0f0f] rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img 
                    src={prop.images[0]?.url} 
                    alt="" 
                    className="w-24 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#c5a36c] text-[#0a0a0a]">
                        {prop.transactionType === 'sale' ? 'À vendre' : 'À louer'}
                      </span>
                      <span className="text-[11px] font-mono text-[#777777]">Réf: {prop.referenceNumber}</span>
                    </div>

                    <h3 className="font-serif text-sm sm:text-base font-medium text-white">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#888888]">
                      Annonceur : <span className="font-semibold text-[#e5e5e5]">{prop.ownerName}</span> ({prop.ownerEmail}, {prop.ownerPhone})
                    </p>
                    <p className="text-xs font-serif font-medium text-[#c5a36c] mt-1">
                      {new Intl.NumberFormat('fr-FR').format(prop.price)} {prop.currency} • {prop.surface} m² • {prop.location.city}
                    </p>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="px-3 py-2 rounded-xl border border-white/10 text-white text-xs font-semibold hover:bg-[#1a1a1a] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Eye className="w-4 h-4 text-[#c5a36c]" />
                    <span>Examiner</span>
                  </button>

                  <button
                    onClick={() => handleReject(prop.id)}
                    className="px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-800/30 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>{t('adminReject')}</span>
                  </button>

                  <button
                    onClick={() => handleApprove(prop.id)}
                    className="px-4 py-2 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('adminApprove')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL LISTINGS MANAGEMENT */}
      {activeTab === 'all_listings' && (
        <div className="space-y-3">
          {properties.map((prop) => (
            <div 
              key={prop.id}
              className="bg-[#0f0f0f] rounded-2xl border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <img src={prop.images[0]?.url} alt="" className="w-16 h-14 rounded-xl object-cover border border-white/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-xs sm:text-sm font-medium text-white line-clamp-1">{prop.title}</h4>
                    {prop.verified && <ShieldCheck className="w-4 h-4 text-[#c5a36c] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#888888]">
                    {prop.location.city} • {prop.surface} m² • {prop.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePropertyVerified(prop.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    prop.verified 
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/30'
                      : 'bg-[#181818] text-[#888888] border border-white/10 hover:text-white'
                  }`}
                >
                  {prop.verified ? 'Vérifié ✓' : '+ Certifier'}
                </button>

                <button
                  onClick={() => deleteProperty(prop.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                  title="Supprimer définitivement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-[#0f0f0f] rounded-3xl p-12 text-center border border-white/10">
              <p className="font-serif text-sm font-medium text-[#888888]">Aucun signalement actif.</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="bg-[#0f0f0f] rounded-2xl border border-white/10 p-4 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-950/50 border border-rose-800/30 text-rose-300">
                    Motif: {r.reason}
                  </span>
                  <p className="font-serif text-xs font-medium text-white mt-1">
                    Annonce signalée : {r.propertyTitle}
                  </p>
                  <p className="text-xs text-[#888888] mt-0.5">{r.details}</p>
                </div>

                <button
                  onClick={() => resolveReport(r.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-white/10 text-xs font-semibold text-white cursor-pointer transition-colors"
                >
                  Marquer résolu
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
