import React, { useState, useEffect, useCallback } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI } from '../services/api';
import { cartAPI } from '../services/cart';

const typeLabel = (t) => t === 'vente' ? 'Vente' : t === 'échange' ? 'Échange' : 'Don';

export default function SearchResults({ query }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(query?.q || '');
  const [activeType, setActiveType] = useState(query?.type || '');
  const [activeWilaya, setActiveWilaya] = useState(query?.wilaya || '');
  const [cart, setCart] = useState(cartAPI.get());

  const doSearch = useCallback(async (type, wilaya, text) => {
    const params = {};
    if (text) params.q = text;
    if (type) params.type = type;
    if (wilaya) params.wilaya = wilaya;
    if (Object.keys(params).length === 0) { setBooks([]); return; }
    setLoading(true);
    try {
      const res = await bookAPI.search(params);
      setBooks(res.data || []);
    } catch { setBooks([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    doSearch(activeType, activeWilaya, searchText);
  }, []);

  const handleSearch = () => doSearch(activeType, activeWilaya, searchText);
  const inCart = (id) => cart.includes(id);
  const toggleCart = (id) => {
    const updated = inCart(id) ? cartAPI.remove(id) : cartAPI.add(id);
    setCart(updated);
  };
  const removeType = () => { setActiveType(''); doSearch('', activeWilaya, searchText); };
  const removeWilaya = () => { setActiveWilaya(''); doSearch(activeType, '', searchText); };

  return (
    <FeedLayout active="Fil d'actualité">
      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filtres actifs :</span>
        {!activeType && !activeWilaya && (
          <span className="text-xs text-gray-300 font-medium">Aucun — utilisez la barre de recherche en haut</span>
        )}
        {activeType && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2777df]/10 text-[#2777df] rounded-full text-xs font-bold">
            {typeLabel(activeType)}
            <button onClick={removeType} className="hover:text-[#fc4d16] transition-colors">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        )}
        {activeWilaya && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
            {activeWilaya}
            <button onClick={removeWilaya} className="hover:text-red-500 transition-colors">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        )}
      </div>

      {/* Text search */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={searchText} onChange={e => setSearchText(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] outline-none text-sm transition-all"
            placeholder="Rechercher par titre, matière, auteur..." />
        </div>
      </form>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium">
          {loading ? 'Recherche...' : `${books.length} résultat${books.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold">Aucun résultat trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(b => (
            <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {b.images?.[0] ? (
                  <img src={b.images[0]} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {b.type && (
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-white text-xs font-bold rounded-full ${b.type === 'vente' ? 'bg-blue-500' : b.type === 'échange' ? 'bg-orange-500' : 'bg-green-500'}`}>{typeLabel(b.type)}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-black text-gray-900 mb-1">{b.title}</h3>
                {b.subject && <p className="text-xs text-gray-400 mb-2">{b.subject}{b.level ? ` - ${b.level}` : ''}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#2777df]">{b.price || typeLabel(b.type)}</span>
                  {(b.location || b.user?.wilaya) && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {b.location || b.user.wilaya}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => window.location.hash = `#offer-detail?id=${b._id}`} className="flex-1 py-2 bg-[#2777df]/5 hover:bg-[#2777df] text-[#2777df] hover:text-white rounded-xl text-xs font-bold transition-all">
                    Consultez
                  </button>
                  <button onClick={() => toggleCart(b._id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${inCart(b._id) ? 'bg-[#2777df] text-white border-[#2777df]' : 'bg-white text-gray-400 border-gray-200 hover:border-[#2777df] hover:text-[#2777df]'}`}>
                    <svg className="h-4 w-4" fill={inCart(b._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FeedLayout>
  );
}
