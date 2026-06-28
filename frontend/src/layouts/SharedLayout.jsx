import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI, invitationAPI } from '../services/api';

// ─── Top Navbar ──────────────────────────────────────────────────
const NAV_MAP = [
  { label: 'Shop', hash: '#timeline' },
  { label: 'Communauté', hash: '#community' },
  { label: 'Pack Promo', hash: '#pricing' },
];

export function Navbar({ transparent = false, sidebarLayout = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [cartCount, setCartCount] = useState(parseInt(localStorage.getItem('linkbook_cart_count') || '0'));
  const [user, setUser] = useState(() => {
    try {
      const uStr = localStorage.getItem('linkbook_user');
      return uStr ? JSON.parse(uStr) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const updateUser = () => {
      try {
        const uStr = localStorage.getItem('linkbook_user');
        setUser(uStr ? JSON.parse(uStr) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('linkbook:userchange', updateUser);
    return () => window.removeEventListener('linkbook:userchange', updateUser);
  }, []);

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('linkbook_cart')) || [];
        setCartCount(cart.length);
        localStorage.setItem('linkbook_cart_count', String(cart.length));
      } catch { setCartCount(0); }
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('linkbook:cartchange', updateCart);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('linkbook:cartchange', updateCart);
    };
  }, []);

  const token = localStorage.getItem('linkbook_token');
  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await notificationAPI.get();
      setNotifications(res.data || []);
      setPendingCount(res.pendingCount || 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifs]);

  useEffect(() => {
    if (!notifOpen) return;
    const close = (e) => { if (!e.target.closest('.notif-wrapper')) setNotifOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [notifOpen]);

  const handleLogout = () => {
    localStorage.removeItem('linkbook_token');
    localStorage.removeItem('linkbook_user');
    window.location.hash = '#login';
  };

  const userInitials = user && user.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SB';

  return (
    <header className={`w-full z-50 ${transparent ? 'absolute top-0 left-0 right-0 bg-transparent' : 'bg-white shadow-sm'}`}>
      <div className={`${sidebarLayout ? 'w-full' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className={`${sidebarLayout ? 'w-48' : ''} flex items-center flex-shrink-0 cursor-pointer`} onClick={() => window.location.hash = '#'}>
            <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-16 w-auto object-contain" alt="Linkbook" />
          </div>

          {/* Center Search — Type + Wilaya */}
          {isAuthenticated && (
            <div className={`hidden md:flex items-center gap-1.5 rounded-xl px-3 py-1.5 flex-1 max-w-sm mx-4 ${transparent ? 'bg-white/10 border border-white/20' : 'bg-gray-50 border border-gray-200'}`}>
              <select id="search-type" defaultValue="" className={`bg-transparent text-xs font-bold outline-none cursor-pointer ${transparent ? 'text-white' : 'text-gray-600'}`}>
                <option value="">Type</option>
                <option value="vente">Vente</option>
                <option value="échange">Échange</option>
                <option value="don">Don</option>
              </select>
              <span className={`w-px h-5 ${transparent ? 'bg-white/20' : 'bg-gray-200'}`}></span>
              <select id="search-wilaya" defaultValue="" className={`bg-transparent text-xs font-bold outline-none cursor-pointer flex-1 ${transparent ? 'text-white' : 'text-gray-600'}`}>
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
              <button onClick={() => {
                const type = document.getElementById('search-type').value;
                const wilaya = document.getElementById('search-wilaya').value;
                window.location.hash = `#searchresults?type=${type}&wilaya=${wilaya}`;
              }} className={`p-1.5 rounded-lg transition-colors ${transparent ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 text-gray-500'}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          )}

          {/* Nav Links — visible on desktop */}
          {!sidebarLayout && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_MAP.map(item => (
                <a key={item.label} href={item.hash}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1 relative">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <a href="#cart" className={`relative p-2 rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#2777df] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>}
                </a>

                {/* Notification */}
                <div className="relative notif-wrapper">
                  <button onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(false); setNotifOpen(!notifOpen); }} className={`relative p-2 rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 left-auto mt-2 w-80 max-w-[90vw] rounded-2xl bg-white border border-gray-100 shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-xs font-black text-gray-900">Notifications</p>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-400 font-bold">Aucune notification</div>
                      ) : (
                        notifications.slice(0, 10).map((n, i) => (
                          <div key={i} className={`block px-4 py-3 border-b border-gray-50 transition-colors ${n.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${n.status === 'pending' ? 'bg-[#2777df]/10 text-[#2777df]' : n.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {n.status === 'pending' ? (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                ) : n.status === 'accepted' ? (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-900 truncate">{n.label}</p>
                                <p className="text-[11px] text-gray-500 truncate">{n.message}</p>
                                {n.status === 'pending' && n.type === 'invitation_seller' && (
                                  <div className="flex gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={async (e) => { e.stopPropagation(); try { await invitationAPI.accept(n._id); fetchNotifs(); } catch(_) {} }}
                                      className="flex-1 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-[10px] font-bold transition-colors"
                                    >✓ Accepter</button>
                                    <button onClick={async (e) => { e.stopPropagation(); try { await invitationAPI.refuse(n._id); fetchNotifs(); } catch(_) {} }}
                                      className="flex-1 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[10px] font-bold transition-colors"
                                    >✗ Refuser</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <a href="#my-invitations" onClick={() => setNotifOpen(false)} className="block px-4 py-2.5 text-center text-xs font-bold text-[#2777df] hover:bg-gray-50 transition-colors rounded-b-2xl">
                        Voir toutes les invitations
                      </a>
                    </div>
                  )}
                </div>

                {/* Avatar with dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => { setNotifOpen(false); setProfileDropdownOpen(!profileDropdownOpen); }}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] flex items-center justify-center text-white font-black text-xs cursor-pointer flex-shrink-0 focus:outline-none overflow-hidden"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Connecté en tant que</p>
                        <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'Utilisateur'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                      
                      <a 
                        href="#profile-settings" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Mon Profil
                      </a>
                      
                      <a 
                        href="#pricing" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        Devenir Pro
                      </a>

                      {isAdmin && (
                        <a href="#admin-dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-purple-600 hover:bg-purple-50 transition-colors border-t border-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Admin Panel
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-gray-50 text-left"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a 
                  href="#login" 
                  className={`px-4 py-2 text-xs font-bold transition-all rounded-xl ${transparent ? 'text-white hover:bg-white/10' : 'text-[#2777df] hover:bg-blue-50'}`}
                >
                  Connexion
                </a>
                <a 
                  href="#register" 
                  className="px-4 py-2 text-xs font-black bg-[#fc4d16] hover:bg-[#e03d0d] text-white rounded-xl shadow-md shadow-orange-500/10 active:scale-95 transition-all"
                >
                  S'inscrire
                </a>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className={`h-5 w-5 ${transparent ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1 shadow-lg">
          {isAuthenticated ? (
            <>
              {[...SIDEBAR_ITEMS, ...(isAdmin ? [{ label: 'Admin Panel', hash: '#admin-dashboard', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> }] : [])].map(item => (
                <a key={item.label} href={item.hash} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  <span className="text-gray-400 flex-shrink-0">{item.icon}</span>
                  {item.label}
                </a>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">Déconnexion</button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <a href="#login" className="block text-center px-4 py-2.5 text-sm font-bold text-[#2777df] bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-all">Connexion</a>
              <a href="#register" className="block text-center px-4 py-2.5 text-sm font-black bg-[#fc4d16] hover:bg-[#e03d0d] text-white rounded-xl transition-all">S'inscrire</a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// ─── Left Sidebar ────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { label: 'Tableau de bord', hash: '#dashboard', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { label: "Fil d'actualité", hash: '#timeline', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { label: 'Carte', hash: '#map', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { label: 'Mes offres', hash: '#my-offers', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Mes contacts', hash: '#messages', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: 'Devenir Pro', hash: '#pricing', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
];

export function Sidebar({ active = "Fil d'actualité" }) {
  let isAdmin = false;
  try {
    const uStr = localStorage.getItem('linkbook_user');
    if (uStr) isAdmin = JSON.parse(uStr).role === 'admin';
  } catch (e) {}

  const items = isAdmin ? [...SIDEBAR_ITEMS, { label: 'Admin Panel', hash: '#admin-dashboard', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> }] : SIDEBAR_ITEMS;

  return (
    <aside className="hidden lg:flex flex-col w-48 flex-shrink-0 py-4 pr-6 ml-[10px]">
      <div className="space-y-1">
        {items.map(item => {
          const isActive = active === item.label;
          return (
            <a key={item.label}
              href={item.hash}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ease-in-out w-full text-left hover:scale-[1.02] active:scale-[0.98] ${isActive ? 'bg-[#2777df] text-white shadow-lg shadow-[#2777df]/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Right Sidebar ───────────────────────────────────────────────
export function RightSidebar() {
  const [booksCount, setBooksCount] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [user, setUser] = useState(() => {
    try {
      const uStr = localStorage.getItem('linkbook_user');
      return uStr ? JSON.parse(uStr) : null;
    } catch { return null; }
  });

  const handleRecharge = async (e) => {
    e.preventDefault();
    alert('Veuillez envoyer ' + rechargeAmount + ' DT vers le numéro D17: 21 640 651, puis téléchargez la preuve.');
    setShowRecharge(false);
  };

  useEffect(() => {
    const updateUser = () => {
      try {
        const uStr = localStorage.getItem('linkbook_user');
        setUser(uStr ? JSON.parse(uStr) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('linkbook:userchange', updateUser);
    return () => window.removeEventListener('linkbook:userchange', updateUser);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/books?limit=1')
      .then(r => r.json())
      .then(d => { if (d.count !== undefined) setBooksCount(d.count); })
      .catch(() => {});
  }, []);

  const isSubscribed = user?.subscriptionActive;
  const balance = user?.balance || 0;

  return (
    <aside className="hidden xl:flex flex-col w-64 flex-shrink-0 space-y-4 py-4 pl-6">
     




      {showRecharge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2 text-center">Recharger mon solde</h3>
            <p className="text-xs text-gray-400 font-bold mb-8 text-center leading-relaxed px-4">
              Envoyez le montant souhaité via <span className="text-[#fc4d16]">D17 au 21 640 651</span> puis confirmez ici.
            </p>
            <form onSubmit={handleRecharge} className="space-y-4">
              <input 
                type="number" 
                placeholder="Montant à recharger (DT)" 
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-[#2777df] transition-all"
                required
              />
              <button className="w-full py-4 bg-[#2777df] text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                J'ai envoyé le montant
              </button>
              <button 
                type="button"
                onClick={() => setShowRecharge(false)}
                className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── Feed Layout (Navbar + Sidebar + Content + RightSidebar) ────
export function FeedLayout({ children, active, title }) {
  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar sidebarLayout />
      <div className="flex pt-6 pb-12">
        <Sidebar active={active} />
        <main className="flex-1 min-w-0">
          {title && (
            <div className="mb-6">
              <h1 className="text-xl font-black text-gray-900">{title}</h1>
            </div>
          )}
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

// ─── Category Filter Pills ──────────────────────────────────────
export function CategoryFilter({ active, setActive }) {
  const cats = ['Tout'];
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
      {cats.map(c => (
        <button key={c} onClick={() => setActive(c)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all
            ${active === c ? 'bg-[#2777df] text-white shadow-lg shadow-[#2777df]/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2777df] hover:text-[#2777df]'}`}>
          {c}
        </button>
      ))}
    </div>
  );
}

// ─── Offer Card ──────────────────────────────────────────────────
export function OfferCard({ img, title, desc, price, location, tag, onAction, actionLabel = 'Consultez' }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={onAction}>
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { if (!e.target.dataset.failed) { e.target.dataset.failed = '1'; e.target.src = '/images/3768ec8e8ce95737a750cad65a6be4ef.jpg'; } }} />
        {tag && <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#2777df] text-white text-xs font-bold rounded-full pointer-events-none">{tag}</span>}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-black text-gray-900 mb-1">{title}</h3>
        {desc && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{desc}</p>}
        <div className="flex items-center justify-between mt-3">
          {price && <span className="text-sm font-black text-[#2777df]">{price}</span>}
          {location && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              {location}
            </span>
          )}
        </div>
        <button onClick={onAction} className="mt-3 w-full py-2 bg-[#2777df]/5 hover:bg-[#2777df] text-[#2777df] hover:text-white rounded-xl text-xs font-bold transition-all">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
