import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, invitationAPI, getUser } from '../services/api';
import { cartAPI } from '../services/cart';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const currentUser = getUser();

  useEffect(() => {
    const ids = cartAPI.get();
    setItems(ids);
    if (ids.length === 0) { setLoading(false); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        const promises = ids.map(id => bookAPI.getById(id).catch(() => null));
        const results = await Promise.all(promises);
        setBooks(results.filter(Boolean).map(r => r.data));
      } catch (_) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const removeItem = (id) => {
    const updated = cartAPI.remove(id);
    setItems(updated);
    setBooks(b => b.filter(book => book._id !== id));
  };

  const clearCart = () => {
    cartAPI.clear();
    setItems([]);
    setBooks([]);
  };

  const sendAll = async () => {
    setSending(true);
    setMsg('');
    let success = 0;
    let errors = [];
    for (const book of books) {
      try {
        await invitationAPI.send(book._id);
        success++;
      } catch (err) {
        errors.push(`${book.title}: ${err.message}`);
      }
    }
    if (success > 0) {
      cartAPI.clear();
      setItems([]);
      setBooks([]);
    }
    setMsg(errors.length > 0
      ? `${success} demande(s) envoyée(s). Erreurs: ${errors.join('; ')}`
      : `${success} demande(s) envoyée(s) avec succès !`);
    setSending(false);
  };

  const typeLabel = (t) => t === 'vente' ? 'Vente' : t === 'échange' ? 'Échange' : 'Don';

  return (
    <FeedLayout active="Panier" title="Mon Panier">
      {msg && (
        <div className={`p-4 mb-4 rounded-2xl text-xs font-bold ${msg.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="h-16 w-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          <p className="text-gray-400 font-bold">Votre panier est vide</p>
          <a href="#timeline" className="inline-block mt-4 px-6 py-3 bg-[#2777df] text-white rounded-2xl text-xs font-bold hover:bg-[#185db4] transition-all">Découvrir des livres</a>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">{items.length} livre(s) dans le panier</p>
            <button onClick={clearCart} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">Vider le panier</button>
          </div>
          <div className="space-y-3">
            {books.map(b => (
              <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {b.images?.[0] ? <img src={b.images[0]} alt="" className="h-full w-full object-cover" /> : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-gray-900 truncate">{b.title}</h3>
                  <p className="text-xs text-gray-400">{b.subject} {b.level ? `- ${b.level}` : ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-[#2777df]">{b.price || typeLabel(b.type)}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{b.user?.wilaya || ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {b.type === 'vente' && b.price && (
                    <a href={`#checkout?id=${b._id}`}
                      className="p-2 text-[#2777df] hover:text-[#185db4] transition-colors"
                      title="Acheter ce livre"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    </a>
                  )}
                  <button onClick={() => removeItem(b._id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={sendAll}
            disabled={sending}
            className="mt-6 w-full py-3 bg-[#fc4d16] hover:bg-[#e03d0d] disabled:bg-orange-300 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            {sending ? 'Envoi des demandes...' : `Contacter les vendeurs (${items.length})`}
          </button>
        </>
      )}
    </FeedLayout>
  );
}