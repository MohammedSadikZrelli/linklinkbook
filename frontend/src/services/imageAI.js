import { getToken } from './api';

const API_BASE = 'http://localhost:5000/api';

/**
 * Sends a book cover photo to the backend for enhancement and AI analysis.
 * @param {File} file - The raw image file from file input or camera.
 * @returns {Promise<Object>} The enhanced image URLs, official cover URL, AI cover URL, and form metadata.
 */
export async function analyzeBookImage(file) {
  const token = getToken();
  const fd = new FormData();
  fd.append('image', file);

  const res = await fetch(`${API_BASE}/images/analyze`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Erreur lors de l\'analyse de l\'image');
  }

  return data.data;
}

/**
 * Deprecated: Enhancement is now performed server-side in a single call to analyzeBookImage.
 * Provided for backward compatibility.
 */
export async function enhanceImage(file) {
  return file;
}
