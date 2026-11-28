// Shared password hashing helpers used by both the app and the local seed script.
// This preserves the original bcryptjs implementation (salt rounds = 10).
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
}

module.exports = { hashPassword, comparePassword };
