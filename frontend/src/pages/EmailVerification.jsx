import React, { useState, useRef, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function EmailVerification({ query = {} }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const inputsRef = useRef([]);

  const email = query.email || '';

  useEffect(() => {
    if (email) {
      sendCode();
    }
  }, [email]);

  const sendCode = async () => {
    setSending(true);
    setError('');
    try {
      await authAPI.sendVerification(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const full = code.join('');
    if (full.length < 6) return;
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyEmail(email, full);
      setVerified(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT: Brand Image */}
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
            Vérification
          </span>
          <h2 className="text-white text-3xl font-black mb-3 leading-snug">
            Une dernière étape pour sécuriser votre compte.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            La vérification de votre email garantit la sécurité de votre compte et vous protège contre tout accès non autorisé.
          </p>
        </div>
        <div className="relative z-10 text-white/50 text-xs">Copyright © 2026 Linkbook. Tous droits réservés.</div>
      </div>

      {/* RIGHT: Verification Panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 bg-white">
        <div className="w-full max-w-sm">

          {!verified ? (
            <>
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="h-16 w-16 rounded-2xl bg-[#2777df]/5 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-[#2777df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vérification Email</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed max-w-xs">
                  Entrez le code à 6 chiffres envoyé à votre adresse email.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-black border-2 rounded-2xl transition-all outline-none
                        ${digit
                          ? 'border-[#2777df] bg-[#2777df]/5 text-[#2777df]'
                          : 'border-gray-200 bg-gray-50 text-gray-800'
                        }
                        focus:border-[#2777df] focus:bg-white focus:ring-4 focus:ring-blue-100`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.join('').length < 6}
                  className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#2777df]/20 text-sm flex items-center justify-center gap-2 outline-none active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      Vérification...
                    </>
                  ) : 'Vérifier le code'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {/* Resend */}
              <div className="mt-6 text-center text-sm text-gray-500">
                Vous n'avez pas reçu le code ?{' '}
                <button type="button" onClick={sendCode} disabled={sending} className="text-[#fc4d16] font-bold hover:underline ml-1 outline-none disabled:opacity-50">
                  {sending ? 'Envoi...' : 'Renvoyer'}
                </button>
              </div>
            </>
          ) : (
            /* Verified Success State */
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">Email vérifié !</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
                Votre adresse email a été vérifiée avec succès. Votre compte est maintenant activé.
              </p>
              <a
                href="#dashboard"
                className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#2777df]/20 text-sm flex items-center justify-center gap-2 outline-none active:scale-[0.98]"
              >
                Accéder au tableau de bord
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
