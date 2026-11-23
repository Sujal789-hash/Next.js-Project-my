'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick initial load from session cache if available to prevent UI flashes
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('pitchconnect_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.user) {
          setUser(parsed.user);
          setProfile(parsed.profile || null);
          setLoading(false);
        }
      }
    } catch (e) {
      // Ignore sessionStorage parsing errors
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setProfile(data.profile || null);
          try {
            sessionStorage.setItem(
              'pitchconnect_user',
              JSON.stringify({ user: data.user, profile: data.profile })
            );
          } catch (e) {}
          return data.user;
        }
      }
      setUser(null);
      setProfile(null);
      try {
        sessionStorage.removeItem('pitchconnect_user');
      } catch (e) {}
      return null;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      try {
        sessionStorage.removeItem('pitchconnect_user');
      } catch (e) {}
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
