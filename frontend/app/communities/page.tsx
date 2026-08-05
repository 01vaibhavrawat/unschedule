'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, [search]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunities(search);
      setCommunities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await api.createCommunity({ name: newName, description: newDesc, tag: newTag });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewTag('');
      fetchCommunities();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Explore Communities</h1>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-800">
              &larr; Home
            </Link>
            <button 
              onClick={() => setShowCreate(true)}
              className="bg-[var(--color-brand-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors"
            >
              Create Community
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create a New Community</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="Community Name" 
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
              />
              <div className="mb-2">
                <RichTextEditor 
                  value={newDesc} 
                  onChange={setNewDesc} 
                  placeholder="Description" 
                  minHeight="80px"
                />
              </div>
              <input 
                type="text" 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                placeholder="Tag (e.g. Productivity)" 
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                <button onClick={handleCreate} className="bg-[var(--color-brand-primary)] text-white px-4 py-2 rounded-lg">Create</button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full md:w-1/2 border border-gray-200 rounded-xl p-3 focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && <div className="text-gray-500">Loading...</div>}
          {!loading && communities.length === 0 && (
            <div className="text-gray-500 col-span-2">No communities found.</div>
          )}
          {!loading && communities.map(c => (
            <Link href={`/communities/${c.id}`} key={c.id} className="block">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[var(--color-brand-primary)]">{c.name}</h3>
                  {c.tag && (
                    <span className="inline-block bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs px-2 py-1 rounded-full mt-2 mb-2 font-medium">
                      {c.tag}
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{c.description?.replace(/<[^>]+>/g, '') || 'No description provided.'}</p>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  {c.member_count} {c.member_count === 1 ? 'member' : 'members'}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
