'use client';
import React, { useState } from 'react';
import { X, UserPlus, ArrowRight, Check, Shield, Loader2, Mail, User } from 'lucide-react';
import { GoogleIcon, GithubIcon, FacebookIcon } from './SocialLoginButtons';

export default function SocialAccountModal({
  isOpen,
  provider,
  defaultRole = 'startup',
  onClose,
  onSelectAccount,
  loading = false,
}) {
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !provider) return null;

  // Preset demo accounts for quick 1-click selection in real time
  const presetAccounts = {
    google: [
      {
        name: 'Sanjeev Singh',
        email: 'sanjeev.singh@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        badge: 'Personal',
      },
      {
        name: 'Sarah Chen (PitchConnect Founder)',
        email: 'sarah.chen@zenithai.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        badge: 'Work (Founder)',
      },
      {
        name: 'David Sterling (Venture Partner)',
        email: 'david@emeraldventures.vc',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        badge: 'Work (Investor)',
      },
    ],
    github: [
      {
        name: 'Sanjeev Singh',
        handle: '@sanjeevsingh',
        email: 'sanjeev.code@github.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        badge: 'GitHub Pro',
      },
      {
        name: 'Jordan Tech',
        handle: '@jordantech',
        email: 'jordan.tech@github.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        badge: 'Developer',
      },
    ],
    facebook: [
      {
        name: 'Sanjeev Singh',
        email: 'sanjeev.singh@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        badge: 'Facebook Account',
      },
      {
        name: 'Taylor Morgan',
        email: 'taylor.morgan@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        badge: 'Verified Profile',
      },
    ],
  };

  const handleSelectPreset = (account) => {
    onSelectAccount({
      provider,
      role: selectedRole,
      fullName: account.name,
      email: account.email,
      avatar: account.avatar,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setValidationError('');
    onSelectAccount({
      provider,
      role: selectedRole,
      fullName: customName.trim(),
      email: customEmail.trim().toLowerCase(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName.trim())}&background=145A46&color=fff`,
    });
  };

  const currentAccounts = presetAccounts[provider] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sage/60 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Provider Branding */}
        <div className="px-6 pt-6 pb-4 border-b border-sage/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage/30 flex items-center justify-center shadow-inner">
              {provider === 'google' && <GoogleIcon className="w-5 h-5" />}
              {provider === 'github' && <GithubIcon className="w-5 h-5 text-charcoal" />}
              {provider === 'facebook' && <FacebookIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-charcoal leading-tight">
                {provider === 'google' && 'Choose an account'}
                {provider === 'github' && 'Sign in with GitHub'}
                {provider === 'facebook' && 'Log in with Facebook'}
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                to continue to <span className="font-semibold text-forest">PitchConnect</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sage/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Preference Selector inside modal */}
        <div className="px-6 py-2.5 bg-ivory/60 border-b border-sage/30 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
            Signing up as:
          </span>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-sage/60 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('startup')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'startup'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Founder
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('investor')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'investor'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Investor
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {validationError}
            </div>
          )}

          {!useCustomAccount ? (
            <>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
                  Select an account
                </p>

                {currentAccounts.map((acc, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectPreset(acc)}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-sage/70 hover:border-emerald hover:bg-sage/20 transition-all text-left group shadow-xs hover:shadow"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-sage shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-charcoal truncate group-hover:text-forest">
                          {acc.name}
                        </span>
                        {acc.badge && (
                          <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full shrink-0">
                            {acc.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-charcoal-muted truncate block">
                        {acc.email || acc.handle}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Use Another Account Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => setUseCustomAccount(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-sage hover:border-forest hover:bg-sage/10 text-xs font-semibold text-forest transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {provider === 'google' && 'Use another Google account'}
                  {provider === 'github' && 'Use another GitHub account'}
                  {provider === 'facebook' && 'Log into another Facebook account'}
                </span>
              </button>
            </>
          ) : (
            /* Custom Account Real-Time Input Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  Enter your {provider.charAt(0).toUpperCase() + provider.slice(1)} account
                </span>
                <button
                  type="button"
                  onClick={() => setUseCustomAccount(false)}
                  className="text-xs text-emerald font-semibold hover:underline"
                >
                  ← Back to account list
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={provider === 'github' ? 'e.g. Sanjeev Singh' : 'e.g. Alex Rivera'}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-sage focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  {provider.charAt(0).toUpperCase() + provider.slice(1)} Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={
                      provider === 'google'
                        ? 'you@gmail.com'
                        : provider === 'github'
                        ? 'you@github.com'
                        : 'you@facebook.com'
                    }
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-sage focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer with Security & Privacy Notice */}
        <div className="px-6 py-3 bg-ivory/70 border-t border-sage/40 flex items-center gap-2 text-[11px] text-charcoal-muted">
          <Shield className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            {provider === 'google' &&
              'Google will share your profile and email with PitchConnect securely.'}
            {provider === 'github' &&
              'GitHub will grant PitchConnect verified identity & profile access.'}
            {provider === 'facebook' &&
              'Facebook identity verification protected by end-to-end OAuth.'}
          </span>
        </div>
      </div>
    </div>
  );
}
