import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/authSchema';
import { comparePassword, signJwtToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/dataService';

// Demo shortcuts are local-development conveniences only.
// They are never active when NODE_ENV=production.
function getDevelopmentDemoCredentials() {
  if (process.env.NODE_ENV === 'production') return {};
  return {
    'admin@pitchconnect.com': 'admin123',
    'sarah.chen@zenithai.com': 'founder123',
    'david@emeraldventures.vc': 'investor123',
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Supports records that use either `password` (Mongoose) or `passwordHash`
    // (legacy local demo records).
    const storedHash = user.password || user.passwordHash;
    const isValid = await comparePassword(password, storedHash);

    const demoCredentials = getDevelopmentDemoCredentials();
    const isDevelopmentDemo = demoCredentials[email] === password;

    if (!isValid && !isDevelopmentDemo) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = signJwtToken({
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error.name || error.message || 'UnknownError');
    return NextResponse.json(
      { success: false, message: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
