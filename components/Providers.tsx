'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuth';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        const data = await res.json();

        if (data.success) {
          const { user, accessToken } = data.data;

          // If the user is a doctor, fetch doctor profile too
          if (user.role === 'doctor') {
            try {
              const meRes = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const meData = await meRes.json();
              if (meData.success && meData.data.doctorProfile) {
                setAuth(user, accessToken, meData.data.doctorProfile);
                return;
              }
            } catch {
              // Fall through — set auth without profile
            }
          }

          setAuth(user, accessToken);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  );
}
