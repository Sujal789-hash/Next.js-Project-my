import { NextResponse } from 'next/server';

/**
 * HTTP seeding is disabled. Seeding is a local-only administrative task:
 * run `npm run seed` with PITCHCONNECT_ALLOW_SEED=1 against a development
 * database. That script never deletes collections and only inserts missing
 * records with valid ObjectIds.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Seeding is disabled over HTTP. Use the local-only seed script in a development environment.',
    },
    { status: 404 }
  );
}
