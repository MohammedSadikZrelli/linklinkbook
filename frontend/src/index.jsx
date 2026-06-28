import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';


// Asset pages (Figma designs)
import MyOffers from './asset-pages/MyOffers';
import CreateOffer from './asset-pages/CreateOffer';
import OfferDetail from './pages/OfferDetail';
import FeedTimeline from './pages/FeedTimeline';
import SearchResults from './asset-pages/SearchResults';
import CommunityFeed from './asset-pages/CommunityFeed';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import ProfileSettings from './pages/ProfileSettings';
import Pricing from './asset-pages/Pricing';
import Messages from './pages/Messages';
import MyInvitations from './pages/MyInvitations';
import UserProfile from './pages/UserProfile';
import MapPage from './pages/MapPage';
import CartPage from './pages/CartPage';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import EditOffer from './pages/EditOffer';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminBooks from './pages/AdminBooks';

// Components
import RestrictedOverlay from './components/RestrictedOverlay';
import Chatbot from './components/Chatbot';

// Screens map matching simple keys for normalized hash navigation
const routes = {
  '': HomePage,
  'login': Login,
  'register': Register,
  'timeline': FeedTimeline,
  'searchresults': SearchResults,
  'community': CommunityFeed,
  'restricted': RestrictedOverlay,
  'my-offers': MyOffers,
  'create-offer': CreateOffer,
  'offer-detail': OfferDetail,
  'profile-settings': ProfileSettings,
  'forgot-password': ForgotPassword,
  'verify-email': EmailVerification,
  'reset-password': ResetPassword,
  'google-callback': GoogleCallback,
  'pricing': Pricing,
  'messages': Messages,
  'my-invitations': MyInvitations,
  'user-profile': UserProfile,
  'map': MapPage,
  'dashboard': Dashboard,
  'edit-offer': EditOffer,
  'cart': CartPage,
  'checkout': Checkout,
  'admin-dashboard': AdminDashboard,
  'admin-users': AdminUsers,
  'admin-user-detail': AdminUserDetail,
  'admin-books': AdminBooks,
};

// Public routes that do not require authentication
const PUBLIC_ROUTES = new Set(['', 'login', 'register', 'forgot-password', 'verify-email', 'reset-password', 'google-callback']);
const PUBLIC_ONLY = new Set(['', 'login', 'register', 'forgot-password', 'verify-email', 'reset-password', 'google-callback']);

function App() {
  const [route, setRoute] = useState(() => {
    // Normalize hash value e.g. '#/login' -> 'login', '#register' -> 'register', '#' -> ''
    const raw = window.location.hash.replace(/^#\/?/, '');
    return raw.split('?')[0];
  });
  const [query, setQuery] = useState(() => {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const idx = raw.indexOf('?');
    return idx !== -1 ? Object.fromEntries(new URLSearchParams(raw.slice(idx))) : {};
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace(/^#\/?/, '');
      const parts = raw.split('?');
      setRoute(parts[0]);
      setQuery(parts[1] ? Object.fromEntries(new URLSearchParams(parts[1])) : {});
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple auth gate logic
  const token = localStorage.getItem('linkbook_token');
  const isAuthenticated = !!token;

  const ALL_PUBLIC = new Set([...PUBLIC_ROUTES, 'pricing']);

  useEffect(() => {
    // Redirect unauthenticated users trying to access protected pages to login
    if (!isAuthenticated && !ALL_PUBLIC.has(route)) {
      window.location.hash = '#login';
    } 
    // Redirect authenticated users away from auth-only pages (login/register/etc) to the feed
    else if (isAuthenticated && PUBLIC_ONLY.has(route)) {
      window.location.hash = '#timeline';
    }
  }, [route, isAuthenticated]);

  // Fallback to HomePage if route is invalid or undefined
  const PageComponent = routes[route] || HomePage;

  return (
    <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <PageComponent query={query} />
      <Chatbot />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
