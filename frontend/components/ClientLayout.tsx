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
    <div className="h-[100dvh] w-full max-w-[100vw] flex flex-col md:flex-row overflow-hidden bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      <NavigationRail />
      <div className="flex-1 overflow-hidden flex flex-col relative min-w-0 transition-all duration-300 pb-14 md:pb-0">
        {children}
      </div>

      {/* Desktop Assistant Sidebar */}
      {pathname !== '/' && assistantOpen && (
        <aside className="hidden md:block w-[380px] lg:w-[420px] flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] h-full relative z-30 transition-all shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
          <AssistantChat isEmbedded={true} onClose={() => setAssistantOpen(false)} />
        </aside>
      )}

      {/* Mobile Assistant Full-Screen Sheet */}
      {pathname !== '/' && assistantOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[var(--color-bg-surface)] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-250">
          <AssistantChat isEmbedded={true} onClose={() => setAssistantOpen(false)} />
        </div>
      )}

      {/* Floating Assistant Trigger (when closed outside Home) */}
      {pathname !== '/' && !assistantOpen && (
        <button 
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] rounded-full flex items-center justify-center text-white shadow-[var(--shadow-glow)] hover:bg-[var(--color-brand-primary-hover)] transition-all hover:scale-105 active:scale-95 z-30 border border-white/20 cursor-pointer"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      )}
    </div>
  );
};
