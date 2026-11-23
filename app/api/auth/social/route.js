import { NextResponse } from 'next/server';
import { hashPassword, signJwtToken } from '@/lib/auth';
import { findUserByEmail, createUser, upsertStartup, upsertInvestor } from '@/lib/dataService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider, role = 'startup', email: customEmail, fullName: customName, avatar: customAvatar } = body;

    const allowedProviders = ['google', 'github', 'facebook'];
    if (!allowedProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, message: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Provider profiles defaults
    const providerDefaults = {
      google: {
        name: 'Alex Rivera (Google)',
        email: 'alex.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: '+1 415 555 0192',
      },
      github: {
        name: 'Jordan Tech (GitHub)',
        email: 'jordan.tech@github.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        phone: '+1 415 555 0184',
      },
      facebook: {
        name: 'Taylor Morgan (Facebook)',
        email: 'taylor.morgan@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        phone: '+1 415 555 0176',
      },
    };

    const config = providerDefaults[provider];
    const email = (customEmail || config.email).toLowerCase().trim();
    const fullName = customName || config.name;
    const avatar = customAvatar || config.avatar;
    const phone = config.phone;

    // Check if user already exists
    let user = await findUserByEmail(email);

    if (!user) {
      // Create user
      const passwordHash = await hashPassword(`social_secret_${provider}_${Date.now()}`);
      user = await createUser({
        fullName,
        email,
        phone,
        password: passwordHash,
        role: role || 'startup',
        avatar,
        isVerified: true,
        status: 'active',
      });

      // Auto-initialize profile for new users based on role
      if (user.role === 'startup') {
        try {
          await upsertStartup(user._id, {
            startupName: `${fullName.split(' ')[0]} Labs`,
            founderName: fullName,
            industry: 'Artificial Intelligence',
            description: `Innovative deep-tech venture founded by ${fullName}. Authenticated via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
            website: `https://${provider}.com`,
            location: 'San Francisco, CA',
            foundedYear: 2024,
            teamSize: '5-10',
            startupStage: 'Seed',
            businessModel: 'B2B SaaS',
            targetAudience: 'Enterprise and High-Growth Tech Companies',
            fundingRequired: 1500000,
            currentValuation: 8000000,
            logo: avatar,
          });
        } catch (e) {
          console.warn('Could not auto-create startup profile:', e.message);
        }
      } else if (user.role === 'investor') {
        try {
          await upsertInvestor(user._id, {
            fullName,
            organization: `${fullName.split(' ')[0]} Ventures`,
            title: 'Managing General Partner',
            biography: `Accredited venture investor specializing in seed and Series A tech startups. Direct authentication via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
            location: 'San Francisco, CA',
            checkSizeMin: 50000,
            checkSizeMax: 500000,
            avatar,
          });
        } catch (e) {
          console.warn('Could not auto-create investor profile:', e.message);
        }
      }
    }

    // Sign JWT token
    const token = signJwtToken({
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      message: `Signed in successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during social authentication' },
      { status: 500 }
    );
  }
}
