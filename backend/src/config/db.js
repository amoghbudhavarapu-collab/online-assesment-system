const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn('👉 If MongoDB is not yet running locally, please start your local MongoDB service or set a MongoDB Atlas MONGODB_URI in backend/.env');
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error.message);
  }
}

function isDBReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  disconnectDB,
  isDBReady
};

