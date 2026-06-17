import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminUserDetail({ query }) {
  const userId = query?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [upgradeMonths, setUpgradeMonths] = useState(12);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    adminAPI.getUserById(userId)
      .then(res => {
        setData(res.data);
        const u = res.data.user;
        setForm({
          name: u.name,
          email: u.email,
          phone: u.phone,
          profileType: u.profileType,
          schoolLevel: u.schoolLevel,
          wilaya: u.wilaya,
          address: {
            street: u.address?.street || '',
            city: u.address?.city || '',
            postalCode: u.address?.postalCode || '',
          },
          role: u.role,
          isPro: u.isPro
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    try {
      await adminAPI.updateUser(userId, form);
      alert('Utilisateur mis à jour');
      setEditMode(false);
      const res = await adminAPI.getUserById(userId);
      setData(res.data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBan = async () => {
    if (!window.confirm('Bannir cet utilisateur ?')) return;
    try { await adminAPI.banUser(userId); const res = await adminAPI.getUserById(userId); setData(res.data); } catch (err) { alert(err.message); }
  };

  const handleUnban = async () => {
    if (!window.confirm('Débannir cet utilisateur ?')) return;
    try { await adminAPI.unbanUser(userId); const res = await adminAPI.getUserById(userId); setData(res.data); } catch (err) { alert(err.message); }
  };

  const handleBanIp = async () => {
    if (!window.confirm('Bannir cette IP et tous les comptes associés ?')) return;
    try { await adminAPI.banIp(userId); const res = await adminAPI.getUserById(userId); setData(res.data); } catch (err) { alert(err.message); }
  };

  const handleUpgrade = async () => {
    if (!window.confirm(`Activer l'abonnement pour ${upgradeMonths} mois ?`)) return;
    try { await adminAPI.upgradeSub(userId, upgradeMonths); alert('Abonnement activé'); const res = await adminAPI.getUserById(userId); setData(res.data); } catch (err) { alert(err.message); }
  };

  const handleToggleAccess = async () => {
    const action = user.subscriptionActive ? 'Désactiver' : 'Activer';
    if (!window.confirm(`${action} l'accès pour ${user.name} ?`)) return;
    try {
      const res = await adminAPI.toggleAccess(userId);
      alert(res.message);
      const r = await adminAPI.getUserById(userId);
      setData(r.data);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (!window.confirm('SUPPRIMER DÉFINITIVEMENT cet utilisateur et toutes ses données ?')) return;
    try { await adminAPI.deleteUser(userId); alert('Utilisateur supprimé'); window.location.hash = '#admin-users'; } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="text-gray-400 font-bold">Chargement...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="text-gray-400 font-bold">Utilisateur non trouvé</div>
    </div>
  );

  const { user, books, subscription } = data;

  return (
    <div className="min-h-screen bg-[#f4f7fc]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-9 w-auto object-contain" alt="Linkbook" />
          <span className="font-black text-[#2777df] text-xl tracking-tight">Admin - {user.name}</span>
        </div>
        <a href="#admin-users" className="text-xs font-bold text-gray-500 hover:text-gray-900">← Retour</a>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900">Informations</h2>
                <button onClick={() => setEditMode(!editMode)} className="text-xs font-bold text-[#2777df] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  {editMode ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  {['name', 'email', 'phone', 'profileType', 'schoolLevel', 'wilaya'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{field}</label>
                      <input
                        type="text" value={form[field] || ''}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#2777df]"
                      />
                    </div>
                  ))}
                  {['street', 'city', 'postalCode'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">address.{field}</label>
                      <input
                        type="text" value={form.address?.[field] || ''}
                        onChange={e => setForm({ ...form, address: { ...(form.address || {}), [field]: e.target.value } })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#2777df]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rôle</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pro</label>
                    <select value={form.isPro} onChange={e => setForm({ ...form, isPro: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none">
                      <option value={false}>Non</option>
                      <option value={true}>Oui</option>
                    </select>
                  </div>
                  <button onClick={handleSave} className="w-full py-2.5 bg-[#2777df] text-white rounded-xl font-bold text-sm">Enregistrer</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ['Nom', user.name], ['Email', user.email], ['Téléphone', user.phone || '-'],
                    ['Profil', user.profileType || '-'], ['Niveau', user.schoolLevel || '-'], ['Wilaya', user.wilaya || '-'],
                    ['Adresse', user.address?.street || '-'], ['Ville', user.address?.city || '-'], ['Code postal', user.address?.postalCode || '-'],
                    ['Rôle', user.role], ['Pro', user.isPro ? 'Oui' : 'Non'],
                    ['Accès', user.subscriptionActive ? '✅ Actif' : '❌ Inactif'],
                    ['IP', user.ip || '-'], ['IP bannie', user.bannedIp || '-'],
                    ['Vérifié', user.emailVerified ? 'Oui' : 'Non'],
                    ['Membre depuis', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-']
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                      <div className="font-bold text-gray-900 mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-gray-900 mb-4">Livres ({books.length})</h2>
              {books.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun livre</p>
              ) : (
                <div className="space-y-2">
                  {books.map(book => (
                    <div key={book._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{book.title}</div>
                        <div className="text-xs text-gray-400">{book.subject} - {book.type} - {book.status}</div>
                      </div>
                      <button onClick={async () => { if (window.confirm('Supprimer ce livre ?')) { await adminAPI.deleteBook(book._id); window.location.reload(); }}}
                        className="text-xs font-bold text-red-500 hover:text-red-700">Supprimer</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button onClick={handleToggleAccess} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${user.subscriptionActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                  {user.subscriptionActive ? '🔒 Désactiver l\'accès' : '✅ Activer l\'accès'}
                </button>
                {user.isBanned ? (
                  <button onClick={handleUnban} className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors">
                    Débannir
                  </button>
                ) : (
                  <button onClick={handleBan} className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors">
                    Bannir
                  </button>
                )}
                {user.ip && (
                  <button onClick={handleBanIp} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors">
                    Bannir IP ({user.ip})
                  </button>
                )}
                <button onClick={handleDelete} className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold text-sm transition-colors">
                  Supprimer le compte
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-gray-900 mb-4">Abonnement</h2>
              {subscription ? (
                <div className="text-sm space-y-1 mb-4">
                  <div><span className="text-xs font-bold text-gray-400">Début:</span> <span className="font-bold">{new Date(subscription.startDate).toLocaleDateString()}</span></div>
                  <div><span className="text-xs font-bold text-gray-400">Fin:</span> <span className="font-bold">{new Date(subscription.endDate).toLocaleDateString()}</span></div>
                  <div><span className="text-xs font-bold text-gray-400">Statut:</span> <span className="font-bold">{subscription.paymentStatus}</span></div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">Aucun abonnement actif</p>
              )}
              <div className="flex gap-2">
                <input type="number" value={upgradeMonths} onChange={e => setUpgradeMonths(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none text-center" min="1" />
                <button onClick={handleUpgrade} className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm transition-colors">
                  Activer (mois)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
