import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, paymentAPI, authAPI, getUser, saveUser } from '../services/api';

export default function Checkout({ query }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(getUser());

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await authAPI.me();
        if (res.success) {
          saveUser(res.data);
          setCurrentUser(res.data);
        }
      } catch (_) {}
    };
    fetchLatestUser();
  }, []);

  useEffect(() => {
    if (!query?.id) return;
    const fetchBook = async () => {
      try {
        const res = await bookAPI.getById(query.id);
        if (res.success) setBook(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [query?.id]);

  const handleFinalPurchase = async () => {
    setPurchasing(true);
    try {
      const res = await paymentAPI.purchaseBook(book._id);
      if (res.success) {
        saveUser({ ...currentUser, balance: res.newBalance });
        setStep(3); // Success step
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Chargement du checkout...</div>;
  if (!book) return <div className="p-20 text-center font-bold text-red-500">Livre introuvable</div>;

  const price = Number(book.price) || 0;
  const fee = 1;
  const total = price + fee;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mini Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-6 w-auto" alt="Logo" />
          <span className="font-black text-lg text-[#2777df]">Checkout</span>
        </div>
        <div className="flex gap-4">
          {[1, 2].map(s => (
            <div key={s} className={`h-2 w-8 rounded-full ${step >= s ? 'bg-[#2777df]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Récapitulatif de la commande</h2>
                <div className="flex gap-6">
                  <img src={book.images?.[0] || '/images/9daa051ce6458b314a567b7df7c447a2.jpg'} className="h-32 w-24 object-cover rounded-xl shadow-md" alt="" />
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{book.title}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{book.subject} • {book.level}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-50 text-[#2777df] flex items-center justify-center text-[10px] font-black">
                        {book.user?.name?.[0]}
                      </div>
                      <p className="text-xs font-black text-gray-600">Vendu par {book.user?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Solde disponible</p>
                    <p className={`text-lg font-black ${currentUser?.balance >= total ? 'text-green-600' : 'text-red-500'}`}>
                      {currentUser?.balance || 0} DT
                    </p>
                  </div>
                  {currentUser?.balance < total && (
                    <a href="#dashboard" className="px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all">
                      Recharger
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6">
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Article:</span>
                    <span>{price} DT</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Frais service:</span>
                    <span>1 DT</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-50">
                    <span>Total:</span>
                    <span className="text-[#2777df]">{total} DT</span>
                  </div>
                </div>
                <button 
                  disabled={currentUser?.balance < total || purchasing}
                  onClick={handleFinalPurchase}
                  className="w-full py-4 bg-[#2777df] disabled:bg-gray-200 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {purchasing ? 'Paiement...' : 'Confirmer et Payer'}
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                  En continuant, vous acceptez les conditions de vente de LinkBook.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto bg-white p-12 rounded-[50px] border border-gray-100 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="h-24 w-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Félicitations !</h2>
            <p className="text-sm font-bold text-gray-400 leading-relaxed mb-10">
              Votre achat de <span className="text-gray-900">"{book.title}"</span> a été validé avec succès. Vous pouvez maintenant contacter le vendeur.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.hash = '#dashboard'}
                className="w-full py-4 bg-[#2777df] text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Aller au Dashboard
              </button>
              <button 
                onClick={() => window.location.hash = '#messages'}
                className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all"
              >
                Voir mes messages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
