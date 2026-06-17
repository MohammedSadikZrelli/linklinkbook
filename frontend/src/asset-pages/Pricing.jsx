import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { subscriptionAPI, getUser, saveUser } from '../services/api';

export default function Pricing() {
  const [successMsg, setSuccessMsg] = useState('');
  const [buying, setBuying] = useState(false);

  const user = getUser();
  const isPro = user?.subscriptionActive;

  const handleBuy = async () => {
    if (isPro) return;
    setBuying(true);
    try {
      const res = await subscriptionAPI.purchase('pro');
      const updatedUser = { ...user, ...res.data.user };
      saveUser(updatedUser);
      setSuccessMsg('Abonnement Pro activé avec succès !');
      setTimeout(() => window.location.hash = '#dashboard', 1500);
    } catch (err) {
      setSuccessMsg('Erreur : ' + err.message);
    } finally {
      setBuying(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <FeedLayout active="Devenir Pro" title="Devenir Pro">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block bg-[#2777df]/10 text-[#2777df] text-xs px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase mb-4">
          Tarifs
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          {isPro ? 'Vous êtes déjà Pro ✅' : 'Passez à Pro et débloquez tout'}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          {isPro
            ? 'Vous avez un accès illimité à toutes les fonctionnalités de LinkBook.'
            : 'Publiez des offres, contactez les vendeurs et profitez d\'un accès illimité pendant 1 an.'}
        </p>
      </div>

      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-emerald-200 rounded-3xl p-5 shadow-2xl flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 font-black text-lg">✓</div>
          <div>
            <h4 className="text-sm font-black text-gray-950">{successMsg}</h4>
          </div>
        </div>
      )}

      <div className="max-w-sm mx-auto">
        <div className="relative rounded-[32px] p-8 bg-gradient-to-b from-[#2777df] to-[#185db4] text-white border border-transparent shadow-2xl shadow-blue-500/30">
          <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10">
            Pro
          </span>
          <div className="mb-6">
            <span className="text-xs font-black uppercase tracking-wider block mb-2 text-blue-100">Abonnement annuel</span>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tight">10</span>
              <span className="text-sm font-bold text-blue-100">DT/an</span>
            </div>
            <p className="text-xs font-medium text-blue-100">Accès illimité pendant 1 an</p>
          </div>
          <ul className="space-y-3.5 mb-8">
            {[
              'Publication d\'offres illimitée',
              'Échanges et dons gratuits',
              'Accès complet à la carte',
              'Historique des transactions complet',
              'Notifications en temps réel',
            ].map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs font-semibold">
                <svg className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-blue-50">{feat}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleBuy}
            disabled={buying || isPro}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98] ${isPro ? 'bg-white/20 text-white cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-[#2777df] shadow-lg shadow-white/10'}`}
          >
            {buying ? 'Activation...' : isPro ? 'Déjà abonné' : 'S\'abonner — 10 DT'}
          </button>
        </div>
      </div>
    </FeedLayout>
  );
}
