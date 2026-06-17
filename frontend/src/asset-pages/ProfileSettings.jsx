import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { assetURL } from '../services/api';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    firstName: 'Malek',
    lastName: 'Makki',
    gender: 'Homme',
    phone: '+216 21 640 651',
    address: 'Sfax, Tunisie',
    photo: assetURL('d238c6a07f71439c16b328d71ead5416.jpg')
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1200);
  };

  const handleReset = () => {
    setProfile({
      firstName: '',
      lastName: '',
      gender: 'Homme',
      phone: '',
      address: '',
      photo: null
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FeedLayout active="Profil" title="Mon Profil">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        
        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Upload Section */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Photo de profil</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Profile Pic preview */}
              <div className="h-24 w-24 rounded-full bg-slate-100 border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                {profile.photo ? (
                  <img src={profile.photo} className="h-full w-full object-cover" alt="Profile" />
                ) : (
                  <span className="text-2xl font-black text-gray-400">
                    {profile.firstName ? profile.firstName[0] : 'U'}
                  </span>
                )}
              </div>

              {/* Upload actions */}
              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                <label className="cursor-pointer py-2.5 px-5 bg-[#2777df] hover:bg-[#185db4] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#2777df]/10 text-center block">
                  Changer ma photo de profil
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                
                {profile.photo && (
                  <button 
                    type="button" 
                    onClick={() => handleChange('photo', null)}
                    className="py-2.5 px-5 border border-red-200 hover:bg-red-50 text-red-500 text-xs font-bold rounded-2xl transition-all text-center"
                  >
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Personal Info Grid */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Nom</label>
                <input 
                  type="text" 
                  value={profile.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                  required
                />
              </div>

              {/* First Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Prénom</label>
                <input 
                  type="text" 
                  value={profile.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                  required
                />
              </div>

              {/* Gender selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Genre</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => handleChange('gender', 'Homme')}
                    className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-bold transition-all
                      ${profile.gender === 'Homme' ? 'border-[#2777df] bg-blue-50 text-[#2777df]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    Homme
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => handleChange('gender', 'Femme')}
                    className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-bold transition-all
                      ${profile.gender === 'Femme' ? 'border-[#2777df] bg-blue-50 text-[#2777df]' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    Femme
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Téléphone</label>
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                  required
                />
              </div>

              {/* Address Input */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Adresse</label>
                <input 
                  type="text" 
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#2777df] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Alert messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Profil mis à jour avec succès !
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3 bg-[#fc4d16] hover:bg-[#e03d0d] disabled:bg-orange-300 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/10"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            
            <button 
              type="button" 
              onClick={handleReset}
              className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold rounded-2xl transition-all"
            >
              Réinitialisation
            </button>
          </div>

        </form>

      </div>
    </FeedLayout>
  );
}
