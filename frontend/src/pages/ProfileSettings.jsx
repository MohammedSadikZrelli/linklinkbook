import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { authAPI, uploadAPI, saveUser, getUser } from '../services/api';

const WILAYAS = ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'];

const NIVEAUX = [
  'Primaire — 1ère année', 'Primaire — 2ème année', 'Primaire — 3ème année',
  'Primaire — 4ème année', 'Primaire — 5ème année', 'Primaire — 6ème année',
  'Collège — 7ème année', 'Collège — 8ème année', 'Collège — 9ème année',
  'Secondaire — 1ère année', 'Secondaire — 2ème année', 'Secondaire — 3ème année',
  'Secondaire — 4ème année (BAC)',
  'Université — Licence', 'Université — Master', 'Université — Doctorat',
  'Formation professionnelle',
];

const PROFILE_TYPES = [
  { value: 'eleve', label: 'Élève' },
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
  { value: 'autre', label: 'Autre' },
];

export default function ProfileSettings() {
  const currentUser = getUser() || {};
  const [profile, setProfile] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    profileType: currentUser.profileType || '',
    schoolLevel: currentUser.schoolLevel || '',
    wilaya: currentUser.wilaya || '',
    address: {
      street: currentUser.address?.street || '',
      city: currentUser.address?.city || '',
      postalCode: currentUser.address?.postalCode || '',
    },
    avatar: currentUser.avatar || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));
  const handleAddressChange = (field, value) => setProfile(p => ({
    ...p,
    address: { ...p.address, [field]: value }
  }));

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUploading(true);
    setError('');
    try {
      const res = await uploadAPI.upload([file]);
      const url = res.data?.[0];
      if (url) {
        const updateRes = await authAPI.updateProfile({ avatar: url });
        saveUser(updateRes.user);
        setProfile(p => ({ ...p, avatar: url }));
        setSuccess('Photo de profil mise à jour !');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      saveUser(res.user);
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.new !== password.confirm) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (password.new.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword(password.current, password.new);
      setSuccess('Mot de passe modifié avec succès !');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FeedLayout active="Profil" title="Mon Profil">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs font-bold">{success}</div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Informations personnelles</h3>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2777df] to-[#fc4d16] flex items-center justify-center text-white font-black text-lg overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (currentUser.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-6 w-6 bg-[#2777df] hover:bg-[#185db4] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-400">{avatarUploading ? 'Upload...' : 'Cliquez pour changer votre photo'}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Nom complet</label>
                <input type="text" value={profile.name} onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Email</label>
                <input type="email" value={currentUser.email || ''} disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-semibold cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Téléphone</label>
                <input type="tel" value={profile.phone} onChange={e => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Profil</label>
                <select value={profile.profileType} onChange={e => handleChange('profileType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-[#2777df] transition-all cursor-pointer">
                  <option value="">Sélectionnez</option>
                  {PROFILE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Niveau scolaire</label>
                <select value={profile.schoolLevel} onChange={e => handleChange('schoolLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-[#2777df] transition-all cursor-pointer">
                  <option value="">Sélectionnez</option>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Wilaya</label>
                <select value={profile.wilaya} onChange={e => handleChange('wilaya', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-[#2777df] transition-all cursor-pointer">
                  <option value="">Sélectionnez une wilaya</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Adresse</label>
                <input type="text" value={profile.address.street} onChange={e => handleAddressChange('street', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                  placeholder="Rue, cité, quartier..." />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Ville</label>
                <input type="text" value={profile.address.city} onChange={e => handleAddressChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Code postal</label>
                <input type="text" value={profile.address.postalCode} onChange={e => handleAddressChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-3 bg-[#fc4d16] hover:bg-[#e03d0d] disabled:bg-orange-300 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/10">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Mot de passe actuel</label>
                <input type="password" value={password.current} onChange={e => setPassword(p => ({ ...p, current: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Nouveau mot de passe</label>
                <input type="password" value={password.new} onChange={e => setPassword(p => ({ ...p, new: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Confirmer le nouveau mot de passe</label>
                <input type="password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all" required />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={saving}
                className="px-6 py-3 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-300 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/10">
                {saving ? 'Traitement...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FeedLayout>
  );
}
