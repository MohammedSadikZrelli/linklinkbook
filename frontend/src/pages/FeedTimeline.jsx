import React, { useState, useEffect } from 'react';
import { FeedLayout, CategoryFilter, OfferCard } from '../layouts/SharedLayout';
import { assetURL } from '../services/api';

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
        <div className="text-center py-20 text-gray-400 font-bold">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold">Aucune annonce pour le moment</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(book => (
            <OfferCard
              key={book._id}
              img={book.images?.[0] || assetURL('3768ec8e8ce95737a750cad65a6be4ef.jpg')}
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