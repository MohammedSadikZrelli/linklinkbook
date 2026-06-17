const CART_KEY = 'linkbook_cart';
const COUNT_KEY = 'linkbook_cart_count';

function broadcast() {
  const count = cartAPI.get().length;
  localStorage.setItem(COUNT_KEY, String(count));
  window.dispatchEvent(new CustomEvent('linkbook:cartchange', { detail: { count } }));
}

export const cartAPI = {
  get: () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  add: (bookId) => {
    const cart = cartAPI.get();
    if (!cart.includes(bookId)) {
      cart.push(bookId);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    broadcast();
    return cart;
  },
  remove: (bookId) => {
    const cart = cartAPI.get().filter(id => id !== bookId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    broadcast();
    return cart;
  },
  clear: () => {
    localStorage.removeItem(CART_KEY);
    broadcast();
    return [];
  },
  count: () => cartAPI.get().length,
  has: (bookId) => cartAPI.get().includes(bookId),
};
