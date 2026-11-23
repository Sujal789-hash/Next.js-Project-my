import { NextResponse } from 'next/server';
import {
  getAppUrl,
  isProviderConfigured,
  createOAuthState,
  buildAuthorizationUrl,
} from '@/lib/oauth';

export async function GET(request, { params }) {
  try {
    const { provider } = params;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'startup';
    const from = searchParams.get('from') || '/login';

    const validProviders = ['google', 'github', 'facebook'];
    if (!validProviders.includes(provider)) {
      return NextResponse.redirect(
        new URL(`${from}?error=unsupported_provider&provider=${provider}`, request.url)
      );
    }

    // Check if provider credentials are set in environment
    if (!isProviderConfigured(provider)) {
      console.warn(`[OAuth] Missing credentials for ${provider}. Please configure environment variables.`);
      return NextResponse.redirect(
        new URL(`${from}?error=missing_credentials&provider=${provider}`, request.url)
      );
    }

    // Generate secure CSRF state
    const state = createOAuthState(role, from);
    const redirectUri = `${getAppUrl(request)}/api/auth/callback/${provider}`;
    const authorizationUrl = buildAuthorizationUrl(provider, state, redirectUri);

    const response = NextResponse.redirect(authorizationUrl);

    // Save state in HTTP-only cookie for CSRF verification on callback
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=oauth_init_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
