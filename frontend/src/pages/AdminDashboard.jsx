import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [wilayaStats, setWilayaStats] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getWeeklyActivity(),
      adminAPI.getWilayaStats(),
      adminAPI.getRegistrationEvolution(),
    ])
      .then(([s, w, wil, r]) => {
        setStats(s.data);
        setWeekly(w.data || []);
        setWilayaStats(wil.data || []);
        setRegistrations(r.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Utilisateurs', value: stats.totalUsers, color: 'bg-blue-500', hash: '#admin-users' },
    { label: 'Livres', value: stats.totalBooks, color: 'bg-green-500', hash: '#admin-books' },
    { label: 'Abonnés', value: stats.activeSubscriptions, color: 'bg-purple-500', hash: '#admin-users' },
    { label: 'Bannis', value: stats.bannedUsers, color: 'bg-red-500', hash: '#admin-users' },
  ] : [];

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-9 w-auto object-contain" alt="Linkbook" />
          <span className="font-black text-[#2777df] text-xl tracking-tight">Linkbook Admin</span>
        </div>
        <a href="#dashboard" className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Retour au Dashboard</a>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Tableau de Bord Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez la plateforme, les utilisateurs et le contenu</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {cards.map(card => (
                <a key={card.label} href={card.hash}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`h-3 w-3 rounded-full ${card.color} mb-3`}></div>
                  <div className="text-3xl font-black text-gray-900">{card.value}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{card.label}</div>
                </a>
              ))}
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="font-black text-gray-900 mb-4">📊 Activité hebdomadaire</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="books" name="Livres publiés" fill="#2777df" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="invitations" name="Invitations" fill="#fc4d16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Wilayas Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-4">📍 Top wilayas (annonces)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={wilayaStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="wilaya" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" name="Annonces" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Registration Evolution */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-4">📈 Évolution des inscriptions (30j)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" name="Inscriptions" stroke="#2777df" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <a href="#admin-users" className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-black text-gray-900 mb-2">👥 Gérer les Utilisateurs</h3>
                <p className="text-xs text-gray-400">Voir, modifier, bannir/débannir, gérer les abonnements</p>
              </a>
              <a href="#admin-books" className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-black text-gray-900 mb-2">📚 Modérer les Annonces</h3>
                <p className="text-xs text-gray-400">Voir et supprimer les annonces inappropriées</p>
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
