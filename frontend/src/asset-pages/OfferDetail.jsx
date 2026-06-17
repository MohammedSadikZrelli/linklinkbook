import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';

export default function OfferDetail() {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      name: 'Mohamed Truki',
      time: 'Il y a 2 heures',
      avatar: '/images/d238c6a07f71439c16b328d71ead5416.jpg',
      proposalDesc: 'Je vous propose un échange contre mes livres de 4ème année Math en parfait état. Voir les photos ci-jointes.',
      proposedImages: [
        '/images/694c9a85f499a9880071f476006a4730.png',
        '/images/e3049545b879d2927084c2fc641be246.png'
      ],
      status: 'En attente'
    },
    {
      id: 2,
      name: 'Ahmed Feki',
      time: 'Il y a 5 heures',
      avatar: 'AF',
      proposalDesc: 'Intéressé par l\'échange. J\'ai plusieurs romans scientifiques et livres de physique de 4ème année.',
      proposedImages: [],
      status: 'En attente'
    }
  ]);

  const handleConfirm = (id) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'Confirmé' } : p));
  };

  const handleDelete = (id) => {
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  return (
    <FeedLayout active="Fil d'actualité">
      {/* Back button */}
      <button 
        onClick={() => window.history.back()}
        className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2777df] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Retour aux offres
      </button>

      {/* Main Offer Details */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6">
        {/* User profile row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] text-white flex items-center justify-center font-black text-sm shadow-inner">
              MM
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Malek Makki</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                Sfax • <span className="font-semibold text-gray-400">Il y a 13 heures</span>
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-[#fc4d16]/10 text-[#fc4d16] text-xs font-bold rounded-full">
            Échange
          </span>
        </div>

        {/* Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-slate-50/50 rounded-2xl p-4 md:p-6 border border-slate-100">
          {/* Left: Book Cover Image */}
          <div className="relative h-64 md:h-80 bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
            <img 
              src="/images/694c9a85f499a9880071f476006a4730.png" 
              alt="Livres 3ème Années" 
              className="max-h-full max-w-full object-contain p-4 hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/9daa051ce6458b314a567b7df7c447a2.jpg';
              }}
            />
          </div>

          {/* Right: Info details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-3">
                Étudiant
              </div>
              <h1 className="text-2xl font-black text-gray-900 leading-snug mb-3">
                Livres 3ème Années
              </h1>
              <p className="text-gray-400 text-sm font-medium mb-4">
                Catégorie: <span className="text-gray-800">Manuels Scolaires</span>
              </p>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  Recherche en échange
                </span>
                <span className="text-lg font-black text-orange-700 leading-tight block">
                  Livre 4ème Année
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Vues</span>
                <span className="text-lg font-black text-gray-800">25</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Propositions</span>
                <span className="text-lg font-black text-gray-800">{proposals.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="prose max-w-none">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Je propose une collection complète de manuels scolaires de la 3ème année (Mathématiques, Sciences, Physique et manuels complémentaires). Tous les livres sont en excellent état, peu utilisés et prêts pour une nouvelle rentrée.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">
            Je cherche uniquement à les échanger contre les manuels équivalents pour la 4ème année de section Mathématiques. Merci de faire vos offres de troc ci-dessous !
          </p>
        </div>
      </div>

      {/* Proposals Section */}
      <div className="mb-6">
        <h2 className="text-base font-black text-gray-900 mb-4 flex items-center justify-between">
          <span>Propositions de troc ({proposals.length})</span>
          <button className="px-3 py-1.5 bg-[#2777df] hover:bg-[#185db4] text-white text-xs font-bold rounded-xl transition-all">
            Proposer un échange
          </button>
        </h2>

        {proposals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-400 text-sm font-medium">
            Aucune proposition de troc pour le moment. Soyez le premier !
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map(prop => (
              <div key={prop.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Proposal header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {typeof prop.avatar === 'string' && prop.avatar.startsWith('/') ? (
                      <img src={prop.avatar} alt={prop.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-[#2777df] font-black text-xs flex items-center justify-center">
                        {prop.avatar}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{prop.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">{prop.time}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold 
                    ${prop.status === 'Confirmé' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}
                  >
                    {prop.status}
                  </span>
                </div>

                {/* Proposal content */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {prop.proposalDesc}
                </p>

                {/* Proposed Images list */}
                {prop.proposedImages.length > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    {prop.proposedImages.map((img, index) => (
                      <div key={index} className="h-16 w-16 bg-slate-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center p-1">
                        <img 
                          src={img} 
                          className="max-h-full max-w-full object-contain rounded-lg" 
                          alt="Proposé"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/9daa051ce6458b314a567b7df7c447a2.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    {prop.status !== 'Confirmé' && (
                      <button 
                        onClick={() => handleConfirm(prop.id)}
                        className="px-4 py-2 bg-[#2777df] hover:bg-[#185db4] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Confirmer
                      </button>
                    )}
                    <button 
                      onClick={() => window.location.hash = '#messages'}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Conversation
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(prop.id)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Supprimer
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </FeedLayout>
  );
}
