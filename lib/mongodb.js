import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pitchconnect';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, lastFailure: 0 };
}

async function connectDB() {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // Prevent consecutive connection retry storms (20-second cooldown)
  const now = Date.now();
  if (!cached.conn && cached.lastFailure && now - cached.lastFailure < 20000) {
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 2000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((m) => {
        cached.lastFailure = 0;
        return m;
      })
      .catch((err) => {
        cached.lastFailure = Date.now();
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.lastFailure = Date.now();
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export default connectDB;

