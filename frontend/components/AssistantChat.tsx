'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Bot, User, CheckCircle2, Target, BookOpen, Flag, CalendarCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

export const AssistantChat = ({ isOpen, onClose, isEmbedded = false }: { isOpen?: boolean; onClose?: () => void; isEmbedded?: boolean }) => {
  const { user, fetchInitialData } = useStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isOpen || isEmbedded) && user) {
      loadHistory();
    }
  }, [isOpen, isEmbedded, user]);

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

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    setShowQuickActions(false);

    const userMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    const tempAsstId = (Date.now() + 1).toString();
    const asstMessage = {
      _id: tempAsstId,
      role: 'assistant',
      content: '',
      action_data: null as any,
      created_at: new Date().toISOString(),
      is_streaming: true,
      is_running_tool: null as string | null
    };

    setMessages(prev => [...prev, userMessage, asstMessage]);
    if (!overrideInput) {
      setInput('');
    }
    setIsTyping(true);

    try {
      await api.streamAssistantMessage({ message: userMessage.content }, (event: any) => {
        setIsTyping(false); // Hide generic typing once streaming starts

        if (event.type === 'token') {
          setMessages(prev => prev.map(m =>
            m._id === tempAsstId ? { ...m, content: m.content + event.content } : m
          ));
        } else if (event.type === 'tool_start') {
          setMessages(prev => prev.map(m =>
            m._id === tempAsstId ? { ...m, is_running_tool: event.action } : m
          ));
        } else if (event.type === 'done') {
          setMessages(prev => prev.map(m =>
            m._id === tempAsstId ? {
              ...m,
              _id: event.message._id || tempAsstId,
              is_streaming: false,
              is_running_tool: null,
              action_data: event.message.action_data
            } : m
          ));
          if (event.message.action_data) {
            fetchInitialData();
          }
        }
      });
    } catch (err) {
      console.error('Failed to stream message', err);
      setMessages(prev => prev.map(m =>
        m._id === tempAsstId ? { ...m, content: 'Sorry, I encountered an error. Please try again later.', is_streaming: false, is_running_tool: null } : m
      ));
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const containerClasses = isEmbedded
    ? "h-full w-full bg-white border-l border-gray-200 flex flex-col"
    : "fixed inset-y-0 right-0 w-80 md:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300";

  return (
    <div className={containerClasses}>
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
        {!isEmbedded && onClose && (
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages Area Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !showQuickActions && (
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
                    {msg.is_running_tool && (
                      <div className="flex items-center gap-2 text-indigo-500 font-medium mb-2 text-xs">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        Executing {msg.is_running_tool.replace('_', ' ')}...
                      </div>
                    )}
                    {msg.content}
                    {msg.is_streaming && !msg.is_running_tool && (
                      <span className="inline-block w-1 h-3 ml-1 bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  {msg.action_data && (
                    <div className="mt-2 bg-green-50 border border-green-100 rounded-xl p-3 text-xs w-[240px] shadow-sm">
                      <div className="flex items-center gap-1.5 text-green-700 font-medium mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Action Executed
                      </div>
                      <div className="text-green-600">
                        {(() => {
                          const action = msg.action_data.action;
                          let verb = 'Executed';
                          let noun = action;
                          if (action.startsWith('create_')) { verb = 'Created'; noun = action.replace('create_', ''); }
                          else if (action.startsWith('update_')) { verb = 'Updated'; noun = action.replace('update_', ''); }
                          else if (action.startsWith('delete_')) { verb = 'Deleted'; noun = action.replace('delete_', ''); }
                          else if (action.startsWith('get_')) { verb = 'Retrieved'; noun = action.replace('get_', ''); }
                          return (
                            <span>
                              {verb} {noun.replace('_', ' ')}: <span className="font-semibold">{msg.action_data.data?.title || msg.action_data.data?.task_id || msg.action_data.data?.habit_id || msg.action_data.data?.goal_id || msg.action_data.data?.note_id || msg.action_data.data?.journal_id || 'Items'}</span>
                            </span>
                          );
                        })()}
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

        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className="absolute inset-x-0 top-0 p-1 bg-gradient-to-b from-gray-50 via-gray-50/95 to-transparent pb-12 z-10">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-1 shadow-xl border border-indigo-100/50">

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleSend(undefined, "I'd like to create a new atomic habit.")} className="cursor-pointer p-3 text-left bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5">
                  <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                    <Target className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-semibold text-gray-800">Atomic Habit</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Build a new routine</div>
                </button>
                <button onClick={() => handleSend(undefined, "I want to write a daily journal entry.")} className="cursor-pointer p-3 text-left bg-purple-50/70 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5">
                  <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                    <BookOpen className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-semibold text-gray-800">Daily Journal</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Reflect on your day</div>
                </button>
                <button onClick={() => handleSend(undefined, "I'd like to set a new goal or priority.")} className="cursor-pointer p-3 text-left bg-blue-50/70 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5">
                  <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                    <Flag className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-semibold text-gray-800">New Goal</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Set a milestone</div>
                </button>
                <button onClick={() => handleSend(undefined, "Help me plan my day and schedule tasks.")} className="cursor-pointer p-3 text-left bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all duration-300 group hover:shadow-md hover:-translate-y-0.5">
                  <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                    <CalendarCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-semibold text-gray-800">Plan Day</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Organize tasks</div>
                </button>
              </div>
            </div>
          </div>
        )}
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
