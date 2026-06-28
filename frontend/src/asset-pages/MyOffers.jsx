import React, { useState, useEffect } from 'react';
import { FeedLayout, CategoryFilter } from '../layouts/SharedLayout';
import { bookAPI, getUser, assetURL } from '../services/api';

export default function MyOffers() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Tout');
  const [view, setView] = useState('grid');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const user = getUser();
      const uid = user?.id || user?._id;
      if (!uid) { setBooks([]); setLoading(false); return; }
      const res = await bookAPI.getAll({ user: uid });
      setBooks(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
    try {
      await bookAPI.delete(id);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'Disponible': return 'bg-green-50 text-green-600';
      case 'En attente': return 'bg-yellow-50 text-yellow-600';
      case 'Vendu': case 'Donné': return 'bg-gray-100 text-gray-400';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const typeClass = (type) => {
    switch (type) {
      case 'vente': return 'bg-blue-50 text-blue-600';
      case 'échange': return 'bg-orange-50 text-orange-500';
      case 'don': return 'bg-green-50 text-green-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const typeLabel = (type) => {
    switch (type) {
      case 'vente': return 'Vente';
      case 'échange': return 'Échange';
      case 'don': return 'Don';
      default: return type;
    }
  };

  const statusDot = (status) => {
    switch (status) {
      case 'Disponible': return 'bg-green-400';
      case 'En attente': return 'bg-yellow-400';
      default: return 'bg-gray-300';
    }
  };

  const filtered = filter === 'Tout'
    ? books
    : books.filter(b => b.type === filter.toLowerCase());

  return (
    <FeedLayout active="Mes offres" title="Mes offres :">
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <CategoryFilter active={filter} setActive={setFilter} />
        <div className="flex gap-2">
          <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-brand-blue text-white shadow-glow-blue' : 'bg-white text-gray-400 border border-gray-200'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-brand-blue text-white shadow-glow-blue' : 'bg-white text-gray-400 border border-gray-200'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button onClick={() => window.location.hash = '#create-offer'} className="px-4 py-2 bg-brand-blue text-white shadow-glow-blue text-xs font-bold rounded-xl hover:bg-[#185db4] transition-colors flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nouvelle offre
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold">Aucune offre trouvée</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <div onClick={() => window.location.hash = `#offer-detail?id=${b._id}`} className="block w-full h-full cursor-pointer">
                  <img
                    src={b.images?.[0] || assetURL('9daa051ce6458b314a567b7df7c447a2.jpg')}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = assetURL('9daa051ce6458b314a567b7df7c447a2.jpg'); }}
                  />
                </div>
                <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider pointer-events-none ${statusClass(b.status)}`}>{b.status}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-black text-gray-900">{b.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-black text-[#2777df]">{b.price || typeLabel(b.type)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${typeClass(b.type)}`}>{typeLabel(b.type)}</span>
                </div>
                {(b.user?.wilaya || b.location) && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span className="text-xs text-gray-400">{b.location || b.user?.wilaya}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => window.location.hash = `#edit-offer?id=${b._id}`} className="flex-1 py-2 bg-[#2777df]/5 text-[#2777df] text-xs font-bold rounded-xl hover:bg-[#2777df] hover:text-white transition-all">Modifier</button>
                  <button onClick={() => handleDelete(b._id)} className="px-3 py-2 border border-red-100 text-red-400 text-xs font-bold rounded-xl hover:bg-red-50 transition-all">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Offre</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Wilaya</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Prix</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Statut</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={b.images?.[0] || assetURL('9daa051ce6458b314a567b7df7c447a2.jpg')} alt="" className="h-full w-full object-contain" onError={(e) => { e.target.src = assetURL('9daa051ce6458b314a567b7df7c447a2.jpg'); }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{b.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${typeClass(b.type)}`}>{typeLabel(b.type)}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{(b.location || b.user?.wilaya || '-')}</td>
                  <td className="py-3 px-4 text-sm font-black text-gray-900">{b.price || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${b.status === 'Disponible' ? 'text-green-500' : b.status === 'En attente' ? 'text-yellow-500' : 'text-gray-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(b.status)}`}></span>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => window.location.hash = `#edit-offer?id=${b._id}`} className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-brand-blue text-white shadow-glow-blue text-xs font-bold rounded-xl transition-all">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
            </div>
        </div>
      )}
    </FeedLayout>
  );
}
