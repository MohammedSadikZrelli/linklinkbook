import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, paymentAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [finStats, setFinStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transRes, finRes] = await Promise.all([
          bookAPI.getMyStats(),
          paymentAPI.getHistory(),
          paymentAPI.getStats()
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (transRes.success) setTransactions(transRes.data);
        if (finRes.success) setFinStats(finRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <FeedLayout active="Tableau de bord" title="Chargement...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2777df]"></div>
        </div>
      </FeedLayout>
    );
  }

  

  return (
    

    <FeedLayout active="Tableau de bord" title="Mon Tableau de Bord">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2777df] flex items-center justify-center mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.082.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{stats?.totalBooks || 0}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Annonces totales</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{finStats?.totalEarned || 0} DT</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ventes (Gain)</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#fc4d16] flex items-center justify-center mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{finStats?.totalSpent || 0} DT</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Achats (Dépenses)</p>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{transactions.length}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Mouvements</p>
            </div>
          </div>

          {/* Recent Books List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100/80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">Mes dernières annonces</h2>
              <a href="#my-offers" className="text-[10px] font-bold text-gray-400 hover:text-[#2777df] transition-colors">Gérer mes offres</a>
            </div>
            {stats?.recentBooks?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBooks.map(b => (
                  <div key={b._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                    <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={b.images?.[0] || '/images/9daa051ce6458b314a567b7df7c447a2.jpg'} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{b.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{b.subject} • {b.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#2777df]">{b.price ? `${b.price} DT` : 'Troc'}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${b.status === 'Disponible' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 font-bold text-xs">Aucune annonce publiée</div>
            )}
          </div>
        </div>

          {/* Recent Transactions List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100/80 lg:col-span-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">Derniers mouvements</h2>
              <span className="text-[10px] font-black text-gray-400">{transactions.length} total</span>
            </div>
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 
                      ${t.amount < 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {t.amount < 0 ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{t.description}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(t.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              )) : (
                <div className="py-12 text-center text-gray-400 font-bold text-xs">Aucune transaction</div>
              )}
            </div>
          </div>

      </div>
   

    </FeedLayout>
  );
}
