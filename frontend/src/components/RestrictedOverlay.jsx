import React from 'react';

export default function RestrictedOverlay() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative p-4"
      style={{ 
        backgroundImage: "url('/images/9daa051ce6458b314a567b7df7c447a2.jpg')",
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      {/* Dark blur overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-0"></div>

      {/* Lock Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 md:p-10 shadow-2xl text-center transform hover:scale-[1.01] transition-all duration-300">
        
        {/* Animated Lock Icon */}
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-[#2777df] to-[#fc4d16] p-0.5 shadow-lg shadow-orange-500/25 mb-6 flex items-center justify-center animate-pulse">
          <div className="h-full w-full rounded-full bg-slate-950/80 flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-7 w-auto object-contain brightness-0 invert" alt="Linkbook" />
          <span className="text-white font-black text-xl tracking-tight">Linkbook</span>
        </div>

        {/* Heading */}
        <h2 className="text-white text-2xl font-black mb-4 leading-snug">
          Accès Restreint
        </h2>

        {/* Message */}
        <p className="text-gray-200 text-sm leading-relaxed mb-8">
          Vous ne pouvez pas voir les détails des offres ni interagir avec la communauté avant d'avoir créé un compte.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5">
          <button 
            onClick={() => window.location.hash = '#register'}
            className="w-full py-3.5 bg-[#fc4d16] hover:bg-[#e03d0d] text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            S'inscrire
          </button>
          
          <button 
            onClick={() => window.location.hash = '#login'}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
          >
            Se connecter
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-xs text-white/40">
          Rejoignez Linkbook gratuitement en quelques secondes.
        </div>

      </div>
    </div>
  );
}
