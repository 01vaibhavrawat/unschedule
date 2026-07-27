"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckSquare, BookOpen, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const NavigationRail = () => {
  const pathname = usePathname();
  const { user } = useStore();

  // If there's no user, we might not want to show the navigation rail
  if (!user) return null;

  const navItems = [
    { label: 'Calendar', href: '/', icon: CalendarDays },
    { label: 'To-Do', href: '/todo', icon: CheckSquare },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Notes', href: '/notes', icon: FileText },
  ];

  return (
    <div className="w-16 h-full flex flex-col items-center py-4 bg-gray-50 border-r border-gray-200">
      <div className="mb-8">
        {/* App Logo or simple icon placeholder */}
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`p-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
