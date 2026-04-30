'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Calendar, ArrowRight, Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';

// ── Password strength ────────────────────────────────────────────────────
const getStrength = (pwd: string) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function SignupPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = getStrength(form.password);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;
  const passwordsMismatch = form.confirm && form.password !== form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await api.signup({ name: form.name, email: form.email, password: form.password });
      setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.name && form.email && form.password && form.confirm && !passwordsMismatch;

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
          <h1 className="auth-hero-title">Your week,<br />beautifully<br />structured.</h1>
          <p className="auth-hero-sub">
            Join the growing community building better habits and achieving meaningful goals.
          </p>
        </div>

        <div className="auth-checklist">
          {[
            'Free to use, always',
            'No credit card required',
            'Your data stays private',
            'Works across all devices',
          ].map((item) => (
            <div key={item} className="auth-check-item">
              <div className="auth-check-icon">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>

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
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-sub">Start planning better, starting today</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">Full name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">Email address</label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 6 characters"
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
              {/* strength bar */}
              {form.password && (
                <div className="strength-bar-wrapper">
                  <div className="strength-bar-track">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-bar-segment"
                        style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm" className="auth-label">Confirm password</label>
              <div className="auth-input-wrapper">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className={`auth-input ${passwordsMismatch ? 'auth-input-error' : ''} ${passwordsMatch ? 'auth-input-ok' : ''}`}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="auth-eye-btn"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="auth-field-error">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="auth-submit-btn"
              id="signup-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 auth-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: var(--font-geist-sans, 'Inter', system-ui, sans-serif);
        }

        .auth-panel-left {
          display: none;
          position: relative;
          overflow: hidden;
          padding: 3rem;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(145deg, #5C415D 0%, #3d2a3e 60%, #2a1a2b 100%);
          color: white;
          max-width: 520px;
          flex: 1;
        }
        @media (min-width: 900px) { .auth-panel-left { display: flex; } }

        .auth-brand { display: flex; align-items: center; gap: 0.625rem; }
        .auth-brand-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .auth-brand-name { font-size: 1.375rem; font-weight: 700; letter-spacing: -0.02em; color: white; }

        .auth-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 0; }
        .auth-hero-title {
          font-size: 2.75rem; font-weight: 800; line-height: 1.15;
          letter-spacing: -0.03em; margin-bottom: 1rem;
        }
        .auth-hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.72); line-height: 1.6; max-width: 340px; }

        .auth-checklist { display: flex; flex-direction: column; gap: 0.75rem; }
        .auth-check-item {
          display: flex; align-items: center; gap: 0.75rem;
          font-size: 0.9rem; color: rgba(255,255,255,0.85); font-weight: 500;
        }
        .auth-check-icon {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .auth-deco-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
        .auth-deco-1 { width: 360px; height: 360px; top: -80px; right: -120px; }
        .auth-deco-2 { width: 220px; height: 220px; bottom: -60px; left: -60px; }

        .auth-panel-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.5rem; background: #fafafa;
        }

        .auth-form-card {
          width: 100%; max-width: 440px;
          background: white; border-radius: 20px; padding: 2.25rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 50px -12px rgba(92,65,93,0.12);
          border: 1px solid rgba(92,65,93,0.08);
        }

        .auth-mobile-brand { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
        @media (min-width: 900px) { .auth-mobile-brand { display: none; } }

        .auth-form-header { margin-bottom: 1.5rem; }
        .auth-form-title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.025em; margin: 0 0 0.3rem; }
        .auth-form-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }

        .auth-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 10px; padding: 0.75rem 1rem;
          font-size: 0.875rem; color: #dc2626; margin-bottom: 1rem;
        }

        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .auth-field { display: flex; flex-direction: column; gap: 0.375rem; }
        .auth-label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
        .auth-input {
          width: 100%; box-sizing: border-box;
          padding: 0.7rem 1rem;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9375rem; color: #111827; background: #fff;
          outline: none; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .auth-input:focus { border-color: #5C415D; box-shadow: 0 0 0 3px rgba(92,65,93,0.12); }
        .auth-input::placeholder { color: #9ca3af; }
        .auth-input-error { border-color: #ef4444 !important; }
        .auth-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }
        .auth-input-ok { border-color: #22c55e !important; }

        .auth-input-wrapper { position: relative; }
        .auth-eye-btn {
          position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 0; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; justify-content: center; transition: color 0.15s;
        }
        .auth-eye-btn:hover { color: #5C415D; }

        .strength-bar-wrapper { display: flex; align-items: center; gap: 0.625rem; margin-top: 0.4rem; }
        .strength-bar-track { display: flex; gap: 4px; flex: 1; }
        .strength-bar-segment { height: 4px; flex: 1; border-radius: 2px; transition: background 0.3s; }
        .strength-label { font-size: 0.75rem; font-weight: 600; min-width: 42px; }

        .auth-field-error { font-size: 0.78rem; color: #ef4444; margin: 0; }

        .auth-submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.8125rem;
          border: none; border-radius: 10px;
          font-size: 0.9375rem; font-weight: 600; color: white;
          background: linear-gradient(135deg, #5C415D 0%, #7a5a7c 100%);
          cursor: pointer;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(92,65,93,0.35);
          margin-top: 0.25rem;
        }
        .auth-submit-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(92,65,93,0.4);
        }
        .auth-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spin { animation: spin 0.8s linear infinite; }

        .auth-switch { text-align: center; font-size: 0.875rem; color: #6b7280; margin: 1.25rem 0 0; }
        .auth-switch-link { color: #5C415D; font-weight: 600; text-decoration: none; transition: opacity 0.15s; }
        .auth-switch-link:hover { opacity: 0.75; text-decoration: underline; }
      `}</style>
    </div>
  );
}
