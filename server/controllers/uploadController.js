const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname).toLowerCase();
    if (['.jfif', '.jfi', '.jpe', '.jif'].includes(ext)) ext = '.jpg';
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadImages = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucune image fournie' });
  }

  const protocol = req.protocol;
  const host = req.get('host');

  const urls = req.files.map(f => `${protocol}://${host}/uploads/${f.filename}`);
  res.status(200).json({ success: true, data: urls });
};

module.exports = { upload, uploadImages };
