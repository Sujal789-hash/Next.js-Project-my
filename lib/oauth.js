import crypto from 'crypto';

/**
 * Returns the public application URL dynamically based on request or env
 */
export function getAppUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  if (request) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (host) {
      return `${proto}://${host}`;
    }
  }

  return 'http://localhost:3000';
}

/**
 * Checks whether credentials for a given provider are configured
 */
export function isProviderConfigured(provider) {
  if (provider === 'google') {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === 'github') {
    return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  }
  if (provider === 'facebook') {
    return Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET);
  }
  return false;
}

/**
 * Creates a signed state token containing role and caller context
 */
export function createOAuthState(role = 'startup', from = '/login') {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({
    nonce,
    role: ['startup', 'investor', 'admin'].includes(role) ? role : 'startup',
    from: from || '/login',
    t: Date.now(),
  });
  return Buffer.from(payload).toString('base64url');
}

/**
 * Parses and validates the state token
 */
export function parseOAuthState(stateStr) {
  try {
    const raw = Buffer.from(stateStr, 'base64url').toString('utf8');
    const data = JSON.parse(raw);
    // Expire after 15 minutes
    if (Date.now() - data.t > 15 * 60 * 1000) {
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Builds the official authorization URL for each provider
 */
export function buildAuthorizationUrl(provider, state, redirectUri) {
  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  if (provider === 'github') {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
      prompt: 'select_account',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  if (provider === 'facebook') {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'email,public_profile',
      state,
      auth_type: 'rerequest',
      response_type: 'code',
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Exchanges authorization code for provider user profile
 */
export async function exchangeCodeForUser(provider, code, redirectUri) {
  if (provider === 'google') {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code');
    }

    // 2. Fetch Google profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.email) {
      throw new Error('Failed to retrieve Google profile information');
    }

    return {
      provider: 'google',
      providerId: profile.sub,
      email: profile.email.toLowerCase().trim(),
      name: profile.name || profile.given_name || 'Google User',
      avatar: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'G')}&background=EA4335&color=fff`,
    };
  }

  if (provider === 'github') {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || '',
        client_secret: process.env.GITHUB_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code');
    }

    // 2. Fetch GitHub user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'PitchConnect-OAuth-App',
      },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error('Failed to retrieve GitHub profile information');
    }

    // 3. GitHub users might keep email private; fetch from emails endpoint
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'PitchConnect-OAuth-App',
        },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      email = `${profile.login}@users.noreply.github.com`;
    }

    return {
      provider: 'github',
      providerId: String(profile.id),
      email: email.toLowerCase().trim(),
      name: profile.name || profile.login || 'GitHub User',
      avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.login || 'GH')}&background=24292e&color=fff`,
    };
  }

  if (provider === 'facebook') {
    // 1. Exchange code for Facebook token
    const tokenParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID || '',
      client_secret: process.env.FACEBOOK_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`);
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      const errMessage = tokenData.error?.message || 'Failed to exchange Facebook authorization code';
      throw new Error(errMessage);
    }

    // 2. Fetch Facebook profile
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${tokenData.access_token}`
    );

    const profile = await profileRes.json();
    if (!profileRes.ok) {
      throw new Error(profile.error?.message || 'Failed to retrieve Facebook profile');
    }

    const email = profile.email || `${profile.id}@facebook.pitchconnect.com`;
    const avatar = profile.picture?.data?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'FB')}&background=1877F2&color=fff`;

    return {
      provider: 'facebook',
      providerId: profile.id,
      email: email.toLowerCase().trim(),
      name: profile.name || 'Facebook User',
      avatar,
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
