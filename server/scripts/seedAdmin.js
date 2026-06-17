require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@linkbook.tn';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.isPro = true;
    existing.subscriptionActive = true;
    await existing.save();
    console.log(`Admin updated: ${email}`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      name: 'Admin',
      email,
      phone: '',
      password: hashedPassword,
      role: 'admin',
      isPro: true,
      subscriptionActive: true,
      emailVerified: true,
    });
    console.log(`Admin created: ${email} / ${password}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});