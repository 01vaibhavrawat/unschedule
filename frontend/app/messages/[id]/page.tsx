'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useStore();
  
  const resolvedParams = use(params);
  const conversationId = resolvedParams.id;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Simple polling for MVP
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const sent = await api.sendMessage(conversationId, newMessage);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading chat...</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">Chat</h1>
          <Link href="/messages" className="text-[var(--color-brand-primary)] hover:underline text-sm font-medium">
            &larr; Back
          </Link>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No messages yet. Say hi!
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg._id || msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isMine 
                      ? 'bg-[var(--color-brand-primary)] text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                    <div className={`text-[10px] mt-1 text-right ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-100 p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-[var(--color-brand-primary)] text-white rounded-full px-6 py-2 font-medium hover:bg-[var(--color-brand-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
