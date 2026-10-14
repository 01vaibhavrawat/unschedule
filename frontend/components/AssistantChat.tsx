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
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const isDismissed = sessionStorage.getItem(`quick_prompts_dismissed_${user.id}`);
      if (!isDismissed) {
        setShowQuickActions(true);
      }
    }
  }, [user]);

  const dismissQuickActions = () => {
    setShowQuickActions(false);
    if (typeof window !== 'undefined' && user) {
      sessionStorage.setItem(`quick_prompts_dismissed_${user.id}`, 'true');
    }
  };

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

    dismissQuickActions();

    const isQuickAction = textToSend.startsWith('quick_action_');

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

    if (isQuickAction) {
      setMessages(prev => [...prev, asstMessage]);
    } else {
      const userMessage = {
        _id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage, asstMessage]);
    }

    if (!overrideInput) {
      setInput('');
    }
    setIsTyping(true);

    try {
      await api.streamAssistantMessage({ message: textToSend }, (event: any) => {
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
      <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-soft)] backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)] flex-shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)] font-heading leading-tight">MoolaAI</h2>
            <p className="text-[11px] sm:text-xs text-[var(--color-brand-primary)] font-medium">Assistant &amp; Planner</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="h-9 w-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-xl transition-all cursor-pointer active:scale-95"
            aria-label="Close Assistant"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages Area Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[var(--color-bg-app)] min-h-0">
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-[var(--color-border-strong)] scrollbar-track-transparent">
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
            if (
              msg.role === 'user' &&
              typeof msg.content === 'string' &&
              (msg.content.startsWith('quick_action_') ||
                msg.content === "I'd like to create a new atomic habit." ||
                msg.content === "I want to write a daily journal entry." ||
                msg.content === "I'd like to set a new goal." ||
                msg.content === "Help me plan my day and schedule tasks.")
            ) {
              return null;
            }
            const isAssistant = msg.role === 'assistant';
            return (
              <div key={msg._id || idx} className={`flex gap-2.5 sm:gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl ${isAssistant ? 'bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]' : 'bg-[var(--color-bg-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]'}`}>
                  {isAssistant ? <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </div>
                <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} max-w-[85%] sm:max-w-[340px]`}>
                  <div className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-xs ${isAssistant ? 'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-tl-none' : 'bg-[var(--color-brand-primary)] text-white rounded-tr-none'}`}>
                    {msg.is_running_tool && (
                      <div className="flex items-center gap-1.5 text-[var(--color-brand-cyan)] font-medium mb-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 bg-[var(--color-brand-cyan)] rounded-full animate-pulse" />
                        Executing {msg.is_running_tool.replace('_', ' ')}...
                      </div>
                    )}
                    {msg.content}
                    {msg.is_streaming && !msg.is_running_tool && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-[var(--color-bg-surface)] opacity-70 animate-pulse rounded-full align-middle" />
                    )}
                  </div>
                  {msg.action_data && (
                    <div className="mt-2 bg-[var(--color-brand-success-soft)] border border-[var(--color-brand-success)] rounded-xl p-2.5 sm:p-3 text-xs w-full shadow-xs backdrop-blur-md">
                      <div className="flex items-center gap-1.5 text-[var(--color-brand-success)] font-bold mb-1">
                        <CheckCircle2 className="h-4 w-4" /> Action Executed
                      </div>
                      <div className="text-[var(--color-text-primary)] font-medium text-[11px] sm:text-xs">
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
                              {verb} <span className="text-[var(--color-brand-success-strong)] font-bold">{noun.replace('_', ' ')}</span>
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
            <div className="flex gap-2.5 sm:gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] px-4 py-3 rounded-2xl rounded-tl-none shadow-xs flex gap-1.5 items-center h-[38px]">
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
          <div className="absolute inset-x-0 top-0 p-2 sm:p-3 bg-gradient-to-b from-[var(--color-bg-app)] via-[var(--color-bg-app)] to-transparent pb-16 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-[var(--color-bg-surface-soft)] backdrop-blur-xl rounded-2xl p-2.5 shadow-lg border border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Quick Suggestions</span>
                <button
                  type="button"
                  onClick={dismissQuickActions}
                  className="h-6 w-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors cursor-pointer active:scale-95"
                  aria-label="Dismiss quick suggestions"
                  title="Dismiss suggestions"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleSend(undefined, "quick_action_atomic_habit")} className="cursor-pointer p-2.5 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] active:scale-98 border border-[var(--color-border-subtle)] rounded-xl transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-1.5 shadow-xs">
                    <Target className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Habit</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Build a routine</div>
                </button>
                <button onClick={() => handleSend(undefined, "quick_action_journal")} className="cursor-pointer p-2.5 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] active:scale-98 border border-[var(--color-border-subtle)] rounded-xl transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-1.5 shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--color-brand-purple)]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Journal</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Reflect on day</div>
                </button>
                <button onClick={() => handleSend(undefined, "quick_action_goal")} className="cursor-pointer p-2.5 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] active:scale-98 border border-[var(--color-border-subtle)] rounded-xl transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-1.5 shadow-xs">
                    <Flag className="w-3.5 h-3.5 text-[var(--color-brand-cyan)]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">New Goal</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Set a milestone</div>
                </button>
                <button onClick={() => handleSend(undefined, "quick_action_plan")} className="cursor-pointer p-2.5 text-left bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] active:scale-98 border border-[var(--color-border-subtle)] rounded-xl transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary-soft)] flex items-center justify-center mb-1.5 shadow-xs">
                    <CalendarCheck className="w-3.5 h-3.5 text-[var(--color-brand-success)]" />
                  </div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Plan Day</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Organize schedule</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2.5 sm:p-4 bg-[var(--color-bg-surface-soft)] backdrop-blur-md border-t border-[var(--color-border-subtle)] pb-safe shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to schedule, plan, or note..."
            className="w-full pl-4 sm:pl-5 pr-12 sm:pr-14 py-2.5 sm:py-3.5 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] shadow-inner transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 sm:right-2 p-2 sm:p-2.5 rounded-xl text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] active:scale-95 disabled:opacity-40 transition-all shadow-[var(--shadow-glow)] cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
