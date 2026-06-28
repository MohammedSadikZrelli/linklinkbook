import React, { useState } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, uploadAPI, getUser } from '../services/api';
import { enhanceImage, analyzeBookImage } from '../services/imageAI';
import { puter } from '@heyputer/puter.js';

const MATIERES = [
  'Mathématiques', 'Physique', 'Chimie', 'Sciences', 'Sciences de la vie et de la terre',
  'Français', 'Arabe', 'Anglais', 'Allemand', 'Espagnol',
  'Histoire-Géographie', 'Philosophie', 'Éducation islamique',
  'Informatique', 'Technologie', 'Économie', 'Comptabilité',
  'Génie civil', 'Génie électrique', 'Génie mécanique',
  'Arts plastiques', 'Sport', 'Autre'
];

const NIVEAUX = [
  'Primaire — 1ère année', 'Primaire — 2ème année', 'Primaire — 3ème année',
  'Primaire — 4ème année', 'Primaire — 5ème année', 'Primaire — 6ème année',
  'Collège — 7ème année', 'Collège — 8ème année', 'Collège — 9ème année',
  'Secondaire — 1ère année', 'Secondaire — 2ème année', 'Secondaire — 3ème année',
  'Secondaire — 4ème année (BAC)',
  'Université — Licence', 'Université — Master', 'Université — Doctorat',
  'Formation professionnelle', 'Autre'
];

const WILAYAS = ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'];

