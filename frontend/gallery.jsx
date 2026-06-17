import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles/index.css';

// Pages
import HomePage from './src/pages/HomePage';
import Login from './src/pages/Login';
import Register from './src/pages/Register';

// Asset pages
import CommunityFeed from './src/asset-pages/CommunityFeed';
import CreateOffer from './src/asset-pages/CreateOffer';
import EmailVerification from './src/pages/EmailVerification';
import FeedTimeline from './src/pages/FeedTimeline';
import ForgotPassword from './src/pages/ForgotPassword';
import Messages from './src/pages/Messages';
import MyOffers from './src/asset-pages/MyOffers';
import OfferDetail from './src/pages/OfferDetail';
import Pricing from './src/asset-pages/Pricing';
import ProfileSettings from './src/pages/ProfileSettings';
import SearchResults from './src/asset-pages/SearchResults';
import UserProfile from './src/pages/UserProfile';
import CartPage from './src/pages/CartPage';

import RestrictedOverlay from './src/components/RestrictedOverlay';

const PAGES = [
  { name: 'Accueil', component: HomePage, route: '#', desc: 'Landing page hero + search + how it works' },
  { name: 'Connexion', component: Login, route: '#login', desc: 'Login form with social auth options' },
  { name: 'Inscription', component: Register, route: '#register', desc: 'Registration form' },
  { name: 'Mes Offres', component: MyOffers, route: '#my-offers', desc: 'My book listings grid/list (wired to API)' },
  { name: 'Créer Offre', component: CreateOffer, route: '#create-offer', desc: 'Create book listing form (wired to API)' },
  { name: "Détail d'Offre", component: OfferDetail, route: '#offer-detail', desc: 'Book detail + proposals/invitations' },
  { name: 'Fil Actu', component: FeedTimeline, route: '#timeline', desc: 'Social feed style timeline' },
  { name: 'Communauté', component: CommunityFeed, route: '#community', desc: 'Community offers grid' },
  { name: 'Recherche', component: SearchResults, route: '#searchresults', desc: 'Search results with filters' },
  { name: 'Profil Utilisateur', component: UserProfile, route: '#user-profile', desc: 'Seller public profile page' },
  { name: 'Messages', component: Messages, route: '#messages', desc: 'Chat / messaging UI' },
  { name: 'Paramètres Profil', component: ProfileSettings, route: '#profile-settings', desc: 'Profile photo & personal info' },
  { name: 'Abonnement', component: Pricing, route: '#pricing', desc: 'Subscription/pricing plans' },
  { name: 'Email Vérification', component: EmailVerification, route: '#verify-email', desc: 'OTP email verification screen' },
  { name: 'Mot de passe oublié', component: ForgotPassword, route: '#forgot-password', desc: 'Password reset flow' },
  { name: 'Accès Restreint', component: RestrictedOverlay, route: '#restricted', desc: 'Restricted access gate overlay' },
];

const CATEGORIES = [
  { name: 'Auth', pages: ['Connexion', 'Inscription', 'Email Vérification', 'Mot de passe oublié'] },
  { name: 'Core', pages: ['Accueil', 'Mes Offres', 'Créer Offre'] },
  { name: 'Marketplace', pages: ["Détail d'Offre", 'Fil Actu', 'Communauté', 'Recherche', 'Profil Utilisateur'] },
  { name: 'Social', pages: ['Messages'] },
  { name: 'Settings', pages: ['Paramètres Profil', 'Abonnement'] },
  { name: 'Gates', pages: ['Accès Restreint'] },
];

function Gallery() {
  const [active, setActive] = useState(PAGES[0].name);
  const [search, setSearch] = useState('');

  const filtered = PAGES.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase())
  );

  const PageComponent = PAGES.find(p => p.name === active)?.component || PAGES[0].component;

  return (
    <div className="min-h-screen bg-gray-900 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-white font-black text-lg">LinkBook</h1>
          <p className="text-gray-400 text-xs mt-0.5">Design Gallery</p>
        </div>

        <div className="p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
          />
        </div>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const visible = cat.pages.some(p => filtered.some(f => f.name === p));
          if (!visible) return null;
          return (
            <div key={cat.name} className="px-3 mb-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">{cat.name}</div>
              {cat.pages.map(name => {
                const page = PAGES.find(p => p.name === name);
                if (!page || !filtered.includes(page)) return null;
                return (
                  <button
                    key={name}
                    onClick={() => setActive(name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all mb-0.5
                      ${active === name
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          );
        })}

        <div className="mt-auto p-4 border-t border-gray-700">
          <p className="text-[10px] text-gray-500">
            {filtered.length} pages • Cliquez pour prévisualiser
          </p>
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-black text-sm">{active}</h2>
            <p className="text-gray-400 text-xs">{PAGES.find(p => p.name === active)?.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Prévisualisation</span>
            <a
              href={PAGES.find(p => p.name === active)?.route || '#'}
              target="_blank"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
            >
              Ouvrir dans l'app →
            </a>
          </div>
        </div>

        <div className="bg-gray-900">
          <div className="mx-auto" style={{ maxWidth: '1280px' }}>
            <PageComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('gallery-root')).render(<Gallery />);
