import React, { useState } from 'react';
import { authAPI, saveToken, saveUser } from '../services/api';

// ─── Icons (static, defined outside component to avoid re-creation) ──
const userIcon = <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const emailIcon = <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
const lockIcon = <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const schoolIcon = <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0118 16.5C18 18.985 15.314 21 12 21s-6-2.015-6-4.5c0-1.5.297-3.28-.16-5.922L12 14z" /></svg>;
const locationIcon = <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PROFILE_TYPES = [
  { value: 'eleve', label: 'Élève' },
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'enseignant', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
  { value: 'autre', label: 'Autre' },
];

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

// ─── Reusable InputField (stable reference, won't cause focus loss) ──
function InputField({ icon, label, value, onChange, type = 'text', placeholder, toggle, show, onToggle, required = true }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">{icon}</div>
        <input
          type={toggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
        />
        {toggle && (
          <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#2777df] transition-colors outline-none">
            {show ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.9 9.9m0 0l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({ icon, label, value, onChange, children, required = true }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">{icon}</div>
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm text-gray-800 cursor-pointer"
        >
          {children}
        </select>
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileType: '',
    schoolLevel: '',
    wilaya: '',
    addressStreet: '',
    city: '',
    postalCode: '',
    password: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        profileType: form.profileType,
        schoolLevel: form.schoolLevel,
        wilaya: form.wilaya,
        address: {
          street: form.addressStreet,
          city: form.city,
          postalCode: form.postalCode,
        },
        password: form.password,
      });
      saveToken(data.token);
      saveUser(data.user);
      window.location.hash = `#verify-email?email=${encodeURIComponent(form.email)}`;
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
          </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md shadow-2xl">
          <span className="inline-block bg-[#fc4d16]/30 text-orange-200 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase mb-4">
            Rejoignez nous
          </span>
          <h2 className="text-white text-3xl font-black mb-3 leading-snug">
            Créez votre compte et accédez à toutes les opportunités.
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Inscription rapide, accès immédiat à toutes les fonctionnalités premium de notre plateforme.
          </p>
        </div>
        <div className="relative z-10 text-white/50 text-xs">Copyright © 2026 Linkbook. Tous droits réservés.</div>
      </div>

      {/* RIGHT: Register Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 bg-white overflow-y-auto relative">
        
        {/* Back to Home */}
        <a href="#" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2777df] transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Retour à l'accueil
        </a>
        
<div className="w-full max-w-md mt-8 lg:mt-0">

           {/* Header */}
           <div className="flex flex-col items-center text-center mb-8">
             <div className="h-14 w-14 p-2.5 rounded-2xl bg-[#2777df]/5 flex items-center justify-center mb-4">
               <img src="/images/d59019ab7cc7759b758acfe6f8e6c521.png" className="h-9 w-auto object-contain" alt="Linkbook" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">S'inscrire</h1>
             <p className="text-sm text-gray-500 mt-2 font-medium">Bienvenue sur notre plateforme</p>
           </div>

          <form className="w-full" onSubmit={handleSubmit}>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                {error}
              </div>
            )}

            {/* Two columns: Nom / Prénom */}
            <div className="grid grid-cols-2 gap-4 mb-0">
              <InputField icon={userIcon} label="Nom" value={form.lastName} onChange={update('lastName')} placeholder="Dupont" />
              <InputField icon={userIcon} label="Prénom" value={form.firstName} onChange={update('firstName')} placeholder="Jean" />
            </div>

            <InputField icon={emailIcon} label="Adresse Email" value={form.email} onChange={update('email')} type="email" placeholder="exemple@email.com" />
            <InputField icon={userIcon} label="Téléphone" value={form.phone} onChange={update('phone')} type="tel" placeholder="+216 XX XXX XXX" />
            <SelectField icon={userIcon} label="Vous êtes" value={form.profileType} onChange={update('profileType')}>
              <option value="">Sélectionnez votre profil</option>
              {PROFILE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </SelectField>
            <SelectField icon={schoolIcon} label="Niveau scolaire" value={form.schoolLevel} onChange={update('schoolLevel')} required={false}>
              <option value="">Sélectionnez votre niveau</option>
              {NIVEAUX.map(level => <option key={level} value={level}>{level}</option>)}
            </SelectField>
            <SelectField icon={locationIcon} label="Wilaya" value={form.wilaya} onChange={update('wilaya')}>
              <option value="">Sélectionnez votre wilaya</option>
              {WILAYAS.map(wilaya => <option key={wilaya} value={wilaya}>{wilaya}</option>)}
            </SelectField>
            <InputField icon={locationIcon} label="Adresse" value={form.addressStreet} onChange={update('addressStreet')} placeholder="Rue, cité, quartier..." />
            <div className="grid grid-cols-2 gap-4 mb-0">
              <InputField icon={locationIcon} label="Ville" value={form.city} onChange={update('city')} placeholder="Sfax" required={false} />
              <InputField icon={locationIcon} label="Code postal" value={form.postalCode} onChange={update('postalCode')} placeholder="3000" required={false} />
            </div>
            <InputField icon={lockIcon} label="Mot de passe" value={form.password} onChange={update('password')} placeholder="••••••••••••" toggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            <InputField icon={lockIcon} label="Confirmer le mot de passe" value={form.confirm} onChange={update('confirm')} placeholder="••••••••••••" toggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />

            {/* Terms */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-md border-gray-300 text-[#2777df] focus:ring-[#2777df] flex-shrink-0"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                J'accepte les{' '}
                <a href="#terms" className="text-[#2777df] font-bold hover:underline">Conditions d'utilisation</a>
                {' '}et la{' '}
                <a href="#privacy" className="text-[#2777df] font-bold hover:underline">Politique de confidentialité</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-3.5 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#2777df]/20 text-sm flex items-center justify-center gap-2 outline-none active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  <span>Création en cours...</span>
                </>
              ) : "S'inscrire"}
            </button>
          </form>

          {/* Separator */}
          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative z-10 bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">OU</span>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3">
            <a href="http://localhost:5000/api/auth/google" className="w-full py-3 px-4 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-sm font-bold text-gray-600 outline-none active:scale-[0.99]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </a>
            <button type="button" className="w-full py-3 px-4 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-sm font-bold text-gray-600 outline-none active:scale-[0.99]">
              <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continuer avec Facebook
            </button>
          </div>

          <div className="mt-7 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
            Vous avez déjà un compte ?{' '}
            <a href="#login" className="text-[#fc4d16] hover:text-[#e03d0d] ml-1 transition-colors">Connexion</a>
          </div>

        </div>
      </div>
    </div>
  );
}
