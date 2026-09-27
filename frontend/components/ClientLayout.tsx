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
    // Sync theme on mount
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      useStore.setState({ theme: 'dark' });
    } else {
      document.documentElement.classList.remove('dark');
      useStore.setState({ theme: 'light' });
    }

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
    return <div className="h-screen w-screen flex items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-surface)]">Loading...</div>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Prevent rendering if not authenticated and not on auth page
  if (!user) {
    return null; 
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      <NavigationRail />
      <div className="flex-1 overflow-hidden flex flex-col relative transition-all duration-300">
        {children}
      </div>
      {pathname !== '/' && assistantOpen && (
        <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] h-full relative z-30 transition-all shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
          <AssistantChat isEmbedded={true} onClose={() => setAssistantOpen(false)} />
        </div>
      )}
      {pathname !== '/' && !assistantOpen && (
        <button 
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-[var(--color-brand-primary)] rounded-full flex items-center justify-center text-white shadow-[var(--shadow-glow)] hover:bg-[var(--color-brand-primary-hover)] transition-all hover:scale-105 hover:-translate-y-1 z-40 border border-white/10 cursor-pointer"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
