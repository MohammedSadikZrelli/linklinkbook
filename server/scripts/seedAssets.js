require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Asset = require('../models/Asset');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

async function seedAssets() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linkbook';
  console.log(`Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected.\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );

  console.log(`Found ${files.length} images in ${IMAGES_DIR}\n`);

  let seeded = 0;
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const mimeType = MIME_MAP[ext] || 'image/jpeg';

    let data;
    try {
      data = await sharp(filePath)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (err) {
      console.error(`  ✗ ${file} — sharp error: ${err.message}`);
      continue;
    }

    await Asset.findOneAndUpdate(
      { filename: file },
      {
        filename: file,
        originalName: file,
        mimeType,
        data,
        size: data.length,
        category: file.startsWith('d59019ab') ? 'logo' : 'general',
      },
      { upsert: true }
    );
    console.log(`  ✓ ${file} (${(data.length / 1024).toFixed(1)} KB)`);
    seeded++;
  }

  console.log(`\n✅ Successfully seeded ${seeded} asset(s) into MongoDB.`);
  await mongoose.disconnect();
  console.log('Disconnected.');
}

seedAssets().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
