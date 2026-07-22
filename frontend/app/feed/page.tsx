'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { PeopleSuggestions } from '@/components/PeopleSuggestions';

function FeedPageContent() {
  const { user } = useStore();
  const searchParams = useSearchParams();
  const shareHabit = searchParams.get('shareHabit');
  const shareTitle = searchParams.get('title');

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
    if (!newPost.trim() && !shareHabit) return;
    try {
      const payload: any = { content: newPost };
      if (shareHabit) {
        payload.activity_type = 'habit';
        payload.activity_ref_id = shareHabit;
        payload.activity_snapshot = { title: shareTitle || 'habit milestone' };
      }
      await api.createPost(payload);
      setNewPost('');
      
      // Remove query params to avoid re-submitting same share on next post
      if (shareHabit && typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
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
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Social Feed</h1>
          <Link href="/" className="text-[var(--color-brand-primary)] hover:underline">
            &larr; Back to Calendar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {shareHabit && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800">
                <strong>Ready to share:</strong> You reached a milestone on &quot;{shareTitle}&quot;!
                Add an optional message below.
              </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={shareHabit ? "Add a comment about your milestone..." : "What's on your mind?"}
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
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUserId={user?.id} 
                    onPostDeleted={() => handleDelete(post.id)} 
                  />
                ))
              )}
            </div>
          </div>
          
          <div className="md:col-span-1">
            <PeopleSuggestions />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading feed...</div>}>
      <FeedPageContent />
    </Suspense>
  );
}
