import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function ResetPassword({ query = {} }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const token = query.token || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-16 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/3768ec8e8ce95737a750cad65a6be4ef.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#185db4]/90 via-[#2777df]/65 to-transparent z-0"></div>
          <div className="relative z-10 flex items-center gap-3">
            <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-10 w-auto object-contain brightness-0 invert" alt="Linkbook" />
          </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md shadow-2xl">
          <span className="inline-block bg-[#fc4d16]/30 text-orange-200 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase mb-4">
            Nouveau mot de passe
          </span>
          <h2 className="text-white text-3xl font-black mb-3 leading-snug">
            Choisissez un nouveau mot de passe sécurisé.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Il doit contenir au moins 6 caractères.
          </p>
        </div>
        <div className="relative z-10 text-white/50 text-xs">Copyright © 2026 Linkbook. Tous droits réservés.</div>
      </div>

      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 bg-white">
        <div className="w-full max-w-sm">
          {!done ? (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-16 w-16 rounded-2xl bg-[#2777df]/5 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-[#2777df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nouveau mot de passe</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">Choisissez un nouveau mot de passe</p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm" />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#2777df]/20 text-sm">
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">Mot de passe réinitialisé !</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">Votre mot de passe a été modifié avec succès.</p>
              <a href="#login" className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] text-white rounded-2xl font-bold transition-all text-sm block text-center">
                Se connecter
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
