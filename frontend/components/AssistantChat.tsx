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
    ? "h-full w-full bg-[var(--color-bg-surface)] flex flex-col font-sans"
    : "fixed inset-y-0 right-0 w-80 md:w-96 bg-[var(--color-bg-glass-surface)] backdrop-blur-2xl border-l border-[var(--color-border-subtle)] shadow-[var(--shadow-modal)] z-50 flex flex-col transform transition-transform duration-300 font-sans";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-soft)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)] font-heading">Unschedule AI</h2>
            <p className="text-xs text-[var(--color-brand-primary)] font-medium">Always here to help</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-xl transition-all cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages Area Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[var(--color-bg-app)]">
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[var(--color-border-strong)] scrollbar-track-transparent">
          {messages.length === 0 && !showQuickActions && (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-surface-muted)] flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
                <Bot className="h-8 w-8 text-[var(--color-brand-primary)] opacity-80" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">I can help you manage your calendar, tasks, and habits.</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Try saying "Schedule a gym session for tomorrow morning"</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div key={msg._id || idx} className={`flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${isAssistant ? 'bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]' : 'bg-[var(--color-bg-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'}`}>
                  {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm max-w-[260px] whitespace-pre-wrap leading-relaxed shadow-sm ${isAssistant ? 'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-tl-none' : 'bg-[var(--color-brand-primary)] text-white rounded-tr-none'}`}>
                    {msg.is_running_tool && (
                      <div className="flex items-center gap-2 text-[var(--color-brand-cyan)] font-medium mb-2 text-xs">
                        <span className="w-1.5 h-1.5 bg-[var(--color-brand-cyan)] rounded-full animate-pulse" />
                        Executing {msg.is_running_tool.replace('_', ' ')}...
                      </div>
                    )}
                    {msg.content}
                    {msg.is_streaming && !msg.is_running_tool && (
                      <span className="inline-block w-1.5 h-3.5 ml-1.5 bg-[var(--color-bg-surface)] opacity-70 animate-pulse rounded-full align-middle" />
                    )}
                  </div>
                  {msg.action_data && (
                    <div className="mt-2 bg-[var(--color-brand-success-soft)] border border-[var(--color-brand-success)] rounded-xl p-3 text-xs w-[260px] shadow-sm backdrop-blur-md">
                      <div className="flex items-center gap-1.5 text-[var(--color-brand-success)] font-bold mb-1">
                        <CheckCircle2 className="h-4 w-4" /> Action Executed
                      </div>
                      <div className="text-[var(--color-text-primary)] font-medium">
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
                              {verb} <span className="text-[var(--color-brand-success-strong)]">{noun.replace('_', ' ')}</span>
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
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-4 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center h-[44px]">
                <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className="absolute inset-x-0 top-0 p-2 bg-gradient-to-b from-[var(--color-bg-app)] via-[var(--color-bg-app)] to-transparent pb-16 z-10">
            <div className="bg-[var(--color-bg-surface-soft)] backdrop-blur-xl rounded-2xl p-1.5 shadow-[var(--shadow-modal)] border border-[var(--color-border-subtle)]">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSend(undefined, "I'd like to create a new atomic habit.")} className="cursor-pointer p-3 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-xl transition-all duration-300 group hover:shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-2 shadow-sm border border-[var(--color-brand-primary-softer)]">
                    <Target className="w-4 h-4 text-[var(--color-brand-primary)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Atomic Habit</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 font-medium">Build a new routine</div>
                </button>
                <button onClick={() => handleSend(undefined, "I want to write a daily journal entry.")} className="cursor-pointer p-3 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-xl transition-all duration-300 group hover:shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-2 shadow-sm border border-[var(--color-brand-primary-softer)]">
                    <BookOpen className="w-4 h-4 text-[var(--color-brand-purple)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Daily Journal</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 font-medium">Reflect on your day</div>
                </button>
                <button onClick={() => handleSend(undefined, "I'd like to set a new goal or priority.")} className="cursor-pointer p-3 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-xl transition-all duration-300 group hover:shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-2 shadow-sm border border-[var(--color-brand-primary-softer)]">
                    <Flag className="w-4 h-4 text-[var(--color-brand-cyan)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">New Goal</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 font-medium">Set a milestone</div>
                </button>
                <button onClick={() => handleSend(undefined, "Help me plan my day and schedule tasks.")} className="cursor-pointer p-3 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-subtle)] rounded-xl transition-all duration-300 group hover:shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-2 shadow-sm border border-[var(--color-brand-primary-softer)]">
                    <CalendarCheck className="w-4 h-4 text-[var(--color-brand-success)] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Plan Day</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 font-medium">Organize tasks</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--color-bg-surface-soft)] backdrop-blur-md border-t border-[var(--color-border-subtle)]">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to schedule or plan..."
            className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] focus:bg-[var(--color-bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent transition-all text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-xl text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 transition-all shadow-[var(--shadow-glow)] cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
