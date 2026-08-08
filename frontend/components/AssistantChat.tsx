'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Bot, User, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export const AssistantChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = useStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadHistory = async () => {
    try {
      const res = await api.getAssistantHistory();
      // fetchAPI returns the array directly
      if (Array.isArray(res)) {
        setMessages(res);
      } else if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.sendAssistantMessage({ message: userMessage.content });
      if (res) {
        // Backend returns the message object directly, no 'data' wrapper
        const newMessage = res.data ? res.data : res;
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      // Fallback message
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Unschedule Assistant</h2>
            <p className="text-xs text-indigo-500 font-medium">Always here to help</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center py-10 flex flex-col items-center">
            <Bot className="h-12 w-12 text-indigo-200 mb-3" />
            <p className="text-sm text-gray-500">I can help you manage your calendar, tasks, and habits.</p>
            <p className="text-xs text-gray-400 mt-2">Try saying "Schedule a gym session for tomorrow morning"</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div key={msg._id || idx} className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isAssistant ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[240px] whitespace-pre-wrap leading-relaxed ${isAssistant ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm' : 'bg-indigo-600 text-white rounded-tr-none shadow-sm'}`}>
                  {msg.content}
                </div>
                {msg.action_data && (
                  <div className="mt-2 bg-green-50 border border-green-100 rounded-xl p-3 text-xs w-[240px] shadow-sm">
                    <div className="flex items-center gap-1.5 text-green-700 font-medium mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Action Executed
                    </div>
                    <div className="text-green-600">
                      Created {msg.action_data.action.replace('create_', '')}: <span className="font-semibold">{msg.action_data.data?.title || 'Item'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
