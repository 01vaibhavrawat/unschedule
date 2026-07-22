import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export function PeopleSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await api.getSuggestions();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.followUser(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">People Like You</h3>
      <div className="space-y-4">
        {suggestions.map(s => (
          <div key={s.id} className="flex justify-between items-start gap-3">
            <div>
              <Link href={`/profile/${s.id}`} className="font-medium text-gray-900 hover:text-[var(--color-brand-primary)] text-sm block">
                {s.name}
              </Link>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {s.reason}
              </div>
            </div>
            <button 
              onClick={() => handleFollow(s.id)}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
