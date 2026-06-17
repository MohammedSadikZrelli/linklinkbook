import React, { useState } from 'react';
import { FeedLayout, OfferCard } from '../layouts/SharedLayout';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('Offres');
  const [currentPage, setCurrentPage] = useState(1);

  const userOffers = [
    {
      id: 1,
      title: 'Livres Math 3ème',
      desc: 'Collection complète de manuels scolaires de la 3ème année math en Tunisie.',
      img: '/images/694c9a85f499a9880071f476006a4730.png',
      tag: 'Etudiant',
      price: 'Échange'
    },
    {
      id: 2,
      title: 'Physique 3ème Année',
      desc: 'Livre d\'exercices corrigés de physique pour la 3ème année secondaire.',
      img: '/images/9daa051ce6458b314a567b7df7c447a2.jpg',
      tag: 'Etudiant',
      price: '15 DT'
    },
    {
      id: 3,
      title: 'Sciences de la Vie 3ème',
      desc: 'Manuel officiel tunisien de SVT pour la section scientifique.',
      img: '/images/e3049545b879d2927084c2fc641be246.png',
      tag: 'Etudiant',
      price: 'Échange'
    }
  ];

  return (
    <FeedLayout active="Fil d'actualité">
      {/* Back to feed trigger */}
      <button 
        onClick={() => window.history.back()}
        className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2777df] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Retour
      </button>

      {/* Public User Card Block */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
        
        {/* Dynamic header visual overlay */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-[#2777df] to-[#fc4d16] opacity-90 z-0"></div>

        {/* User Content Details */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mt-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="h-28 w-28 rounded-3xl bg-white p-1 border-4 border-white shadow-xl flex-shrink-0 overflow-hidden">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-[#2777df]/10 to-[#fc4d16]/10 text-[#2777df] flex items-center justify-center font-black text-2xl">
                MM
              </div>
            </div>

            {/* Profile Info */}
            <div className="mb-2">
              <div className="inline-block px-2.5 py-0.5 bg-[#fc4d16]/10 text-[#fc4d16] text-[10px] font-bold rounded-full mb-1.5">
                Étudiant
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">
                Malek Makki
              </h1>
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                Sfax, Tunisie
              </p>
            </div>
          </div>

          {/* Action Call Buttons */}
          <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
            {/* Message Action */}
            <button 
              onClick={() => window.location.hash = '#messages'}
              className="flex-1 sm:flex-initial py-2.5 px-6 bg-[#fc4d16] hover:bg-[#e03d0d] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-orange-500/10 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Message
            </button>

            {/* Email Action */}
            <button 
              onClick={() => window.location.href = 'mailto:malek@linkbook.com'}
              className="flex-1 sm:flex-initial py-2.5 px-6 bg-[#2777df] hover:bg-[#185db4] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email
            </button>

            {/* Phone Action */}
            <button 
              onClick={() => alert('Appeler Malek au +216 21 640 651')}
              className="flex-1 sm:flex-initial py-2.5 px-6 bg-[#1fa74c] hover:bg-[#198d3f] text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-green-500/10 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Téléphone
            </button>
          </div>

        </div>

      </div>

      {/* Tabs list */}
      <div className="border-b border-gray-200 mb-6 flex gap-4">
        <button 
          onClick={() => setActiveTab('Offres')}
          className={`pb-3 text-sm font-black border-b-2 transition-all px-2
            ${activeTab === 'Offres' ? 'border-[#2777df] text-[#2777df]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Offres de Malek ({userOffers.length})
        </button>
      </div>

      {/* Offers Listings Grid */}
      {activeTab === 'Offres' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {userOffers.map(offer => (
              <OfferCard 
                key={offer.id}
                title={offer.title}
                desc={offer.desc}
                img={offer.img}
                price={offer.price}
                tag={offer.tag}
                location="Sfax"
                onAction={() => window.location.hash = `#product-${offer.id}`}
              />
            ))}
          </div>

          {/* Carousel / Pagination row */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs font-black text-gray-600">
              {currentPage} / 6
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(6, currentPage + 1))}
              disabled={currentPage === 6}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </>
      )}

    </FeedLayout>
  );
}
