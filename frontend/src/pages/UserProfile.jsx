import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, getUser, chatAPI } from '../services/api';

export default function UserProfile({ query }) {
  const [userData, setUserData] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaging, setMessaging] = useState(false);

  const currentUser = getUser();
  const profileId = query?.id;

  const handleStartChat = async () => {
    if (!profileId) return;
    setMessaging(true);
    try {
      const res = await chatAPI.startConversation(profileId);
      if (res.success) {
        window.location.hash = '#messages';
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    if (!profileId) {
      setError('Aucun utilisateur spécifié');
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        const [booksRes] = await Promise.all([
          bookAPI.getAll({ user: profileId }),
        ]);
        setBooks(booksRes.data || []);
        if (booksRes.data?.[0]?.user) {
          setUserData(booksRes.data[0].user);
        }
      } catch (_) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profileId]);

  const typeLabel = (type) => {
    switch (type) {
      case 'vente': return 'Vente';
      case 'échange': return 'Échange';
      case 'don': return 'Don';
      default: return type;
    }
  };

  const profileTypeLabel = (type) => {
    switch (type) {
      case 'eleve': return 'Élève';
      case 'etudiant': return 'Étudiant';
      case 'enseignant': return 'Enseignant';
      case 'parent': return 'Parent';
      case 'autre': return 'Autre';
      default: return '';
    }
  };

  if (loading) {
    return (
      <FeedLayout active="Profil" title="Profil">
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      </FeedLayout>
    );
  }

  if (error) {
    return (
      <FeedLayout active="Profil" title="Profil">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>
      </FeedLayout>
    );
  }

  const initials = userData?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  const isOwn = currentUser && (currentUser.id === profileId || currentUser._id === profileId);

  return (
    <FeedLayout active="Profil" title="Profil">
      <div className="max-w-3xl">
        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] flex items-center justify-center text-white font-black text-lg flex-shrink-0 overflow-hidden">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{userData?.name || 'Utilisateur'}</h2>
              <p className="text-sm text-gray-400">{[
                profileTypeLabel(userData?.profileType),
                userData?.wilaya || 'Wilaya non spécifiée'
              ].filter(Boolean).join(' • ')}</p>
              {userData?.address?.street && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[userData.address.street, userData.address.city, userData.address.postalCode].filter(Boolean).join(', ')}
                </p>
              )}
              {isOwn && <span className="text-[10px] font-bold text-blue-500">C'est vous</span>}
            </div>
          </div>
          {!isOwn && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={handleStartChat}
                disabled={messaging}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2777df]/5 hover:bg-[#2777df] text-[#2777df] hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {messaging ? 'Chargement...' : 'Message'}
              </button>
              {userData?.email && (
                <a href={`mailto:${userData.email}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-xl text-xs font-bold transition-all">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email
                </a>
              )}
              {userData?.phone && (
                <a href={`tel:${userData.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-xl text-xs font-bold transition-all">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Appel
                </a>
              )}
            </div>
          )}
        </div>

        {/* User's books */}
        <h3 className="text-lg font-black text-gray-900 mb-4">Ses livres ({books.length})</h3>
        {books.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">Aucun livre publié</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {books.map(b => (
              <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative aspect-square bg-gray-100">
                  {b.images?.[0] ? (
                    <img src={b.images[0]} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2 py-1 bg-[#2777df] text-white text-xs font-bold rounded-full">{typeLabel(b.type)}</span>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-black text-gray-900">{b.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-[#2777df]">{b.price || typeLabel(b.type)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Disponible' ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'
                    }`}>{b.status}</span>
                  </div>
                  <button onClick={() => window.location.hash = `#offer-detail?id=${b._id}`} className="mt-3 w-full py-2 bg-[#2777df]/5 hover:bg-[#2777df] text-[#2777df] hover:text-white rounded-xl text-xs font-bold transition-all">
                    Consultez
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
