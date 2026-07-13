'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function VisibilitySettingsPage() {
  const { user } = useStore();
  const [settings, setSettings] = useState({
    calendar: 'private',
    goals: 'private',
    habits: 'private'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getVisibility();
      setSettings({
        calendar: data.calendar || 'private',
        goals: data.goals || 'private',
        habits: data.habits || 'private'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.updateVisibility(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Privacy Settings</h1>
          {user && (
            <Link href={`/profile/${user.id}`} className="text-[var(--color-brand-primary)] hover:underline">
              &larr; Back to Profile
            </Link>
          )}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-8">
            Control who can see your data when they visit your profile. 
          </p>

          <div className="space-y-6">
            
            {/* Calendar */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Calendar (Tasks & Events)</label>
              <select
                value={settings.calendar}
                onChange={(e) => handleChange('calendar', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] text-gray-700"
              >
                <option value="private">Private (Only me)</option>
                <option value="followers">Followers Only</option>
                <option value="public">Public (Anyone)</option>
              </select>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Goals</label>
              <select
                value={settings.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] text-gray-700"
              >
                <option value="private">Private (Only me)</option>
                <option value="followers">Followers Only</option>
                <option value="public">Public (Anyone)</option>
              </select>
            </div>

            {/* Habits */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Habits</label>
              <select
                value={settings.habits}
                onChange={(e) => handleChange('habits', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] text-gray-700"
              >
                <option value="private">Private (Only me)</option>
                <option value="followers">Followers Only</option>
                <option value="public">Public (Anyone)</option>
              </select>
            </div>

          </div>

          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-brand-primary)] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && (
              <span className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600 font-medium'}`}>
                {message}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
