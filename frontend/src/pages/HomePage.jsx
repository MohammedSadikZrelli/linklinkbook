import React, { useState, useEffect } from 'react';
import { Navbar, OfferCard } from '../layouts/SharedLayout';
import logoImg from '../assets/logo.png';

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

    const token = localStorage.getItem('linkbook_token');
    fetch(`${API_BASE}/admin/stats`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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
       <Navbar transparent={false} logoBackground="white" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#2777df]/10 via-white to-slate-50 pt-24 pb-16 md:py-32">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                  className="btn-brand w-full sm:w-auto px-8 py-4 text-sm"
                >
                  Commencer Gratuitement
                </button>
                <button
                  onClick={() => window.location.hash = '#timeline'}
                  className="btn-outline w-full sm:w-auto px-8 py-4 text-sm"
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
              className="w-full md:w-auto px-8 py-3.5 btn-brand text-xs"
           >
            Rechercher
          </button>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="card-lift bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center space-y-4">
              <div className="h-16 w-16 bg-[#2777df]/10 text-[#2777df] rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner">
                1
              </div>
              <h3 className="text-base font-black text-slate-900">Créez votre Compte</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Inscrivez-vous gratuitement en quelques secondes. Renseignez votre profil de lecteur et votre ville.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-lift bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center space-y-4">
              <div className="h-16 w-16 bg-[#fc4d16]/10 text-[#fc4d16] rounded-2xl mx-auto flex items-center justify-center font-black text-xl shadow-inner">
                2
              </div>
              <h3 className="text-base font-black text-slate-900">Publiez une Offre</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Prenez une photo de vos livres scolaires obsolètes, décrivez-les et proposez vos souhaits d'échange.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-lift bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center space-y-4">
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
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Annonces Récentes
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Découvrez les derniers livres disponibles près de chez vous
            </p>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="animate-fade-in flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 text-gray-300">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-900">Aucune annonce pour le moment</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-400">
                Soyez le premier à publier une offre et rejoignez la communauté Linkbook.
              </p>
              <a href="#create-offer" className="btn-brand mt-6">
                Créer une offre
              </a>
            </div>
          )}

          <div className="text-center mt-10">
            <button
              onClick={() => window.location.hash = '#timeline'}
              className="btn-outline px-8 py-3.5 text-sm"
            >
              Voir toutes les annonces
            </button>
          </div>
        </div>
      </section>

      {/* Pro / Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-[#2777df]/10 text-[#2777df] text-xs px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase mb-4">
              Passer Pro
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              Boostez vos Annonces
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Choisissez le pack qui correspond à vos besoins et maximisez vos chances d'échange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-card p-8 flex flex-col">
              <h3 className="text-lg font-black text-gray-900 mb-2">Starter</h3>
              <p className="text-sm text-gray-400 font-medium mb-6">Pour commencer en douceur</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">Gratuit</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 annonces actives', 'Photos standard', 'Messagerie illimitée', 'Sans marque blanche'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => window.location.hash = '#register'} className="w-full py-3 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98]">
                Commencer
              </button>
            </div>

            <div className="relative bg-gradient-to-b from-[#2777df] to-[#185db4] rounded-3xl shadow-xl shadow-[#2777df]/20 p-8 flex flex-col scale-105 border-2 border-[#2777df]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fc4d16] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Populaire</span>
              <h3 className="text-lg font-black text-white mb-2">Pro</h3>
              <p className="text-sm text-blue-200 font-medium mb-6">Le plus choisi</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">9 DT</span>
                <span className="text-blue-200 text-sm font-medium ml-1">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Annonces illimitées', 'Photos HD (IA)', 'Statistiques avancées', 'Badge Pro vérifié', 'Support prioritaire'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-blue-100 font-medium">
                    <svg className="h-4 w-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => window.location.hash = '#register'} className="w-full py-3 bg-white text-[#2777df] font-black text-sm rounded-2xl hover:bg-blue-50 transition-all active:scale-[0.98] shadow-lg">
                Choisir Pro
              </button>
            </div>

            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-card p-8 flex flex-col">
              <h3 className="text-lg font-black text-gray-900 mb-2">Premium</h3>
              <p className="text-sm text-gray-400 font-medium mb-6">Pour les gros vendeurs</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">19 DT</span>
                <span className="text-gray-400 text-sm font-medium ml-1">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Tout le pack Pro', 'Annonces en vedette', 'Mise en avant 7 jours', 'API revendeur', 'Compte dédié'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => window.location.hash = '#register'} className="w-full py-3 border border-gray-200 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98]">
                Choisir Premium
              </button>
            </div>
          </div>
        </div>
      </section>

{/* Footer banner */}
       <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
         <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
              <div className="flex items-center gap-2">
                <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-8 w-auto object-contain brightness-0 invert" alt="Linkbook" />
              </div>
             <nav className="flex flex-wrap justify-center gap-6">
               {/* <a href="#timeline" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Shop</a>
               <a href="#community" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Communauté</a>
               <a href="#pricing" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Pack Promo</a> */}
             </nav>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500 font-medium">
              Copyright © 2026 Linkbook. Tous droits réservés.
            </p>
            <div className="flex gap-4">
              <a href="#terms" className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">Conditions d'utilisation</a>
              <a href="#privacy" className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
