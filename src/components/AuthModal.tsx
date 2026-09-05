import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, AccountType } from '../types';
import { X, Mail, Lock, Phone, User, Building, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    t 
  } = useApp();

  const { loginWithEmail, registerWithEmail, loginAsDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('+213 555 12 34 56');
  const [accountType, setAccountType] = useState<AccountType>('private_owner');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName, accountType, phone);
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole, type: AccountType) => {
    loginAsDemoUser(role, type);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] text-[#e5e5e5] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/10 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-[#888888] hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-[#c5a36c]/10 border border-[#c5a36c]/20 text-[#c5a36c] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-white tracking-tight">
            {authModalMode === 'login' ? t('loginTitle') : t('registerTitle')}
          </h3>
          <p className="text-xs text-[#999999] mt-1.5">
            {authModalMode === 'login' ? 'Accédez à votre espace ImmoPlus' : 'Créez votre compte en quelques secondes'}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('accountType')}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAccountType('private_owner')}
                    className={`p-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                      accountType === 'private_owner' ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-[#c5a36c]' : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                    }`}
                  >
                    {t('privateOwner')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('agency')}
                    className={`p-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                      accountType === 'agency' ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-[#c5a36c]' : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                    }`}
                  >
                    {t('realEstateAgency')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('promoter')}
                    className={`p-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                      accountType === 'promoter' ? 'border-[#c5a36c] bg-[#c5a36c]/10 text-[#c5a36c]' : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                    }`}
                  >
                    {t('promoter')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('fullName')}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ex: Karim Benali"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1">{t('phone')}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+213 555 12 34 56"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1">{t('email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-1">{t('password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#161616] text-white placeholder-[#666666] text-xs focus:border-[#c5a36c]/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#c5a36c] hover:bg-[#d4b57e] text-[#0a0a0a] font-bold text-xs uppercase tracking-wider shadow-lg transition-all mt-2 cursor-pointer"
          >
            {loading ? 'Chargement...' : authModalMode === 'login' ? t('navLogin') : t('navRegister')}
          </button>
        </form>

        {/* Toggle between login & register */}
        <div className="mt-4 text-center text-xs text-[#888888]">
          {authModalMode === 'login' ? (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="font-bold text-[#c5a36c] hover:underline cursor-pointer"
              >
                Inscrivez-vous
              </button>
            </p>
          ) : (
            <p>
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="font-bold text-[#c5a36c] hover:underline cursor-pointer"
              >
                Connectez-vous
              </button>
            </p>
          )}
        </div>

        {/* 1-Click Demo Accounts for Instant Testing */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#888888] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a36c]" />
            <span>Test instantané (Comptes Démo) :</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('user', 'private_owner')}
              className="px-2.5 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-white/10 text-[11px] font-medium text-[#e5e5e5] text-center cursor-pointer transition-colors"
            >
              Particulier
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('agent', 'agency')}
              className="px-2.5 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#c5a36c]/30 text-[11px] font-medium text-[#c5a36c] text-center cursor-pointer transition-colors"
            >
              Agence Pro
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin', 'private_owner')}
              className="px-2.5 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-purple-500/30 text-[11px] font-medium text-purple-300 text-center cursor-pointer transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
