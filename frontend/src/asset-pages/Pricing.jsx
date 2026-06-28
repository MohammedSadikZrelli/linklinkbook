import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { subscriptionAPI, getUser, saveUser } from '../services/api';

const PLANS = [
  {
    name: 'Starter',
    desc: 'Pour commencer en douceur',
    price: 'Gratuit',
    period: null,
    features: [
      '3 annonces actives',
      'Photos standard',
      'Messagerie illimitée',
      'Sans marque blanche',
    ],
    popular: false,
    action: { label: 'Commencer', hash: '#create-offer' },
  },
  {
    name: 'Pro',
    desc: 'Le plus choisi',
    price: '9 DT',
    period: '/mois',
    features: [
      'Annonces illimitées',
      'Photos HD (IA)',
      'Statistiques avancées',
      'Badge Pro vérifié',
      'Support prioritaire',
    ],
    popular: true,
    action: { label: "S'abonner", hash: null },
  },
  {
    name: 'Premium',
    desc: 'Pour les gros vendeurs',
    price: '19 DT',
    period: '/mois',
    features: [
      'Tout le pack Pro',
      'Annonces en vedette',
      'Mise en avant 7 jours',
      'API revendeur',
      'Compte dédié',
    ],
    popular: false,
    action: { label: 'Nous contacter', hash: '#contact' },
  },
];

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
    <FeedLayout active="Devenir Pro" title="Tarifs">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block bg-[#2777df]/10 text-[#2777df] text-xs px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase mb-4">
          Tarifs
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          {isPro ? 'Vous êtes déjà Pro ✅' : 'Boostez vos Annonces'}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">
          {isPro
            ? 'Vous avez un accès illimité à toutes les fonctionnalités de LinkBook.'
            : 'Choisissez le pack qui correspond à vos besoins et maximisez vos chances d\'échange.'}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {PLANS.map((plan) => {
          const isProPlan = plan.name === 'Pro';
          const isStarter = plan.name === 'Starter';

          return (
            <div
              key={plan.name}
              className={`relative rounded-[32px] p-6 flex flex-col ${
                isProPlan
                  ? 'bg-gradient-to-b from-[#2777df] to-[#185db4] text-white border-2 border-[#2777df] shadow-xl shadow-blue-500/20 scale-105'
                  : 'bg-white text-gray-900 border border-gray-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fc4d16] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Populaire
                </span>
              )}

              <h3 className={`text-lg font-black mb-1 ${isProPlan ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
              <p className={`text-sm font-medium mb-5 ${isProPlan ? 'text-blue-200' : 'text-gray-400'}`}>{plan.desc}</p>

              <div className="mb-6">
                <span className={`text-4xl font-black ${isProPlan ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                {plan.period && (
                  <span className={`text-sm font-medium ml-1 ${isProPlan ? 'text-blue-200' : 'text-gray-400'}`}>{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs font-semibold">
                    <svg className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isProPlan ? 'text-green-300' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={isProPlan ? 'text-blue-50' : 'text-gray-500'}>{feat}</span>
                  </li>
                ))}
              </ul>

              {isStarter ? (
                <a
                  href={plan.action.hash}
                  className="block w-full py-3 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98] text-center"
                >
                  {plan.action.label}
                </a>
              ) : isProPlan ? (
                <button
                  onClick={handleBuy}
                  disabled={buying || isPro}
                  className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98] ${
                    isPro
                      ? 'bg-white/20 text-white cursor-not-allowed'
                      : 'bg-white hover:bg-slate-50 text-[#2777df] shadow-lg shadow-white/10'
                  }`}
                >
                  {buying ? 'Activation...' : isPro ? 'Déjà abonné' : `${plan.action.label} — ${plan.price}`}
                </button>
              ) : (
                <a
                  href={plan.action.hash}
                  className="block w-full py-3 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98] text-center"
                >
                  {plan.action.label}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </FeedLayout>
  );
}
