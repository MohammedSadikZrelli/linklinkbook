import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = sent confirmation
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT: Brand Showcase */}
      <div
        className="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-16 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/3768ec8e8ce95737a750cad65a6be4ef.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#185db4]/90 via-[#2777df]/65 to-transparent z-0"></div>
        <div className="relative z-10 flex items-center gap-3">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-10 w-auto object-contain brightness-0 invert" alt="Linkbook" />
          <span className="text-white font-black text-2xl tracking-wide">Linkbook</span>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md shadow-2xl">
          <span className="inline-block bg-[#fc4d16]/30 text-orange-200 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase mb-4">
            Récupération de compte
          </span>
          <h2 className="text-white text-3xl font-black mb-3 leading-snug">
            Pas de panique, on vous aide à récupérer votre compte.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe en toute sécurité.
          </p>
        </div>
        <div className="relative z-10 text-white/50 text-xs">Copyright © 2026 Linkbook. Tous droits réservés.</div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 bg-white">
        <div className="w-full max-w-md">

          {step === 1 ? (
            <>
              {/* STEP 1: Enter email */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-16 w-16 rounded-2xl bg-[#2777df]/5 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-[#2777df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mot de passe oublié ?</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed max-w-xs">
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="w-full">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#2777df]/20 text-sm flex items-center justify-center gap-2 outline-none active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      Envoi en cours...
                    </>
                  ) : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="#login" className="text-sm font-bold text-[#2777df] hover:text-[#185db4] transition-colors flex items-center justify-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  Retour à la connexion
                </a>
              </div>
            </>
          ) : (
            <>
              {/* STEP 2: Email sent confirmation */}
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                  <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3">Email envoyé !</h1>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">
                  Nous avons envoyé un lien de réinitialisation à
                </p>
                <p className="text-sm font-bold text-[#2777df] mb-8 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                  {email}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-8 max-w-xs">
                  Vérifiez votre boîte de réception et vos spams. Le lien est valable 30 minutes.
                </p>
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full py-3.5 border-2 border-[#2777df] text-[#2777df] hover:bg-[#2777df] hover:text-white rounded-2xl font-bold transition-all text-sm outline-none active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : "Renvoyer l'email"}
                </button>
                <div className="mt-4">
                  <a href="#login" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Retour à la connexion
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
