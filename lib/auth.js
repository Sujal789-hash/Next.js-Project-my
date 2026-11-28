import jwt from 'jsonwebtoken';

// Reuse the exact hashing implementation from the local seed script.
const passwordUtils = require('./password');

export const hashPassword = passwordUtils.hashPassword;
export const comparePassword = passwordUtils.comparePassword;

/**
 * JWT secrets are never hardcoded. The app fails safely when one is missing.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Set it in the environment before starting the application.');
  }

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }

  return secret;
}

export function signJwtToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    // Includes invalid/expired tokens and missing server configuration.
    // Callers treat this as "no authenticated user", never as a fallback identity.
    return null;
  }
}

export function getTokenFromRequest(request) {
  // Check cookie first
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [k, ...v] = c.split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );

  if (cookies.token) {
    return cookies.token;
  }

  // Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyJwtToken(token);
}
