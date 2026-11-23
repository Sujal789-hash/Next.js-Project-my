import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const redirectTarget = searchParams.get('redirect') || '/login';
  const response = NextResponse.redirect(new URL(redirectTarget, request.url));

  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}


