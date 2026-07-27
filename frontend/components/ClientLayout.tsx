"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { NavigationRail } from '@/components/NavigationRail';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, fetchInitialData } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!isAuthPage) {
      api.me()
        .then((u) => {
          setUser(u);
          fetchInitialData();
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          router.push('/login');
        });
    } else {
      setLoading(false);
    }
  }, [pathname, isAuthPage, setUser, fetchInitialData, router]);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center text-gray-400 bg-white">Loading...</div>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Prevent rendering if not authenticated and not on auth page
  if (!user) {
    return null; 
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white text-gray-800">
      <NavigationRail />
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
};
