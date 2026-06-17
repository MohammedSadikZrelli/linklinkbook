const express = require('express');
const router = express.Router();
const { getAsset, getAllAssets } = require('../controllers/assetController');

router.get('/', getAllAssets);
router.get('/:filename', getAsset);

module.exports = router;
