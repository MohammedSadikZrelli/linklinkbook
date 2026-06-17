import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI } from '../services/api';
import { cartAPI } from '../services/cart';

export default function CommunityFeed() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await bookAPI.getAll({ limit: 12 });
        setBooks(res.data || []);
      } catch (_) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const typeLabel = (type) => {
    switch (type) {
      case 'vente': return 'Vente';
      case 'échange': return 'Échange';
      case 'don': return 'Don';
      default: return type;
    }
  };

  return (
    <FeedLayout active="Communauté" title="Communauté :">
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold">Aucune annonce pour le moment</div>
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
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#2777df] text-white text-xs font-bold rounded-full">{typeLabel(b.type)}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-black text-gray-900 mb-1">{b.title}</h3>
                {b.subject && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{b.subject}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#2777df]">{b.price || typeLabel(b.type)}</span>
                  {(b.location || b.user?.wilaya) && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {b.location || b.user.wilaya}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => window.location.hash = `#offer-detail?id=${b._id}`} className="flex-[2] py-2 bg-[#2777df]/5 hover:bg-[#2777df] text-[#2777df] hover:text-white rounded-xl text-xs font-bold transition-all">
                    Consultez
                  </button>
                  <button onClick={() => cartAPI.add(b._id)} className="flex-1 py-2 border border-gray-200 hover:border-[#2777df] text-gray-400 hover:text-[#2777df] rounded-xl text-xs font-bold transition-all">
                    Panier
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