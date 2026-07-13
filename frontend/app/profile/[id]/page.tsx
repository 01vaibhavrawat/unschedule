'use client';

import React, { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useStore();
  
  const resolvedParams = use(params);
  const profileId = resolvedParams.id;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile(profileId);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await api.followUser(profileId);
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.unfollowUser(profileId);
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessage = async () => {
    try {
      const convo = await api.startConversation(profileId);
      window.location.href = `/messages/${convo.id}`;
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Profile not found.</div>;

  const isOwnProfile = user?.id === profileId;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Profile</h1>
          <Link href="/" className="text-[var(--color-brand-primary)] hover:underline">
            &larr; Back to Calendar
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[#5C415D] to-[#7a5a7c] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
          
          <div className="flex justify-center gap-6 mt-4 text-gray-600">
            <div><strong className="text-gray-900 text-lg">{profile.follower_count}</strong> Followers</div>
            <div><strong className="text-gray-900 text-lg">{profile.following_count}</strong> Following</div>
          </div>

          {!isOwnProfile && (
            <div className="mt-6 flex justify-center gap-3">
              {profile.is_following ? (
                <button onClick={handleUnfollow} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Unfollow
                </button>
              ) : (
                <button onClick={handleFollow} className="bg-[var(--color-brand-primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors shadow-sm">
                  Follow
                </button>
              )}
              <button onClick={handleMessage} className="bg-white border-2 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)] px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Message
              </button>
            </div>
          )}
          
          {isOwnProfile && (
            <div className="mt-6">
              <Link href="/settings/visibility" className="text-[var(--color-brand-primary)] hover:underline font-medium">
                Edit Privacy Settings
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Active Goals</h3>
            {!profile.goals ? (
              <p className="text-gray-500 italic">This section is private.</p>
            ) : profile.goals.length === 0 ? (
              <p className="text-gray-500">No active goals.</p>
            ) : (
              <ul className="space-y-3">
                {profile.goals.map((goal: any) => (
                  <li key={goal._id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color || '#ccc' }}></div>
                    <span className="font-medium text-gray-700">{goal.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Habits</h3>
            {!profile.habits ? (
              <p className="text-gray-500 italic">This section is private.</p>
            ) : profile.habits.length === 0 ? (
              <p className="text-gray-500">No active habits.</p>
            ) : (
              <ul className="space-y-3">
                {profile.habits.map((habit: any) => (
                  <li key={habit._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="font-medium text-gray-800">{habit.title}</div>
                    <div className="text-sm text-gray-500 mt-1 capitalize">{habit.frequency.join(', ')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Calendar Activity (Public Events)</h3>
          {!profile.calendar ? (
            <p className="text-gray-500 italic">This section is private.</p>
          ) : profile.calendar.length === 0 ? (
            <p className="text-gray-500">No calendar events to show.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {profile.calendar.map((event: any) => (
                <div key={event._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">{event.title}</span>
                  <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200">
                    {new Date(event.start_time).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
