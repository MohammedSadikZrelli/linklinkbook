const Asset = require('../models/Asset');

const getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ filename: req.params.filename });
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset non trouvé' });
    }
    res.set('Content-Type', asset.mimeType);
    res.set('Content-Length', asset.size);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(asset.data);
  } catch (error) {
    next(error);
  }
};

const getAllAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find(
      {},
      { filename: 1, originalName: 1, mimeType: 1, size: 1, category: 1, _id: 0 }
    ).sort({ filename: 1 });
    res.json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAsset, getAllAssets };
