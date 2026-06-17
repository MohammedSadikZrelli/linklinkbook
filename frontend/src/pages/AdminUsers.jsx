import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (q = '') => {
    try {
      setLoading(true);
      const params = {};
      if (q) params.search = q;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleBan = async (id) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try { await adminAPI.banUser(id); fetchUsers(search); } catch (err) { alert(err.message); }
  };

  const handleUnban = async (id) => {
    if (!window.confirm('Débannir cet utilisateur ?')) return;
    try { await adminAPI.unbanUser(id); fetchUsers(search); } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-9 w-auto object-contain" alt="Linkbook" />
          <span className="font-black text-[#2777df] text-xl tracking-tight">Admin - Utilisateurs</span>
        </div>
        <div className="flex gap-2">
          <a href="#admin-dashboard" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Dashboard</a>
          <a href="#admin-books" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Annonces</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Utilisateurs</h1>
            <p className="text-sm text-gray-500 mt-1">{users.length} utilisateur(s)</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email..."
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#2777df] w-full sm:w-64"
            />
            <button type="submit" className="px-4 py-2 bg-[#2777df] text-white rounded-xl font-bold text-sm">Chercher</button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">Aucun utilisateur trouvé</div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Wilaya</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Inscrit</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <a href={`#admin-user-detail?id=${user._id}`} className="font-bold text-gray-900 hover:text-[#2777df]">{user.name}</a>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{user.wilaya || '-'}</td>
                      <td className="py-3 px-4">
                        {user.isBanned ? (
                          <span className="text-xs font-bold text-red-500">Banni</span>
                        ) : (
                          <span className="text-xs font-bold text-green-500">Actif</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <a href={`#admin-user-detail?id=${user._id}`}
                            className="px-3 py-1.5 text-xs font-bold text-[#2777df] hover:bg-blue-50 rounded-lg transition-colors">
                            Détails
                          </a>
                          {user.isBanned ? (
                            <button onClick={() => handleUnban(user._id)}
                              className="px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              Débannir
                            </button>
                          ) : (
                            <button onClick={() => handleBan(user._id)}
                              className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              Bannir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}