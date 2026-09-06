import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, X, Shield, Server } from 'lucide-react';
import { testFirestoreConnection, DatabaseTestResult } from '../firebase/testConnection';

interface DatabaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseDiagnosticModal: React.FC<DatabaseDiagnosticModalProps> = ({ isOpen, onClose }) => {
  const { t, lang, properties } = useApp();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<DatabaseTestResult | null>(null);

  const runTest = async () => {
    setTesting(true);
    try {
      const res = await testFirestoreConnection();
      setResult(res);
    } catch (err: any) {
      setResult({
        status: 'error',
        message: err.message || 'Erreur inattendue lors du test',
        projectId: 'immoplus-ac66f',
        databaseId: '(default)',
        rawError: String(err)
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#101726] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center shadow-sm shrink-0">
            <Database className="w-6 h-6 text-[#0B3D91] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Test de la Base de Données Firebase
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Diagnostic de connectivité Cloud Firestore en temps réel
            </p>
          </div>
        </div>

        {/* Configuration Overview */}
        <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 mb-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Projet Firebase :</span>
            <span className="font-mono font-bold text-[#0B3D91] dark:text-blue-300">immoplus-ac66f</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Base Firestore ID :</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">(default)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Stockage Annonces Actuelles :</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {properties.length} annonce(s) en mémoire & cache
            </span>
          </div>
        </div>

        {/* Test Result Card */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Résultat du test
            </span>
            {result?.testedAt && (
              <span className="text-[11px] text-slate-400">
                Testé à {result.testedAt}
              </span>
            )}
          </div>

          {testing ? (
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center gap-3 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0B3D91] dark:text-blue-400" />
              <span>Vérification de la connexion à Cloud Firestore...</span>
            </div>
          ) : result?.status === 'connected' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    Connexion établie avec succès !
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    Base Firestore non encore créée sur ce projet
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 mt-1">
                    Votre projet Firebase <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">immoplus-ac66f</code> est bien relié, mais l'instance <strong>Cloud Firestore</strong> doit être initialisée dans votre console Firebase.
                  </p>
                </div>
              </div>

              {/* Action link to open Firebase console directly */}
              <a
                href="https://console.firebase.google.com/project/immoplus-ac66f/firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Activer Firestore dans la Console Firebase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 italic leading-relaxed">
                👉 Dans la console : cliquez sur « Créer une base de données », choisissez « Mode test » et l'emplacement par défaut (europe-west).
              </p>
            </div>
          )}
        </div>

        {/* Local Persistence Reassurance */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 mb-5 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Mode résilient actif :</strong> L'application ImmoPlus continue de fonctionner à 100% avec persistance locale sécurisée en attendant l'activation de Firestore.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={runTest}
            disabled={testing}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B3D91] hover:bg-[#082d6b] text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Test en cours...' : 'Tester à nouveau'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
