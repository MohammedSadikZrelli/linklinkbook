import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, invitationAPI, getUser, chatAPI, paymentAPI, saveUser } from '../services/api';
import { cartAPI } from '../services/cart';

export default function OfferDetail({ query }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (book) setInCart(cartAPI.has(book._id));
  }, [book]);

  const currentUser = getUser();
  const isSubscribed = currentUser?.subscriptionActive;
  const isOwner = currentUser && book && (book.user?._id === currentUser.id || book.user?._id === currentUser._id);

  const handleStartChat = async () => {
    if (!book?.user?._id) return;
    setMessaging(true);
    try {
      const res = await chatAPI.startConversation(book.user._id);
      if (res.success) {
        window.location.hash = '#messages';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setMessaging(false);
    }
  };

  const handlePurchase = () => {
    window.location.hash = `#checkout?id=${book._id}`;
  };

  useEffect(() => {
    if (!query?.id) {
      setError('Aucun livre spécifié');
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await bookAPI.getById(query.id);
        setBook(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [query?.id]);

  const typeLabel = (type) => {
    switch (type) {
      case 'vente': return 'Vente';
      case 'échange': return 'Échange';
      case 'don': return 'Don';
      default: return type;
    }
  };

  const typeColor = (type) => {
    switch (type) {
      case 'vente': return 'bg-blue-50 text-blue-600';
      case 'échange': return 'bg-orange-50 text-orange-500';
      case 'don': return 'bg-green-50 text-green-500';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Disponible': return 'bg-green-50 text-green-600';
      case 'En attente': return 'bg-yellow-50 text-yellow-600';
      case 'Vendu': case 'Donné': return 'bg-gray-100 text-gray-400';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  if (loading) {
    return (
      <FeedLayout active="Détail" title="Détail de l'offre">
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      </FeedLayout>
    );
  }

  if (error) {
    return (
      <FeedLayout active="Détail" title="Détail de l'offre">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
          Retour
        </button>
      </FeedLayout>
    );
  }

  if (!book) {
    return (
      <FeedLayout active="Détail" title="Détail de l'offre">
        <div className="text-center py-16 text-gray-400 font-bold">Livre introuvable</div>
        <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
          Retour
        </button>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout active="Détail" title="Détail de l'offre">
      <div className="max-w-4xl">
        {/* Back button */}
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 mb-4 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left — Images */}
          <div className="md:col-span-3 space-y-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {book.images?.length > 0 ? (
                  <img src={book.images[0]} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${typeColor(book.type)}`}>{typeLabel(book.type)}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(book.status)}`}>{book.status}</span>
                </div>
              </div>
              {book.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {book.images.map((img, i) => (
                    <div key={i} className={`h-16 w-16 rounded-xl overflow-hidden border-2 flex-shrink-0 ${i === 0 ? 'border-[#2777df]' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Book details */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h1 className="text-xl font-black text-gray-900 mb-2">{book.title}</h1>
              {book.subject && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-4">{book.subject}</span>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {book.level && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Niveau</span>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{book.level}</p>
                  </div>
                )}
                {book.condition && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">État</span>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{book.condition}</p>
                  </div>
                )}
                {book.price && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prix</span>
                    <p className="text-sm font-black text-[#2777df] mt-0.5">{book.price}</p>
                  </div>
                )}
              </div>
              {book.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">{book.description}</p>
                </div>
              )}
              {(book.author || book.isbn) && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  {book.author && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Auteur</span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{book.author}</p>
                    </div>
                  )}
                  {book.isbn && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ISBN</span>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{book.isbn}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — Seller info + actions */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendeur</span>
              <div className="flex items-center gap-3 mt-2 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {book.user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{book.user?.name || 'Anonyme'}</p>
                  <p className="text-xs text-gray-400">{book.user?.wilaya || 'Non spécifié'}</p>
                </div>
              </div>

              {!isOwner && (
                <>
                  {/* Cart + Invitation buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        inCart ? cartAPI.remove(book._id) : cartAPI.add(book._id);
                        setInCart(!inCart);
                      }}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] border ${inCart ? 'bg-[#2777df] text-white border-[#2777df] shadow-lg shadow-[#2777df]/20' : 'bg-white text-gray-500 border-gray-200 hover:border-[#2777df] hover:text-[#2777df]'}`}
                    >
                      {inCart ? 'Dans le panier' : 'Ajouter au panier'}
                    </button>
                    {book.status === 'Disponible' ? (
                      <div className="flex-[2] flex flex-col gap-2">
                        {book.type === 'vente' && isSubscribed && (
                          <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="w-full py-3 bg-[#2777df] hover:bg-[#185db4] text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                          >
                            {purchasing ? 'Traitement...' : `Acheter (${Number(book.price) + 1} DT)`}
                          </button>
                        )}
                        {book.type === 'vente' && !isSubscribed && (
                          <a href="#pricing" className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl text-xs font-bold text-center transition-all block">
                            🔒 Abonnez-vous pour acheter
                          </a>
                        )}
                        <div className="flex gap-2">
                          {isSubscribed && (
                            <button
                              onClick={handleStartChat}
                              disabled={messaging}
                              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 hover:border-[#2777df] hover:text-[#2777df] rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
                            >
                              {messaging ? '...' : 'Message'}
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              setInviting(true);
                              setInviteMsg('');
                              try {
                                await invitationAPI.send(book._id);
                                setInviteMsg('success');
                              } catch (err) {
                                setInviteMsg(err.message);
                              } finally {
                                setInviting(false);
                              }
                            }}
                            disabled={inviting}
                            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${!isSubscribed ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-[#fc4d16]/10 hover:bg-[#fc4d16] text-[#fc4d16] hover:text-white'}`}
                            title={!isSubscribed ? (book.type === 'échange' ? 'Frais: 2 DT' : book.type === 'don' ? 'Frais: 1 DT' : '') : ''}
                          >
                            {inviting ? '...' : (!isSubscribed ? (book.type === 'échange' ? 'Échanger (2 DT)' : book.type === 'don' ? 'Recevoir (1 DT)' : 'Inviter') : 'Inviter')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-[2] py-3 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold text-center">
                        {book.status === 'Vendu' ? 'Vendu' : book.status === 'Donné' ? 'Donné' : 'Non disponible'}
                      </div>
                    )}
                  </div>
                  {inviteMsg === 'success' && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl text-xs font-bold text-center">
                      Invitation envoyée avec succès !
                    </div>
                  )}
                  {inviteMsg && inviteMsg !== 'success' && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">
                      {inviteMsg}
                    </div>
                  )}


                </>
              )}

              {isOwner && (
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.hash = `#my-offers`}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    Gérer mon offre
                  </button>
                </div>
              )}
            </div>

            {/* Similar books placeholder */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Partager</span>
              <div className="flex gap-2 mt-3">
                {['Facebook', 'WhatsApp', 'Messenger'].map(platform => (
                  <button key={platform} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl text-[10px] font-bold transition-colors">
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FeedLayout>
  );
}