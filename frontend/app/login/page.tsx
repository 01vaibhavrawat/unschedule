'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login({ email: form.email, password: form.password });
      setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left Panel ─────────────────────────────────────────── */}
      <div className="auth-panel-left">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <span className="auth-brand-name">Unschedule</span>
        </div>

        <div className="auth-hero">
          <h1 className="auth-hero-title">Plan your week,<br />own your life.</h1>
          <p className="auth-hero-sub">
            Track tasks, build habits, and pursue goals — all in one calm, focused space.
          </p>
        </div>

        <div className="auth-features">
          {[
            { icon: '📅', text: 'Weekly calendar view' },
            { icon: '⚡', text: 'Atomic habit tracking' },
            { icon: '🎯', text: 'Goal-aligned planning' },
          ].map((f) => (
            <div key={f.text} className="auth-feature-item">
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* decorative circles */}
        <div className="auth-deco-circle auth-deco-1" />
        <div className="auth-deco-circle auth-deco-2" />
      </div>

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          {/* mobile brand */}
          <div className="auth-mobile-brand">
            <div className="auth-brand-icon" style={{ width: 36, height: 36 }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="auth-brand-name" style={{ color: 'var(--color-brand-primary)', fontSize: 20 }}>
              Unschedule
            </span>
          </div>

          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-sub">Sign in to your account</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="auth-input"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="auth-eye-btn"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="auth-submit-btn"
              id="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 auth-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="auth-switch-link">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        /* ── Root ──────────────────────────────────────────────── */
        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: var(--font-geist-sans, 'Inter', system-ui, sans-serif);
        }

        /* ── Left Panel ────────────────────────────────────────── */
        .auth-panel-left {
          display: none;
          position: relative;
          flex: 1;
          overflow: hidden;
          padding: 3rem;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(145deg, #5C415D 0%, #3d2a3e 60%, #2a1a2b 100%);
          color: white;
        }
        @media (min-width: 900px) {
          .auth-panel-left { display: flex; max-width: 520px; }
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .auth-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .auth-brand-name {
          font-size: 1.375rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: white;
        }

        .auth-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; }
        .auth-hero-title {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .auth-hero-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.6;
          max-width: 340px;
        }

        .auth-features { display: flex; flex-direction: column; gap: 0.875rem; }
        .auth-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
        }
        .auth-feature-icon {
          font-size: 1.1rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
          flex-shrink: 0;
        }

        /* decorative circles */
        .auth-deco-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .auth-deco-1 { width: 360px; height: 360px; top: -80px; right: -120px; }
        .auth-deco-2 { width: 220px; height: 220px; bottom: -60px; left: -60px; }

        /* ── Right Panel ───────────────────────────────────────── */
        .auth-panel-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafafa;
        }

        .auth-form-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 20px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 50px -12px rgba(92,65,93,0.12);
          border: 1px solid rgba(92,65,93,0.08);
        }

        .auth-mobile-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }
        @media (min-width: 900px) { .auth-mobile-brand { display: none; } }

        .auth-form-header { margin-bottom: 1.75rem; }
        .auth-form-title {
          font-size: 1.625rem;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.025em;
          margin: 0 0 0.35rem;
        }
        .auth-form-sub {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }

        /* ── Error ─────────────────────────────────────────────── */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #dc2626;
          margin-bottom: 1.25rem;
        }

        /* ── Form ──────────────────────────────────────────────── */
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .auth-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .auth-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.005em;
        }
        .auth-input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .auth-input:focus {
          border-color: #5C415D;
          box-shadow: 0 0 0 3px rgba(92,65,93,0.12);
        }
        .auth-input::placeholder { color: #9ca3af; }

        .auth-input-wrapper { position: relative; }
        .auth-eye-btn {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .auth-eye-btn:hover { color: #5C415D; }

        /* ── Submit ─────────────────────────────────────────────── */
        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.8125rem;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #5C415D 0%, #7a5a7c 100%);
          cursor: pointer;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(92,65,93,0.35);
          margin-top: 0.25rem;
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(92,65,93,0.4);
        }
        .auth-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spin { animation: spin 0.8s linear infinite; }

        /* ── Switch link ─────────────────────────────────────────── */
        .auth-switch {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin: 1.5rem 0 0;
        }
        .auth-switch-link {
          color: #5C415D;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .auth-switch-link:hover { opacity: 0.75; text-decoration: underline; }
      `}</style>
    </div>
  );
}
