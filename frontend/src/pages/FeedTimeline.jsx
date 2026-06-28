import React, { useState, useEffect } from 'react';
import { FeedLayout, CategoryFilter, OfferCard } from '../layouts/SharedLayout';

const API_BASE = 'http://localhost:5000/api';

export default function FeedTimeline() {
  const [cat, setCat] = useState('Tout');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/books?limit=20`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setBooks(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cat === 'Tout' ? books : books.filter(b => {
    if (cat === 'Étudiant') return b.level?.toLowerCase().includes('bac') || b.level?.toLowerCase().includes('lycée') || b.level?.toLowerCase().includes('prépa');
    if (cat === 'Université') return b.level?.toLowerCase().includes('univ') || b.level?.toLowerCase().includes('sup');
    return true;
  });

  return (
    <FeedLayout active="Fil d'actualité" title="Fil d'actualité :">
      <CategoryFilter active={cat} setActive={setCat} />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-200 rounded-full w-1/2" />
                <div className="h-4 bg-gray-200 rounded-full w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 text-gray-300">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900">Aucune annonce pour le moment</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Soyez le premier à publier une offre et rejoignez la communauté Linkbook.
          </p>
          <a
            href="#create-offer"
            className="btn-brand mt-6"
          >
            Créer une offre
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(book => (
            <OfferCard
              key={book._id}
              img={book.images?.[0] || '/images/3768ec8e8ce95737a750cad65a6be4ef.jpg'}
              title={book.title}
              desc={book.subject ? `${book.subject}${book.level ? ' - ' + book.level : ''}` : ''}
              price={book.price ? `${book.price} DT` : book.type === 'don' ? 'Gratuit' : book.type === 'échange' ? 'Échange' : '-'}
              location={book.location || book.user?.wilaya || ''}
              tag={book.type === 'don' ? 'Don' : book.type === 'échange' ? 'Échange' : 'Vente'}
              onAction={() => window.location.hash = `#offer-detail?id=${book._id}`}
            />
          ))}
        </div>
      )}
    </FeedLayout>
  );
}