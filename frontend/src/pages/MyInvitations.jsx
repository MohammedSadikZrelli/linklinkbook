import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { invitationAPI } from '../services/api';

export default function MyInvitations() {
  const [data, setData] = useState({ asBuyer: [], asSeller: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await invitationAPI.getMine();
      setData(res.data);
    } catch (_) {
      setData({ asBuyer: [], asSeller: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleAccept = async (id) => {
    try {
      await invitationAPI.accept(id);
      fetch();
    } catch (err) { alert(err.message); }
  };

  const handleRefuse = async (id) => {
    try {
      await invitationAPI.refuse(id);
      fetch();
    } catch (err) { alert(err.message); }
  };

  const statusBadge = (s) => {
    switch (s) {
      case 'pending': return 'bg-yellow-50 text-yellow-600';
      case 'accepted': return 'bg-green-50 text-green-600';
      case 'refused': return 'bg-red-50 text-red-500';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const statusLabel = (s) => {
    switch (s) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'refused': return 'Refusée';
      default: return s;
    }
  };

  const received = data.asSeller || [];
  const sent = data.asBuyer || [];

  return (
    <FeedLayout active="Mes demandes" title="Mes invitations">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['received', 'sent'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all
              ${tab === t ? 'bg-[#2777df] text-white shadow-lg shadow-[#2777df]/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2777df]'}`}>
            {t === 'received' ? 'Reçues' : 'Envoyées'}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${tab === t ? 'bg-white/20' : 'bg-gray-100'}`}>
              {t === 'received' ? received.length : sent.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      ) : tab === 'received' && received.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold">Aucune invitation reçue</div>
      ) : tab === 'sent' && sent.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold">Aucune invitation envoyée</div>
      ) : (
        <div className="space-y-3">
          {(tab === 'received' ? received : sent).map(inv => {
            const other = tab === 'received' ? inv.buyer : inv.seller;
            return (
              <div key={inv._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Book info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {inv.book?.images?.[0] ? (
                      <img src={inv.book.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{inv.book?.title || 'Livre'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {tab === 'received' ? 'De: ' : 'À: '}
                      {other?.name || 'Anonyme'}
                      {other?.wilaya ? ` (${other.wilaya})` : ''}
                    </p>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(inv.status)}`}>
                    {statusLabel(inv.status)}
                  </span>

                  {tab === 'received' && inv.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(inv._id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all">
                        Accepter
                      </button>
                      <button onClick={() => handleRefuse(inv._id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl transition-all">
                        Refuser
                      </button>
                    </>
                  )}

                  {inv.status === 'accepted' && other?.phone && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                      📞 {other.phone}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FeedLayout>
  );
}