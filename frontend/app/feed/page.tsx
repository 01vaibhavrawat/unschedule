'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function FeedPage() {
  const { user } = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const data = await api.getFeed();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await api.createPost(newPost);
      setNewPost('');
      fetchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await api.deletePost(postId);
      fetchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading feed...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Social Feed</h1>
          <Link href="/" className="text-[var(--color-brand-primary)] hover:underline">
            &larr; Back to Calendar
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] resize-none"
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handlePost}
              className="bg-[var(--color-brand-primary)] text-white px-5 py-2 rounded-lg font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors"
            >
              Post
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No posts yet. Start following people!</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/profile/${post.user_id}`} className="font-semibold text-gray-900 hover:text-[var(--color-brand-primary)]">
                    {post.user_name}
                  </Link>
                  {user?.id === post.user_id && (
                    <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-600 text-sm">
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
