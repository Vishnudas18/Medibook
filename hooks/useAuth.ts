'use client';

import { create } from 'zustand';
import { SafeUser, IDoctorProfile } from '@/types';

interface AuthState {
  user: SafeUser | null;
  doctorProfile: IDoctorProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: SafeUser, accessToken: string, doctorProfile?: IDoctorProfile | null) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  doctorProfile: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, accessToken, doctorProfile = null) =>
    set({
      user,
      accessToken,
      doctorProfile,
      isAuthenticated: true,
      isLoading: false,
    }),

  setAccessToken: (token) =>
    set({ accessToken: token }),

  clearAuth: () =>
    set({
      user: null,
      doctorProfile: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));

/**
 * Custom hook wrapping the Zustand store with helper methods
 */
export function useAuth() {
  const store = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    store.setAuth(data.data.user, data.data.accessToken);
    return data.data;
  };

  const register = async (values: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    store.clearAuth();
  };

  const refreshAuth = async () => {
    try {
      store.setLoading(true);
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        store.setAuth(data.data.user, data.data.accessToken);
        return true;
      }
      store.clearAuth();
      return false;
    } catch {
      store.clearAuth();
      return false;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (store.accessToken) {
      headers.set('Authorization', `Bearer ${store.accessToken}`);
    }

    let res = await fetch(url, { ...options, headers });

    // If 401, try to refresh
    if (res.status === 401) {
      const refreshed = await refreshAuth();
      if (refreshed) {
        const newToken = useAuthStore.getState().accessToken;
        headers.set('Authorization', `Bearer ${newToken}`);
        res = await fetch(url, { ...options, headers });
      }
    }

    return res;
  };

  return {
    ...store,
    login,
    register,
    logout,
    refreshAuth,
    fetchWithAuth,
  };
}
