import React from 'react';
import { FeedLayout } from '../layouts/SharedLayout';

export default function ProductDetail() {
  return (
    <FeedLayout active="Fil d'actualité">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <div className="h-80 bg-gray-100"><img src="/images/9daa051ce6458b314a567b7df7c447a2.jpg" alt="Livres math" className="w-full h-full object-cover" /></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['/images/9daa051ce6458b314a567b7df7c447a2.jpg', '/images/a6bb132d342bb33f433dccca87759b72.jpg', '/images/e63275cd7203a0496c3210915dd1b6d1.jpg', '/images/c31c63442f66c9d7210942c880fd4638.jpg'].map((img, i) => (
              <div key={i} className={`h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${i === 0 ? 'border-[#2777df]' : 'border-transparent hover:border-gray-300'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#2777df] text-xs font-bold rounded-full mb-3">Étudiant</span>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Livres math</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-black text-[#2777df]">20 DT</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                Sfax
              </span>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-[#2777df] hover:bg-[#185db4] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#2777df]/20">Contacter le vendeur</button>
              <button className="px-5 py-3 border border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
          </div>

          {/* Seller */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vendeur</div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2777df] to-[#185db4] flex items-center justify-center text-white font-black text-sm flex-shrink-0">MT</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">Mohamed Truki</div>
                <div className="text-xs text-gray-400">Sfax · Membre depuis 2024</div>
              </div>
              <button className="px-4 py-2 bg-[#2777df]/5 text-[#2777df] text-xs font-bold rounded-xl hover:bg-[#2777df] hover:text-white transition-all">Message</button>
            </div>
          </div>
        </div>
      </div>
    </FeedLayout>
  );
}
