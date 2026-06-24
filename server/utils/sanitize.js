const xss = require('xss');

const sanitize = (val) => {
  if (typeof val === 'string') return xss(val.trim());
  if (Array.isArray(val)) return val.map(sanitize);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = sanitize(v);
    return out;
  }
  return val;
};

const sanitizeFields = (obj, fields) => {
  fields.forEach(f => {
    if (obj[f] !== undefined) obj[f] = sanitize(obj[f]);
  });
  return obj;
};

module.exports = { sanitize, sanitizeFields };
