import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Home, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Edit, 
  ExternalLink,
  User,
  ShieldCheck,
  Building2,
  Plus
} from 'lucide-react';
import { PropertyStatus } from '../types';

export const UserDashboard: React.FC = () => {
  const { 
    properties, 
    updatePropertyStatus, 
    deleteProperty, 
    setSelectedProperty, 
    setActiveTab, 
    t 
  } = useApp();
  const { userProfile, updateProfile } = useAuth();

  const [activeTabSub, setActiveTabSub] = useState<'listings' | 'profile'>('listings');
  const [editingName, setEditingName] = useState(userProfile?.displayName || '');
  const [editingPhone, setEditingPhone] = useState(userProfile?.phone || '');
  const [editingWhatsapp, setEditingWhatsapp] = useState(userProfile?.whatsapp || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // User's own properties
  const myProperties = properties.filter(p => 
    p.ownerId === (userProfile?.uid || 'user-default') || 
    p.ownerEmail === userProfile?.email
  );

  const publishedCount = myProperties.filter(p => p.status === 'published').length;
  const pendingCount = myProperties.filter(p => p.status === 'pending').length;
  const totalViews = myProperties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: editingName,
      phone: editingPhone,
      whatsapp: editingWhatsapp
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Dashboard Top Profile Header */}
      <div className="bg-[#0f0f0f] text-[#e5e5e5] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=140&q=80'} 
            alt="" 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#c5a36c] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-medium text-white">
                {userProfile?.displayName || 'Oussama Guesmia'}
              </h1>
              <span className="text-[#c5a36c]" title="Profil vérifié">
                <ShieldCheck className="w-5 h-5 fill-[#c5a36c]/20" />
              </span>
            </div>
            <p className="text-xs text-[#888888] mt-0.5">
              {userProfile?.email} • {userProfile?.phone || '+213 555 12 34 56'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#181818] border border-[#c5a36c]/30 text-[#c5a36c]">
                {userProfile?.accountType === 'agency' ? 'Agence Immobilière' : userProfile?.accountType === 'promoter' ? 'Promoteur' : 'Particulier'}
              </span>
              {userProfile?.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1a1a1a] text-purple-300 border border-purple-500/30">
                  Administrateur
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('publish')}
          className="px-5 py-2.5 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('navPublish')}</span>
        </button>
      </div>

      {/* KPI Stats Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#888888] mb-2">
            <span className="text-xs font-medium text-[#888888]">{t('totalProperties')}</span>
            <Home className="w-5 h-5 text-[#c5a36c]" />
          </div>
          <p className="font-serif text-2xl font-medium text-white">{myProperties.length}</p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#888888] mb-2">
            <span className="text-xs font-medium text-[#888888]">{t('publishedProperties')}</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-serif text-2xl font-medium text-white">{publishedCount}</p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#888888] mb-2">
            <span className="text-xs font-medium text-[#888888]">{t('pendingProperties')}</span>
            <Clock className="w-5 h-5 text-[#c5a36c]" />
          </div>
          <p className="font-serif text-2xl font-medium text-[#c5a36c]">{pendingCount}</p>
        </div>

        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-[#888888] mb-2">
            <span className="text-xs font-medium text-[#888888]">{t('views')}</span>
            <Eye className="w-5 h-5 text-[#e5e5e5]" />
          </div>
          <p className="font-serif text-2xl font-medium text-white">{totalViews}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTabSub('listings')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTabSub === 'listings'
              ? 'border-[#c5a36c] text-[#c5a36c]'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          {t('myProperties')} ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTabSub('profile')}
          className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTabSub === 'profile'
              ? 'border-[#c5a36c] text-[#c5a36c]'
              : 'border-transparent text-[#888888] hover:text-white'
          }`}
        >
          {t('profileSettings')}
        </button>
      </div>

      {/* TAB CONTENT: MY PROPERTIES */}
      {activeTabSub === 'listings' && (
        <div className="space-y-3">
          {myProperties.length === 0 ? (
            <div className="bg-[#0f0f0f] rounded-3xl p-12 text-center border border-white/10">
              <Building2 className="w-12 h-12 text-[#555555] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-medium text-white">Aucune annonce déposée</h3>
              <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto mb-4">
                Publiez dès aujourd'hui votre première annonce immobilière pour trouver des acheteurs et locataires.
              </p>
              <button
                onClick={() => setActiveTab('publish')}
                className="px-5 py-2.5 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                {t('navPublish')}
              </button>
            </div>
          ) : (
            myProperties.map((prop) => (
              <div 
                key={prop.id}
                className="bg-[#0f0f0f] rounded-2xl border border-white/10 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img 
                    src={prop.images[0]?.url} 
                    alt="" 
                    className="w-20 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        prop.status === 'published' 
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/30'
                          : prop.status === 'pending'
                          ? 'bg-[#c5a36c]/10 text-[#c5a36c] border border-[#c5a36c]/30'
                          : 'bg-[#181818] text-[#888888] border border-white/10'
                      }`}>
                        {prop.status === 'published' ? 'En ligne' : prop.status === 'pending' ? 'En attente' : prop.status}
                      </span>
                      <span className="text-[11px] font-mono text-[#777777]">Réf: {prop.referenceNumber}</span>
                    </div>

                    <h3 className="font-serif text-sm font-medium text-white truncate">
                      {prop.title}
                    </h3>
                    <p className="text-xs font-serif font-medium text-[#c5a36c]">
                      {new Intl.NumberFormat('fr-FR').format(prop.price)} {prop.currency}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="p-2 text-[#888888] hover:text-white hover:bg-[#1a1a1a] rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    title="Voir l'annonce"
                  >
                    <ExternalLink className="w-4 h-4 text-[#c5a36c]" />
                    <span className="hidden sm:inline">Aperçu</span>
                  </button>

                  {prop.status === 'published' && (
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'sold_rented')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#202020] border border-white/10 text-[#c5a36c] text-xs font-semibold cursor-pointer"
                    >
                      Marquer Vendu/Loué
                    </button>
                  )}

                  <button
                    onClick={() => deleteProperty(prop.id)}
                    className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
                    title="Supprimer l'annonce"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE SETTINGS */}
      {activeTabSub === 'profile' && (
        <div className="bg-[#0f0f0f] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl max-w-xl">
          <h2 className="font-serif text-base font-medium text-white mb-4">Mettre à jour vos coordonnées</h2>

          {profileSaved && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/30 text-emerald-300 text-xs font-bold">
              Profil mis à jour avec succès !
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">{t('fullName')}</label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#161616] text-white focus:border-[#c5a36c]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">{t('phone')}</label>
              <input
                type="tel"
                value={editingPhone}
                onChange={(e) => setEditingPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#161616] text-white focus:border-[#c5a36c]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#999999] mb-1">{t('whatsapp')}</label>
              <input
                type="tel"
                value={editingWhatsapp}
                onChange={(e) => setEditingWhatsapp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-white/10 text-xs bg-[#161616] text-white focus:border-[#c5a36c]/60"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer transition-colors"
            >
              {t('saveChanges')}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
