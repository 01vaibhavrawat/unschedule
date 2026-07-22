'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const renderNotificationText = (n: any) => {
    switch (n.type) {
      case 'follow':
        return 'Someone started following you.';
      case 'reaction':
        return 'Someone reacted to your post.';
      case 'comment':
        return 'Someone commented on your post.';
      default:
        return 'New notification';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Notifications</h1>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-800">
              &larr; Home
            </Link>
            {notifications.some(n => !n.is_read) && (
              <button 
                onClick={handleMarkAllRead}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && <div className="p-8 text-center text-gray-500">Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">No notifications yet.</div>
          )}
          {!loading && notifications.map((n, idx) => (
            <div 
              key={n.id} 
              className={`p-4 border-b border-gray-50 flex justify-between items-start ${!n.is_read ? 'bg-blue-50/30' : ''} ${idx === notifications.length - 1 ? 'border-b-0' : ''}`}
            >
              <div className="flex gap-3 items-start">
                <div className="text-xl mt-1">
                  {n.type === 'follow' && '👋'}
                  {n.type === 'reaction' && '❤️'}
                  {n.type === 'comment' && '💬'}
                </div>
                <div>
                  <div className={`text-gray-800 ${!n.is_read ? 'font-medium' : ''}`}>
                    {renderNotificationText(n)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {!n.is_read && (
                <button 
                  onClick={() => handleMarkRead(n.id)}
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2 hover:bg-blue-600 transition-colors cursor-pointer"
                  title="Mark as read"
                />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
