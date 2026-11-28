#!/usr/bin/env node
/*
 * ONE-TIME ADMIN BOOTSTRAP — TERMINAL ONLY
 *
 * Creates the first admin account for a production database. There is
 * deliberately NO HTTP endpoint and NO public-registration path for admins.
 *
 * Safety properties:
 *  - Requires explicit env opt-in (ADMIN_BOOTSTRAP=1).
 *  - Requires the operator to confirm the exact target database name, which
 *    is read from MONGODB_URI, so the script cannot silently hit the wrong DB.
 *  - Refuses to run if any admin already exists (strictly one-time).
 *  - Refuses to modify an existing email account.
 *  - Uses $setOnInsert only: no deletes, drops, updates to existing records.
 *  - Uses the real models/User.js Mongoose model (compiled with Next's own
 *    SWC compiler) and the existing lib/password.js bcrypt helper.
 *  - Never prints the URI or the password.
 *
 * See docs/admin-bootstrap.md for the exact command and required variables.
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const mongoose = require('mongoose');
const { z } = require('zod');
const { transformSync } = require('next/dist/build/swc');

function fail(message) {
  console.error(`[admin-bootstrap] ${message}`);
  process.exit(1);
}

/** Load the existing ESM User model without duplicating its schema. */
function loadExistingUserModel() {
  const modelPath = path.resolve(__dirname, '..', 'models', 'User.js');
  const source = fs.readFileSync(modelPath, 'utf8');
  const { code } = transformSync(source, {
    filename: modelPath,
    jsc: { parser: { syntax: 'ecmascript' }, target: 'es2017' },
    module: { type: 'commonjs' },
  });

  const compiled = new Module(modelPath, module);
  compiled.filename = modelPath;
  compiled.paths = Module._nodeModulePaths(path.dirname(modelPath));
  compiled._compile(code, modelPath);

  const User = compiled.exports.default || compiled.exports;
  if (!User || !User.schema || User.modelName !== 'User') {
    throw new Error('Could not load the existing User model from models/User.js');
  }
  return User;
}

// ---------------------------------------------------------------------------
// 1. Explicit opt-in
// ---------------------------------------------------------------------------
if (process.env.ADMIN_BOOTSTRAP !== '1') {
  fail('Set ADMIN_BOOTSTRAP=1 to confirm this one-time operation.');
}

// ---------------------------------------------------------------------------
// 2. Target database confirmation (prevents operating on the wrong database)
// ---------------------------------------------------------------------------
const rawUri = process.env.MONGODB_URI;
if (!rawUri) fail('MONGODB_URI is required.');

let parsedUri;
try {
  parsedUri = new URL(rawUri);
} catch (err) {
  fail('MONGODB_URI could not be parsed.');
}

if (!['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol)) {
  fail('MONGODB_URI must use mongodb:// or mongodb+srv://.');
}

const dbName = decodeURIComponent(parsedUri.pathname.replace(/^\//, '').split('/')[0]);
if (!dbName) {
  fail('MONGODB_URI must include an explicit database name (never rely on the default).');
}

if (process.env.ADMIN_BOOTSTRAP_CONFIRM_DB !== dbName) {
  fail(
    `ADMIN_BOOTSTRAP_CONFIRM_DB must exactly match the database in MONGODB_URI. ` +
      `Expected value: "${dbName}". No database connection was made.`
  );
}

// ---------------------------------------------------------------------------
// 3. Input validation
// ---------------------------------------------------------------------------
const inputSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Email must be valid'),
  phone: z.string().trim().max(20).default(''),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

const validation = inputSchema.safeParse({
  fullName: process.env.ADMIN_BOOTSTRAP_FULL_NAME,
  email: process.env.ADMIN_BOOTSTRAP_EMAIL,
  phone: process.env.ADMIN_BOOTSTRAP_PHONE || '',
  password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
});

if (!validation.success) {
  const problems = validation.error.issues
    .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
    .join('; ');
  fail(`Invalid bootstrap input — ${problems}`);
}

const input = validation.data;
const dryRun = process.env.ADMIN_BOOTSTRAP_DRY_RUN === '1';

// ---------------------------------------------------------------------------
// 4. Non-destructive, one-time creation
// ---------------------------------------------------------------------------
async function main() {
  const { hashPassword } = require('../lib/password');
  const User = loadExistingUserModel();

  await mongoose.connect(rawUri, { serverSelectionTimeoutMS: 10000 });
  await User.init(); // ensures the unique email index exists

  try {
    const existingAdmin = await User.findOne({ role: 'admin' }).lean();
    if (existingAdmin) {
      console.log(
        '[admin-bootstrap] An admin account already exists. Nothing was changed.'
      );
      return;
    }

    const existingEmail = await User.findOne({ email: input.email }).lean();
    if (existingEmail) {
      fail(
        `An account with that email already exists (role: ${existingEmail.role}). ` +
          'Refusing to modify an existing record.'
      );
    }

    if (dryRun) {
      console.log(
        `[admin-bootstrap] Dry run complete for database "${dbName}". No changes were made.`
      );
      return;
    }

    const hashedPassword = await hashPassword(input.password);
    const created = await User.findOneAndUpdate(
      { email: input.email },
      {
        $setOnInsert: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(input.fullName)}&background=145A46&color=ffffff`,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    console.log(
      `[admin-bootstrap] Admin created in database "${dbName}" for ${created.email} (role: ${created.role}).`
    );
    console.log(
      '[admin-bootstrap] Sign in through the normal application login to receive a JWT. ' +
        'No token or password was printed.'
    );
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error(
    '[admin-bootstrap] Failed:',
    err && err.name ? err.name : 'UnknownError',
    err && err.code ? `code=${err.code}` : ''
  );
  process.exitCode = 1;
});
