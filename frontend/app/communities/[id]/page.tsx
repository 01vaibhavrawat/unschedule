'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import { PeopleSuggestions } from '@/components/PeopleSuggestions';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { user } = useStore();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCommunityAndFeed();
    }
  }, [id]);

  const fetchCommunityAndFeed = async () => {
    try {
      const [commData, feedData] = await Promise.all([
        api.getCommunity(id),
        api.getCommunityFeed(id)
      ]);
      setCommunity(commData);
      setPosts(feedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!community) return;
    try {
      if (community.is_member) {
        await api.leaveCommunity(id);
      } else {
        await api.joinCommunity(id);
      }
      fetchCommunityAndFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await api.createPost({ content: newPost, community_id: id });
      setNewPost('');
      const feedData = await api.getCommunityFeed(id);
      setPosts(feedData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading community...</div>;
  if (!community) return <div className="p-8 text-center text-gray-500">Community not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="mb-4">
          <Link href="/communities" className="text-[var(--color-brand-primary)] hover:underline text-sm font-medium">
            &larr; Back to Communities
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
              {community.tag && (
                <span className="inline-block bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs px-2 py-1 rounded-full mt-2 font-medium">
                  {community.tag}
                </span>
              )}
            </div>
            <button
              onClick={handleJoinLeave}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                community.is_member 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]'
              }`}
            >
              {community.is_member ? 'Leave' : 'Join'}
            </button>
          </div>
          <div 
            className="text-gray-600 mt-3 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: community.description || 'No description provided.' }}
          />
          <div className="mt-4 text-xs text-gray-400">
            {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
          </div>
        </div>

        {community.is_member && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-2 w-full">
              <RichTextEditor
                value={newPost}
                onChange={setNewPost}
                placeholder={`Post to ${community.name}...`}
                minHeight="80px"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handlePost}
                className="bg-[var(--color-brand-primary)] text-white px-5 py-2 rounded-lg font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Community Feed</h2>
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-sm border border-gray-100">No posts in this community yet.</p>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={user?.id} 
                onPostDeleted={() => handleDeletePost(post.id)} 
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
