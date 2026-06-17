const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linkbook';
    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Update MONGO_URI in server/.env with your MongoDB Atlas connection string.');
    // Don't exit — let server stay alive so you can see the error
  }
};

module.exports = connectDB;
