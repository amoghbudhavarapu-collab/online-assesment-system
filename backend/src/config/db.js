const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;
let connectingPromise = null;

async function connectDB() {
  if (isConnected) return;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    const maxRetries = 5;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const conn = await mongoose.connect(env.MONGODB_URI, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000
        });
        isConnected = true;
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (error) {
        console.warn(`⚠️ MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (attempt < maxRetries) {
          const delay = attempt * 2000;
          console.log(`⏳ Retrying in ${delay / 1000}s...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.error('❌ All MongoDB connection attempts failed');
          throw error;
        }
      }
    }
  })();

  try {
    await connectingPromise;
  } finally {
    connectingPromise = null;
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

