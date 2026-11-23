import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getAppUrl,
  parseOAuthState,
  exchangeCodeForUser,
} from '@/lib/oauth';
import { hashPassword, signJwtToken } from '@/lib/auth';
import { findUserByEmail, createUser, upsertStartup, upsertInvestor } from '@/lib/dataService';

export async function GET(request, { params }) {
  try {
    const { provider } = params;
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle provider error (e.g. user cancelled on provider screen)
    if (errorParam) {
      const msg = errorDescription || errorParam;
      return NextResponse.redirect(
        new URL(`/login?error=provider_error&message=${encodeURIComponent(msg)}&provider=${provider}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/login?error=missing_code_or_state&provider=${provider}`, request.url)
      );
    }

    // Verify CSRF state against cookie
    const stateCookie = request.cookies.get('oauth_state')?.value;
    if (!stateCookie || stateCookie !== state) {
      return NextResponse.redirect(
        new URL(`/login?error=invalid_csrf_state&provider=${provider}`, request.url)
      );
    }

    const stateData = parseOAuthState(state);
    if (!stateData) {
      return NextResponse.redirect(
        new URL(`/login?error=expired_oauth_state&provider=${provider}`, request.url)
      );
    }

    const redirectUri = `${getAppUrl(request)}/api/auth/callback/${provider}`;

    // Exchange authorization code for user profile
    const profile = await exchangeCodeForUser(provider, code, redirectUri);

    // Look up existing user or register new user
    let user = await findUserByEmail(profile.email);

    if (!user) {
      const randomPasswordHash = await hashPassword(crypto.randomUUID());
      const chosenRole = stateData.role || 'startup';

      user = await createUser({
        fullName: profile.name,
        email: profile.email,
        phone: '',
        password: randomPasswordHash,
        role: chosenRole,
        avatar: profile.avatar,
        isVerified: chosenRole === 'admin',
        status: 'active',
      });

      // Auto-initialize role-specific profile in database
      if (user.role === 'startup') {
        try {
          await upsertStartup(user._id, {
            startupName: `${profile.name.split(' ')[0]}'s Startup`,
            founderName: profile.name,
            industry: 'Artificial Intelligence',
            description: `Technology venture founded by ${profile.name}. Authenticated via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
            website: '',
            location: 'San Francisco, CA',
            foundedYear: new Date().getFullYear(),
            teamSize: '1-10',
            startupStage: 'Seed',
            businessModel: 'B2B SaaS',
            targetAudience: 'Global Markets',
            fundingRequired: 1500000,
            currentValuation: 8000000,
            logo: profile.avatar,
          });
        } catch (e) {
          console.warn('Could not auto-create startup record:', e.message);
        }
      } else if (user.role === 'investor') {
        try {
          await upsertInvestor(user._id, {
            fullName: profile.name,
            organization: `${profile.name.split(' ')[0]} Ventures`,
            title: 'Managing General Partner',
            biography: `Accredited venture investor. Authenticated via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
            location: 'San Francisco, CA',
            checkSizeMin: 50000,
            checkSizeMax: 500000,
            avatar: profile.avatar,
          });
        } catch (e) {
          console.warn('Could not auto-create investor record:', e.message);
        }
      }
    }

    // Issue JWT session token matching existing PitchConnect auth system
    const token = signJwtToken({
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    // Select dashboard based on user role
    let destination = '/dashboard/founder';
    if (user.role === 'admin') {
      destination = '/dashboard/admin';
    } else if (user.role === 'investor') {
      destination = '/dashboard/investor';
    }

    const response = NextResponse.redirect(new URL(destination, request.url));

    // Set secure HTTP-only session cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Clear state cookie
    response.cookies.set('oauth_state', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=oauth_callback_failed&message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
