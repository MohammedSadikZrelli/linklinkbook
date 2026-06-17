import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBooks = async (status = '') => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      const res = await adminAPI.getBooks(params);
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette annonce définitivement ?')) return;
    try {
      await adminAPI.deleteBook(id);
      fetchBooks(filter);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-9 w-auto object-contain" alt="Linkbook" />
          <span className="font-black text-[#2777df] text-xl tracking-tight">Admin - Annonces</span>
        </div>
        <div className="flex gap-2">
          <a href="#admin-dashboard" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Dashboard</a>
          <a href="#admin-users" className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900">Utilisateurs</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Annonces</h1>
            <p className="text-sm text-gray-500 mt-1">{books.length} annonce(s)</p>
          </div>
          <div className="flex gap-2">
            {['', 'Disponible', 'En attente', 'Vendu', 'Donné'].map(s => (
              <button key={s} onClick={() => { setFilter(s); fetchBooks(s); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === s ? 'bg-[#2777df] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#2777df]'}`}>
                {s || 'Tous'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Chargement...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">Aucune annonce trouvée</div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Titre</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendeur</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Prix</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {books.map(book => (
                    <tr key={book._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{book.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {book.user ? (
                          <a href={`#admin-user-detail?id=${book.user._id}`} className="hover:text-[#2777df]">
                            {book.user.name || book.user.email}
                          </a>
                        ) : 'Inconnu'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${book.type === 'vente' ? 'bg-blue-50 text-blue-600' : book.type === 'échange' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                          {book.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{book.price || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold ${book.status === 'Disponible' ? 'text-green-500' : 'text-gray-500'}`}>{book.status}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right flex gap-2 justify-end">
                        <a href={`#edit-offer?id=${book._id}`}
                          className="px-3 py-1.5 text-xs font-bold text-[#2777df] hover:bg-blue-50 rounded-lg transition-colors">
                          Modifier
                        </a>
                        <button onClick={() => handleDelete(book._id)}
                          className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          Supprimer
                        </button>
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