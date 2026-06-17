import React, { useState, useEffect } from 'react';
import { FeedLayout } from '../layouts/SharedLayout';
import { bookAPI, getUser } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MATIERES = [
  'Mathématiques', 'Physique', 'Chimie', 'Sciences', 'Français',
  'Anglais', 'Arabe', 'Histoire', 'Géographie', 'Philosophie',
  'Informatique', 'Comptabilité', 'Économie', 'Sport', 'Musique',
  'Arts plastiques', 'Autre',
];

const WILAYA_COORDS = {
  'Ariana': [36.8665, 10.1647], 'Béja': [36.7333, 9.1833], 'Ben Arous': [36.7531, 10.2189],
  'Bizerte': [37.2744, 9.8739], 'Gabès': [33.8815, 10.0982], 'Gafsa': [34.425, 8.7842],
  'Jendouba': [36.5011, 8.7808], 'Kairouan': [35.6781, 10.1003], 'Kasserine': [35.1678, 8.8333],
  'Kébili': [33.705, 8.9653], 'Le Kef': [36.1825, 8.7147], 'Mahdia': [35.5047, 11.0622],
  'La Manouba': [36.8083, 10.1000], 'Médenine': [33.3547, 10.5053], 'Monastir': [35.7781, 10.8261],
  'Nabeul': [36.4514, 10.7375], 'Sfax': [34.7400, 10.7600], 'Sidi Bouzid': [35.0383, 9.4847],
  'Siliana': [36.0833, 9.3667], 'Sousse': [35.8256, 10.6364], 'Tataouine': [32.9333, 10.4500],
  'Tozeur': [33.9183, 8.1333], 'Tunis': [36.8065, 10.1815], 'Zaghouan': [36.4028, 10.1433],
};

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const iconMap = {
  vente: L.divIcon({
    className: '',
    html: '<div style="background:#2777df;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:900;white-space:nowrap;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)">Vente</div>',
    iconSize: [60, 28],
    iconAnchor: [30, 28],
  }),
  échange: L.divIcon({
    className: '',
    html: '<div style="background:#fc4d16;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:900;white-space:nowrap;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)">Échange</div>',
    iconSize: [68, 28],
    iconAnchor: [34, 28],
  }),
  don: L.divIcon({
    className: '',
    html: '<div style="background:#10b981;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:900;white-space:nowrap;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)">Don</div>',
    iconSize: [50, 28],
    iconAnchor: [25, 28],
  }),
};

const tunisiaCenter = [34.74, 10.76];

export default function MapPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterRadius, setFilterRadius] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const user = getUser();
  const isSubscribed = user?.subscriptionActive;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const limit = isSubscribed ? 200 : 5;
        const res = await bookAPI.getAll({ limit });
        setBooks(res.data || []);
      } catch (_) {
        setError('Erreur lors du chargement de la carte');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = [...books];

    if (filterType !== 'tous') {
      result = result.filter(b => b.type === filterType);
    }

    if (filterSubject) {
      result = result.filter(b => b.subject === filterSubject);
    }

    if (userLocation) {
      result = result.filter(b => {
        const coords = getBookCoords(b);
        if (!coords) return false;
        const d = haversineDistance(userLocation.lat, userLocation.lng, coords[0], coords[1]);
        return d <= filterRadius;
      });
    }

    setFilteredBooks(result);
  }, [books, filterType, filterSubject, filterRadius, userLocation]);

  function getBookCoords(book) {
    const wilayaStr = book.user?.wilaya || book.location || '';
    const coords = WILAYA_COORDS[wilayaStr];
    if (coords) return coords;
    if (book.user?.location?.lat && book.user?.location?.lng) {
      return [book.user.location.lat, book.user.location.lng];
    }
    return null;
  }

  useEffect(() => {
    if (!filteredBooks.length) return;

    const map = L.map('map').setView(tunisiaCenter, 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const markers = [];
    filteredBooks.forEach(book => {
      const user = book.user;
      if (!user) return;
      const coords = getBookCoords(book);
      const lat = coords ? coords[0] : tunisiaCenter[0] + (Math.random() - 0.5) * 2;
      const lng = coords ? coords[1] : tunisiaCenter[1] + (Math.random() - 0.5) * 2;
      const icon = iconMap[book.type] || iconMap.vente;

      const imgUrl = book.images?.[0] || 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Livre';
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:200px">
          <a href="#offer-detail?id=${book._id}" style="display:block;height:100px;border-radius:8px;overflow:hidden;margin-bottom:6px;background:#f1f5f9">
            <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" alt="${book.title}" onerror="this.style.display='none'" />
          </a>
          <strong style="font-size:13px">${book.title}</strong>
          <p style="margin:4px 0;font-size:11px;color:#666">${book.subject || ''} ${book.level ? '• '+book.level : ''}</p>
          <p style="margin:4px 0;font-size:11px;color:#666">${user.wilaya || 'Wilaya inconnue'}</p>
          ${book.price ? `<p style="margin:4px 0;font-size:13px;font-weight:900;color:#2777df">${book.price}</p>` : ''}
          <a href="#offer-detail?id=${book._id}" style="display:inline-block;margin-top:6px;padding:4px 12px;background:#2777df;color:white;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;text-align:center">Consultez</a>
        </div>
      `);
      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => map.remove();
  }, [filteredBooks]);

  if (loading) {
    return (
      <FeedLayout active="Carte" title="Carte">
        <div className="text-center py-16 text-gray-400 font-bold">Chargement de la carte...</div>
      </FeedLayout>
    );
  }

  if (error) {
    return (
      <FeedLayout active="Carte" title="Carte">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout active="Carte" title="Carte des livres disponibles">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['tous', 'vente', 'échange', 'don'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterType === t ? 'bg-[#2777df] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {t === 'tous' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Matière</label>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:border-[#2777df] transition-colors"
            >
              <option value="">Toutes</option>
              {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Rayon: {filterRadius} km</label>
            <div className="flex items-center gap-2">
              <input type="range" min="5" max="200" value={filterRadius} onChange={e => setFilterRadius(Number(e.target.value))}
                className="flex-1 accent-[#2777df]"
              />
              <button onClick={() => navigator.geolocation.getCurrentPosition(p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }))}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${userLocation ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-[#2777df]'}`}
              >
                {userLocation ? '✓ Localisé' : 'Me localiser'}
              </button>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-bold">{filteredBooks.length} livre(s) sur la carte</p>
        {!isSubscribed && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-amber-800">Accès limité</p>
              <p className="text-[10px] text-amber-600 font-medium">Abonnez-vous pour voir tous les livres</p>
            </div>
            <a href="#pricing" className="px-4 py-2 bg-[#2777df] text-white rounded-xl text-[10px] font-black hover:bg-[#185db4] transition-all">Voir les offres</a>
          </div>
        )}
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
        <div id="map" className="w-full h-full" />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {filteredBooks.length} livres disponibles • Cliquez sur un marqueur pour voir les détails
      </p>
    </FeedLayout>
  );
}