export default function CreateOffer() {
  const user = getUser();
  const isSubscribed = user?.subscriptionActive;

  const [form, setForm] = useState({ title: '', author: '', isbn: '', subject: '', level: '', condition: '', type: 'vente', price: '', description: '', location: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [coverOptions, setCoverOptions] = useState(null);
  const [selectedCover, setSelectedCover] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStep, setAiStep] = useState('');

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setImages(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const runAI = async () => {
    if (images.length === 0) return;
    setAiBusy(true);
    setError('');

    try {
      setAiStep('Amélioration et analyse par Vision IA...');
      const result = await analyzeBookImage(images[0]);
      const meta = result.metadata || {};

      // Set cover options initially (aiCover will be generated)
      setCoverOptions({
        enhanced: result.enhanced,
        officialCover: result.officialCover,
        aiCover: null
      });

      // Default selection is the official or enhanced cover initially
      setSelectedCover(result.officialCover || result.enhanced);

      setAiStep('Pré-remplissage du formulaire...');
      setForm(prev => ({
        ...prev,
        title: meta.title || prev.title,
        author: meta.author || prev.author,
        isbn: meta.isbn || prev.isbn,
        subject: MATIERES.includes(meta.subject) ? meta.subject : prev.subject,
        level: NIVEAUX.includes(meta.level) ? meta.level : prev.level,
        description: meta.description || prev.description,
        condition: meta.condition && ['Neuf', 'Bon état', 'Usagé'].includes(meta.condition) ? meta.condition : prev.condition,
      }));

      // Generate FLUX Cover using Puter.js
      if (meta.title) {
        setAiStep('Génération de la couverture avec FLUX.1.1 Pro...');
        try {
          const prompt = `A pristine, flawless digital scan of an educational textbook cover. Exact layout and colors: ${meta.visual_design || 'Clean layout'}. The title "${meta.title}" must be exactly as described. Maintain the exact original colors, isometric illustrations, and visual style, but make it look like a high-quality vector digital version.`;
          const imgElem = await puter.ai.txt2img(prompt, { model: 'black-forest-labs/flux-1.1-pro' });
          
          // Upload the generated blob to our backend
          const blob = await fetch(imgElem.src).then(r => r.blob());
          const aiFile = new File([blob], `flux-cover-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          const uploadRes = await uploadAPI.upload([aiFile]);
          if (uploadRes && uploadRes.data && uploadRes.data.length > 0) {
            const finalAiUrl = uploadRes.data[0];
            setCoverOptions(prev => ({ ...prev, aiCover: finalAiUrl }));
            setSelectedCover(finalAiUrl);
          }
        } catch (fluxErr) {
          console.error("FLUX Generation failed:", fluxErr);
          const fallbackUrl = result.aiCover || `https://placehold.co/600x800/2777df/ffffff/png?text=${encodeURIComponent(meta.title)}&font=roboto`;
          setCoverOptions(prev => ({ ...prev, aiCover: fallbackUrl }));
          setSelectedCover(fallbackUrl);
        }
      }

      setAiStep('');
    } catch (err) {
      setError('Erreur IA : ' + err.message);
    } finally {
      setAiBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (images.length === 0 && !selectedCover) {
      setError('Veuillez ajouter au moins une photo');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrls = [];

      // 1. Add selected cover as the primary image if it exists
      if (selectedCover) {
        imageUrls.push(selectedCover);
      }

      // 2. Upload other local files (all files except index 0, which was raw cover file)
      const filesToUpload = coverOptions ? images.slice(1) : images;

      if (filesToUpload.length > 0) {
        setUploading(true);
        const uploadRes = await uploadAPI.upload(filesToUpload);
        imageUrls = [...imageUrls, ...uploadRes.data];
        setUploading(false);
      }

      // Fallback if no images are collected
      if (imageUrls.length === 0 && images.length > 0) {
        setUploading(true);
        const uploadRes = await uploadAPI.upload(images);
        imageUrls = uploadRes.data;
        setUploading(false);
      }

      await bookAPI.create({
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        subject: form.subject,
        level: form.level,
        condition: form.condition,
        price: form.type === 'don' ? '' : form.price,
        type: form.type,
        status: 'Disponible',
        description: form.description,
        location: form.location,
        images: imageUrls,
      });
      window.location.hash = '#my-offers';
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!isSubscribed && form.type !== 'don') {
    return (
      <FeedLayout active="Mes offres" title="Créer une offre :">
        <div className="max-w-sm mx-auto text-center py-16">
          <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">🔒 Abonnement requis</h2>
          <p className="text-sm text-gray-500 mb-6">Vous devez être abonné pour publier des offres de vente ou d'échange. Les dons sont gratuits pour tout le monde.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setForm({ ...form, type: 'don' })} className="px-6 py-3 bg-green-500 text-white rounded-2xl text-sm font-bold hover:bg-green-600 transition-all">Faire un don</button>
            <a href="#pricing" className="px-6 py-3 bg-[#2777df] text-white rounded-2xl text-sm font-bold hover:bg-[#185db4] transition-all">S'abonner →</a>
          </div>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout active="Mes offres" title="Créer une offre avec IA">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
            {/* Image Upload with AI */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Photo du livre</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.length === 0 && (
                  <label className="col-span-4 aspect-video rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#2777df] flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#2777df]/5">
                    <svg className="h-10 w-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-bold text-gray-400">Prenez une photo du livre</span>
                    <span className="text-xs text-gray-300 mt-1">Format JPG, PNG (max 5 Mo)</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                )}
                {images.map((f, i) => {
                  const isCover = i === 0 && selectedCover;
                  const src = isCover ? selectedCover : previews[i];
                  return (
                    <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden relative group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {isCover && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full">Couverture</span>
                      )}
                      <button type="button" onClick={() => {
                        setImages(prev => prev.filter((_, j) => j !== i));
                        setPreviews(prev => prev.filter((_, j) => j !== i));
                        if (i === 0) {
                          setCoverOptions(null);
                          setSelectedCover('');
                        }
                      }} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  );
                })}
                {images.length > 0 && images.length < 6 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#2777df] flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-[#2777df]/5">
                    <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs text-gray-400 mt-1 font-bold">Ajouter</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  </label>
                )}
              </div>

              {/* AI button */}
              {images.length > 0 && !aiBusy && !coverOptions && (
                <button type="button" onClick={runAI} className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white rounded-2xl text-sm font-bold transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  🪄 Améliorer & Analyser avec IA
                </button>
              )}

              {coverOptions && !aiBusy && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl flex items-center gap-3">
                    <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold text-emerald-700">Livre analysé avec succès par l'IA ✓</span>
                    <button type="button" onClick={runAI} className="ml-auto text-xs font-bold text-[#2777df] hover:underline">Réanalyser</button>
                  </div>
                  
                  {/* Selection UI */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider">
                      Sélectionnez la couverture finale
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* 1. Enhanced photo */}
                      <div 
                        onClick={() => setSelectedCover(coverOptions.enhanced)}
                        className={`cursor-pointer rounded-2xl border-2 p-2 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                          selectedCover === coverOptions.enhanced ? 'border-[#2777df] bg-blue-50/20 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                          <img src={coverOptions.enhanced} alt="Photo améliorée" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#2777df] text-white text-[8px] font-bold rounded-full">Photo IA</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-700 text-center">Photo optimisée</span>
                        {selectedCover === coverOptions.enhanced && (
                          <span className="absolute top-1.5 right-1.5 bg-[#2777df] text-white rounded-full p-0.5">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </div>

                      {/* 2. Official Cover */}
                      {coverOptions.officialCover ? (
                        <div 
                          onClick={() => setSelectedCover(coverOptions.officialCover)}
                          className={`cursor-pointer rounded-2xl border-2 p-2 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                            selectedCover === coverOptions.officialCover ? 'border-[#2777df] bg-blue-50/20 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                            <img src={coverOptions.officialCover} alt="Couverture officielle" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full">Officielle</span>
                          </div>
                          <span className="text-[10px] font-black text-gray-700 text-center">Officielle</span>
                          {selectedCover === coverOptions.officialCover && (
                            <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-2 flex flex-col items-center justify-center bg-gray-50 text-center opacity-60">
                          <svg className="h-5 w-5 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-[9px] font-bold text-gray-400">{coverOptions ? "Non trouvée" : "Recherche..."}</span>
                        </div>
                      )}

                      {/* 3. AI Generated Cover */}
                      {coverOptions.aiCover ? (
                        <div 
                          onClick={() => setSelectedCover(coverOptions.aiCover)}
                          className={`cursor-pointer rounded-2xl border-2 p-2 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                            selectedCover === coverOptions.aiCover ? 'border-[#2777df] bg-blue-50/20 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                            <img src={coverOptions.aiCover} alt="Générée par IA" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white text-[8px] font-bold rounded-full">IA Créative</span>
                          </div>
                          <span className="text-[10px] font-black text-gray-700 text-center">Modèle numérique</span>
                          {selectedCover === coverOptions.aiCover && (
                            <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white rounded-full p-0.5">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-2 flex flex-col items-center justify-center bg-gray-50 text-center opacity-60">
                          <svg className="h-5 w-5 text-gray-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          <span className="text-[9px] font-bold text-gray-400">{coverOptions ? "Modèle IA" : "Génération IA..."}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {aiBusy && (
                <div className="mt-3 p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-[#2777df] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-[#2777df]">{aiStep}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Titre *</label>
              <input value={form.title} onChange={update('title')} required placeholder="Ex: Livres math 3ème année" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
              {aiBusy && <div className="mt-1 h-3 w-24 bg-gray-200 rounded animate-pulse"></div>}
            </div>

            {/* Author + ISBN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Auteur</label>
                <input value={form.author} onChange={update('author')} placeholder="Ex: Sami Ben Ali" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">ISBN (optionnel)</label>
                <input value={form.isbn} onChange={update('isbn')} placeholder="Ex: 978-9973-19-000-2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
              <textarea value={form.description} onChange={update('description')} rows={4} placeholder="Décrivez l'état du livre, l'année d'édition, les informations utiles..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all resize-none" />
            </div>

            {/* Subject + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Matière *</label>
                <select value={form.subject} onChange={update('subject')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all">
                  <option value="">Sélectionnez</option>
                  {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Niveau *</label>
                <select value={form.level} onChange={update('level')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all">
                  <option value="">Sélectionnez</option>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Type + Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type *</label>
                <select value={form.type} onChange={update('type')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all">
                  <option value="vente">Vente</option>
                  <option value="échange">Échange</option>
                  <option value="don">Don</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">État *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Neuf', 'Bon état', 'Usagé'].map(etat => (
                    <label key={etat} className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition-all ${form.condition === etat ? 'border-[#2777df] bg-[#2777df]/5 shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                      <input type="radio" name="condition" value={etat} checked={form.condition === etat} onChange={update('condition')} className="hidden" />
                      <span className={`text-[10px] sm:text-xs font-bold ${form.condition === etat ? 'text-[#2777df]' : 'text-gray-500'}`}>{etat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Price + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Prix</label>
                <input value={form.price} onChange={update('price')} placeholder="Ex: 20 DT" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" disabled={form.type === 'don'} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Wilaya *</label>
                <select value={form.location} onChange={update('location')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all">
                  <option value="">Sélectionnez une wilaya</option>
                  {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-300 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#2777df]/20 active:scale-[0.98] flex items-center justify-center gap-2">
                {uploading ? 'Upload des images...' : submitting ? 'Publication...' : "Publier l'offre"}
              </button>
              <button type="button" onClick={() => window.location.hash = '#my-offers'} className="px-6 py-3 border border-gray-200 text-gray-500 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-all">Annuler</button>
            </div>
          </div>
        </form>
      </div>
    </FeedLayout>
  );
}
