"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { NavigationRail } from '@/components/NavigationRail';
import { AssistantChat } from '@/components/AssistantChat';
import { Bot } from 'lucide-react';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, fetchInitialData, assistantOpen, setAssistantOpen } = useStore();
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
      <AssistantChat isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
      {!assistantOpen && (
        <button 
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 z-40"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
