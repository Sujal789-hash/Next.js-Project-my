import mongoose from 'mongoose';

// Dedicated cache key so this connection is never confused with another helper.
const CACHE_KEY = '__pitchconnect_mongoose__';
const SELECTION_TIMEOUT_DEV_MS = 5000;
const SELECTION_TIMEOUT_PROD_MS = 7000;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured. Set it in the environment before starting the application.');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    /^mongodb:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(uri)
  ) {
    throw new Error('MONGODB_URI must not point to localhost in production.');
  }

  return uri;
}

let cached = global[CACHE_KEY];

if (!cached) {
  cached = global[CACHE_KEY] = { conn: null, promise: null };
}

/**
 * Cached Mongoose connection suitable for Vercel serverless functions.
 * Connection failures are surfaced to callers instead of returning null.
 */
async function connectDB() {
  if (cached.conn && cached.conn.connection && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS:
        process.env.NODE_ENV === 'production' ? SELECTION_TIMEOUT_PROD_MS : SELECTION_TIMEOUT_DEV_MS,
      maxPoolSize: 10,
      minPoolSize: 0,
    };

    cached.promise = mongoose.connect(getMongoUri(), opts)
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        // Log only error metadata; never log the connection string.
        console.error(
          '[PitchConnect] MongoDB connection failed:',
          err && err.name ? err.name : 'UnknownError',
          err && err.code ? `code=${err.code}` : ''
        );
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
