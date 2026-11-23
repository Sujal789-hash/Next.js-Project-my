'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import SocialAccountModal from './SocialAccountModal';

// Official SVG icons for high fidelity
export function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function SocialLoginButtons({ role = 'startup', onError, dividerText = 'Or continue with email' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [activeModalProvider, setActiveModalProvider] = useState(null);

  // Directly initiate official OAuth 2.0 redirect
  const handleOAuthLogin = (providerId) => {
    setLoadingProvider(providerId);
    if (onError) onError('');

    const fromPath = pathname || '/login';
    const oauthEndpoint = `/api/auth/oauth/${providerId}?role=${encodeURIComponent(role)}&from=${encodeURIComponent(fromPath)}`;
    window.location.href = oauthEndpoint;
  };

  // Fallback demo account selection for sandbox testing without external API keys
  const handleAccountSelected = async (accountData) => {
    const { provider, role: chosenRole, fullName, email, avatar } = accountData;
    setLoadingProvider(provider);
    if (onError) onError('');

    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          role: chosenRole || role,
          fullName,
          email,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to sign in with ${provider}`);
      }

      setActiveModalProvider(null);

      const userRole = data.user.role;
      if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (userRole === 'investor') {
        router.push('/dashboard/investor');
      } else {
        router.push('/dashboard/founder');
      }
    } catch (err) {
      if (onError) {
        onError(err.message || 'Social authentication failed. Please try again.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: GoogleIcon,
      hoverBorder: 'hover:border-red-200 hover:bg-red-50/30',
      activeColor: 'text-[#4285F4]',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: GithubIcon,
      hoverBorder: 'hover:border-gray-400 hover:bg-gray-50',
      activeColor: 'text-charcoal',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FacebookIcon,
      hoverBorder: 'hover:border-blue-200 hover:bg-blue-50/30',
      activeColor: 'text-[#1877F2]',
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* 3 Direct Official OAuth 2.0 Login Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {providers.map((p) => {
          const Icon = p.icon;
          const isLoading = loadingProvider === p.id;
          const isDisabled = loadingProvider !== null;

          return (
            <button
              key={p.id}
              type="button"
              disabled={isDisabled}
              onClick={() => handleOAuthLogin(p.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-sage/80 bg-white shadow-sm text-xs font-semibold text-charcoal transition-all duration-200 ${p.hoverBorder} hover:shadow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait`}
              title={`Direct OAuth 2.0 Sign in with ${p.name}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-forest" />
              ) : (
                <Icon className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden sm:inline font-medium">{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Styled divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-sage/60"></div>
        <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
          {dividerText}
        </span>
      </div>

      {/* Optional fallback account chooser for local development testing */}
      <SocialAccountModal
        isOpen={Boolean(activeModalProvider)}
        provider={activeModalProvider}
        defaultRole={role}
        loading={Boolean(loadingProvider)}
        onClose={() => setActiveModalProvider(null)}
        onSelectAccount={handleAccountSelected}
      />
    </div>
  );
}
