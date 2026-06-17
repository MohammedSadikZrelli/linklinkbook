import React, { useState, useEffect } from 'react';
import { Navbar, OfferCard } from '../layouts/SharedLayout';

const API_BASE = 'http://localhost:5000/api';

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0 });

  useEffect(() => {
    fetch(`${API_BASE}/books?limit=6`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setFeaturedBooks(res.data || []);
      })
      .catch(() => {});

    fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('linkbook_token')}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar overlay */}
      <Navbar transparent={false} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2777df]/10 via-white to-slate-50 pt-24 pb-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              <span className="inline-block bg-[#fc4d16]/10 text-[#fc4d16] text-xs px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase">
                Plateforme Tunisienne de Troc de Livres
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                Échangez & Donnez vos <span className="text-[#2777df]">Livres Scolaires</span> facilement.
              </h1>
              <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Rejoignez la communauté Linkbook. Donnez une seconde vie à vos livres d'école, romans et manuels universitaires tout en réalisant des économies intelligentes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => window.location.hash = '#register'}
                  className="w-full sm:w-auto px-8 py-4 bg-[#fc4d16] hover:bg-[#e03d0d] text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm"
                >
                  Commencer Gratuitement
                </button>
                <button
                  onClick={() => window.location.hash = '#timeline'}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-[#2777df] text-slate-700 hover:text-[#2777df] font-bold rounded-2xl shadow-sm active:scale-95 transition-all text-sm"
                >
                  Explorer les Offres
                </button>
              </div>

              {/* Quick statistics badge */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-black text-[#2777df]">{stats.totalUsers > 0 ? stats.totalUsers : '5k+'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membres</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-[#fc4d16]">{stats.totalBooks > 0 ? stats.totalBooks : '12k+'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Livres</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-800">24</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wilayas</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#2777df]/20 to-orange-500/10 rounded-full blur-3xl z-0"></div>
              
              <div className="relative z-10 w-full max-w-lg aspect-square rounded-[40px] overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500">
                <img 
                  src="/images/ef14e312c3701e60504f5e11687e6c86.png" 
                  alt="Linkbook Hero Illustration" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/3768ec8e8ce95737a750cad65a6be4ef.jpg';
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Search Selector banner */}
      <section className="max-w-4xl mx-auto px-4 relative -mt-8 z-20">
        <div className="bg-white rounded-[32px] border border-slate-100 p-4 md:p-6 shadow-xl flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Que cherchez-vous ?</label>
              <select id="hp-type"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-[#2777df] transition-all">
                <option value="">Type (Vente/Échange/Don)</option>
                <option value="vente">Vente</option>
                <option value="échange">Échange</option>
                <option value="don">Don</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Où ?</label>
              <select id="hp-wilaya"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-[#2777df] transition-all">
                <option value="">Wilaya</option>
                <option value="Ariana">Ariana</option>
                <option value="Béja">Béja</option>
                <option value="Ben Arous">Ben Arous</option>
                <option value="Bizerte">Bizerte</option>
                <option value="Gabès">Gabès</option>
                <option value="Gafsa">Gafsa</option>
                <option value="Jendouba">Jendouba</option>
                <option value="Kairouan">Kairouan</option>
                <option value="Kasserine">Kasserine</option>
                <option value="Kébili">Kébili</option>
                <option value="Le Kef">Le Kef</option>
                <option value="Mahdia">Mahdia</option>
                <option value="La Manouba">La Manouba</option>
                <option value="Médenine">Médenine</option>
                <option value="Monastir">Monastir</option>
                <option value="Nabeul">Nabeul</option>
                <option value="Sfax">Sfax</option>
                <option value="Sidi Bouzid">Sidi Bouzid</option>
                <option value="Siliana">Siliana</option>
                <option value="Sousse">Sousse</option>
                <option value="Tataouine">Tataouine</option>
                <option value="Tozeur">Tozeur</option>
                <option value="Tunis">Tunis</option>
                <option value="Zaghouan">Zaghouan</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => {
              const type = document.getElementById('hp-type').value;
              const wilaya = document.getElementById('hp-wilaya').value;
              window.location.hash = `#searchresults?type=${type}&wilaya=${wilaya}`;
            }}
            className="w-full md:w-auto px-8 py-3.5 bg-[#2777df] hover:bg-[#185db4] text-white text-xs font-extrabold rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            Rechercher
          </button>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Trois étapes simples et sécurisées pour échanger vos livres en quelques clics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8 text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-[#2777df]/10 text-[#2777df] rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner">
                1
              </div>
              <h3 className="text-base font-black text-slate-900">Créez votre Compte</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Inscrivez-vous gratuitement en quelques secondes. Renseignez votre profil de lecteur et votre ville.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8 text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-[#fc4d16]/10 text-[#fc4d16] rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner">
                2
              </div>
              <h3 className="text-base font-black text-slate-900">Publiez une Offre</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Prenez une photo de vos livres scolaires obsolètes, décrivez-les et proposez vos souhaits d'échange.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8 text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-green-50 text-green-600 rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner">
                3
              </div>
              <h3 className="text-base font-black text-slate-900">Échangez Sécurisé</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Discutez via la messagerie instantanée de Linkbook et convenez d'un rendez-vous pour troquer vos manuels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-[#f4f7fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Annonces Récentes
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Découvrez les derniers livres disponibles près de chez vous
            </p>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBooks.map(book => (
                <OfferCard
                  key={book._id}
                  img={book.images?.[0] || '/images/3768ec8e8ce95737a750cad65a6be4ef.jpg'}
                  title={book.title}
                  desc={`${book.subject || ''} - ${book.level || ''}`}
                  price={book.price ? `${book.price} DT` : book.type === 'don' ? 'Gratuit' : ''}
                  location={book.location || book.user?.wilaya || ''}
                  tag={book.type === 'don' ? 'Don' : book.type === 'échange' ? 'Échange' : 'Vente'}
                  onAction={() => window.location.hash = `#offer-detail?id=${book._id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold">Aucune annonce pour le moment</p>
              <p className="text-xs text-gray-300 mt-1">Soyez le premier à publier !</p>
            </div>
          )}

          <div className="text-center mt-10">
            <button
              onClick={() => window.location.hash = '#timeline'}
              className="px-8 py-3.5 bg-white border-2 border-[#2777df] text-[#2777df] hover:bg-[#2777df] hover:text-white font-bold rounded-2xl transition-all text-sm"
            >
              Voir toutes les annonces
            </button>
          </div>
        </div>
      </section>

      {/* Footer banner */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
            <div className="flex items-center gap-2">
              <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-8 w-auto object-contain brightness-0 invert" alt="Linkbook" />
              <span className="text-white font-black text-xl tracking-tight">Linkbook</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Accueil</a>
              <a href="#timeline" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Shop</a>
              <a href="#community" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Communauté</a>
              <a href="#pricing" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Pack Promo</a>
            </nav>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500 font-medium">
              Copyright © 2026 Linkbook. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-500 hover:text-slate-400 cursor-pointer">Conditions d'utilisation</span>
              <span className="text-[10px] text-slate-500 hover:text-slate-400 cursor-pointer">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
