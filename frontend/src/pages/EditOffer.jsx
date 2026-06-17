import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, uploadAPI } from '../services/api';
import { enhanceImage, analyzeBookImage } from '../services/imageAI';

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

const ETATS = ['Neuf', 'Bon état', 'Usagé'];

const WILAYAS = ['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 'Médenine',
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
  'Tozeur', 'Tunis', 'Zaghouan'];

export default function EditOffer({ query }) {
  const [form, setForm] = useState({ title: '', author: '', isbn: '', subject: '', level: '', condition: '', type: 'vente', price: '', description: '', location: '' });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [coverOptions, setCoverOptions] = useState(null);
  const [selectedCover, setSelectedCover] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStep, setAiStep] = useState('');

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const runAI = async () => {
    const imgUrl = existingImages[0];
    if (!imgUrl) return;
    setAiBusy(true);
    setError('');
    try {
      setAiStep('Téléchargement de l\'image...');
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], 'book.jpg', { type: blob.type || 'image/jpeg' });

      setAiStep('Amélioration et analyse par Vision IA...');
      const result = await analyzeBookImage(file);

      // Set cover options
      setCoverOptions({
        enhanced: result.enhanced,
        officialCover: result.officialCover,
        aiCover: result.aiCover
      });

      // Default selection is the sharp-enhanced cover photo
      setSelectedCover(result.enhanced);

      setAiStep('Pré-remplissage du formulaire...');
      await new Promise(r => setTimeout(r, 400));

      const meta = result.metadata;
      setForm(prev => ({
        ...prev,
        title: meta.title || prev.title,
        author: meta.author || prev.author,
        subject: meta.subject || prev.subject,
        level: meta.level || prev.level,
        isbn: meta.isbn || prev.isbn,
        description: meta.description || prev.description,
      }));

      setAiStep('');
    } catch (err) {
      setError('Erreur IA : ' + err.message);
    } finally {
      setAiBusy(false);
    }
  };

  useEffect(() => {
    if (!query?.id) { setError('Aucun livre spécifié'); setLoading(false); return; }
    const fetch = async () => {
      try {
        const res = await bookAPI.getById(query.id);
        const b = res.data;
        setForm({
          title: b.title || '',
          author: b.author || '',
          isbn: b.isbn || '',
          subject: b.subject || '',
          level: b.level || '',
          condition: b.condition || '',
          type: b.type || 'vente',
          price: b.price || '',
          description: b.description || '',
          location: b.location || b.user?.wilaya || '',
        });
        setExistingImages(b.images || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [query?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let imageUrls = [];

      // 1. Cover image resolution:
      // If we selected a cover from the AI options, it should replace the first existing image.
      if (selectedCover) {
        imageUrls.push(selectedCover);
        imageUrls = [...imageUrls, ...existingImages.slice(1)];
      } else {
        imageUrls = [...existingImages];
      }

      // 2. Upload any new additional images
      if (images.length > 0) {
        setUploading(true);
        const uploadRes = await uploadAPI.upload(images);
        imageUrls = [...imageUrls, ...uploadRes.data];
        setUploading(false);
      }

      await bookAPI.update(query.id, {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        subject: form.subject,
        level: form.level,
        condition: form.condition,
        price: form.type === 'don' ? '' : form.price,
        type: form.type,
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

  if (loading) {
    return (
      <FeedLayout active="Mes offres" title="Modifier l'offre">
        <div className="text-center py-16 text-gray-400 font-bold">Chargement...</div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout active="Mes offres" title="Modifier l'offre">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
            {existingImages.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Photos actuelles</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {existingImages.map((url, i) => {
                    const isCover = i === 0 && selectedCover;
                    const src = isCover ? selectedCover : url;
                    return (
                      <div key={i} className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 relative group">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        {isCover && (
                          <span className="absolute bottom-0.5 left-0.5 px-1 bg-emerald-500 text-white text-[8px] font-bold rounded">IA</span>
                        )}
                        <button type="button" onClick={() => {
                          setExistingImages(existingImages.filter((_, j) => j !== i));
                          if (i === 0) {
                            setCoverOptions(null);
                            setSelectedCover('');
                          }
                        }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">×</button>
                      </div>
                    );
                  })}
                </div>

                {existingImages.length > 0 && !aiBusy && !coverOptions && (
                  <button type="button" onClick={runAI} className="mt-2 w-full py-2 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    🪄 Améliorer & Analyser la couverture avec IA
                  </button>
                )}

                {coverOptions && !aiBusy && (
                  <div className="mt-3 space-y-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs font-bold text-emerald-700">Livre analysé avec succès ✓</span>
                      <button type="button" onClick={runAI} className="ml-auto text-xs font-bold text-[#2777df] hover:underline">Réanalyser</button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider">
                        Sélectionnez la couverture finale
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {/* 1. Enhanced photo */}
                        <div 
                          onClick={() => setSelectedCover(coverOptions.enhanced)}
                          className={`cursor-pointer rounded-2xl border-2 p-1.5 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                            selectedCover === coverOptions.enhanced ? 'border-[#2777df] bg-blue-50/20 shadow-sm scale-[1.01]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-1 relative">
                            <img src={coverOptions.enhanced} alt="Photo améliorée" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-[#2777df] text-white text-[7px] font-bold rounded">Photo IA</span>
                          </div>
                          <span className="text-[9px] font-black text-gray-700 text-center">Photo optimisée</span>
                          {selectedCover === coverOptions.enhanced && (
                            <span className="absolute top-1 right-1 bg-[#2777df] text-white rounded-full p-0.5">
                              <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                          )}
                        </div>

                        {/* 2. Official Cover */}
                        {coverOptions.officialCover ? (
                          <div 
                            onClick={() => setSelectedCover(coverOptions.officialCover)}
                            className={`cursor-pointer rounded-2xl border-2 p-1.5 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                              selectedCover === coverOptions.officialCover ? 'border-[#2777df] bg-blue-50/20 shadow-sm scale-[1.01]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-1 relative">
                              <img src={coverOptions.officialCover} alt="Couverture officielle" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-bold rounded">Officielle</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-700 text-center">Officielle</span>
                            {selectedCover === coverOptions.officialCover && (
                              <span className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-gray-200 p-1.5 flex flex-col items-center justify-center bg-gray-50 text-center opacity-60">
                            <svg className="h-4 w-4 text-gray-300 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-[8px] font-bold text-gray-400">Non trouvée sur le web</span>
                          </div>
                        )}

                        {/* 3. AI Generated Cover */}
                        <div 
                          onClick={() => setSelectedCover(coverOptions.aiCover)}
                          className={`cursor-pointer rounded-2xl border-2 p-1.5 transition-all relative overflow-hidden flex flex-col items-center justify-between ${
                            selectedCover === coverOptions.aiCover ? 'border-[#2777df] bg-blue-50/20 shadow-sm scale-[1.01]' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-1 relative">
                            <img src={coverOptions.aiCover} alt="Générée par IA" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white text-[7px] font-bold rounded">IA Créative</span>
                          </div>
                          <span className="text-[9px] font-black text-gray-700 text-center">Modèle numérique</span>
                          {selectedCover === coverOptions.aiCover && (
                            <span className="absolute top-1 right-1 bg-gradient-to-r from-[#2777df] to-[#fc4d16] text-white rounded-full p-0.5">
                              <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aiBusy && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#2777df] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-[#2777df]">{aiStep}</span>
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Ajouter des photos</label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 hover:border-[#2777df] rounded-2xl cursor-pointer transition-colors bg-gray-50 hover:bg-[#2777df]/5 text-xs font-bold text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Ajouter
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages([...images, ...Array.from(e.target.files)])} />
              </label>
              {images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {images.map((f, i) => (
                    <div key={i} className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden relative group">
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Titre *</label>
              <input value={form.title} onChange={update('title')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Auteur</label>
              <input value={form.author} onChange={update('author')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">ISBN (optionnel)</label>
              <input value={form.isbn} onChange={update('isbn')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
              <textarea value={form.description} onChange={update('description')} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                      <span className={`text-xs font-bold ${form.condition === etat ? 'text-[#2777df]' : 'text-gray-500'}`}>{etat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Prix</label>
                <input value={form.price} onChange={update('price')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#2777df] focus:ring-4 focus:ring-blue-100 outline-none text-sm transition-all" disabled={form.type === 'don'} />
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

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#2777df] hover:bg-[#185db4] disabled:bg-blue-300 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#2777df]/20 active:scale-[0.98] flex items-center justify-center gap-2">
                {uploading ? 'Upload des images...' : submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
              <button type="button" onClick={() => window.location.hash = '#my-offers'} className="px-6 py-3 border border-gray-200 text-gray-500 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-all">Annuler</button>
            </div>
          </div>
        </form>
      </div>
    </FeedLayout>
  );
}
