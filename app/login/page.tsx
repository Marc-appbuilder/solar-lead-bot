'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f1f3d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* Logo / wordmark */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: '#f8f3ea',
        }}>
          Vaughan<span style={{ color: '#b8882e' }}>AI</span>
        </div>
        <div style={{
          marginTop: '6px',
          fontSize: '13px',
          color: 'rgba(248,243,234,0.4)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Estate agent platform
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(184,136,46,0.2)',
        borderRadius: '20px',
        padding: '32px 28px',
      }}>
        {!sent ? (
          <>
            <h1 style={{
              margin: '0 0 6px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#f8f3ea',
            }}>
              Sign in
            </h1>
            <p style={{
              margin: '0 0 24px',
              fontSize: '14px',
              color: 'rgba(248,243,234,0.45)',
              lineHeight: 1.5,
            }}>
              Enter your email and we'll send you a magic link.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="email"
                placeholder="you@agency.co.uk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(184,136,46,0.25)',
                  borderRadius: '12px',
                  padding: '13px 16px',
                  color: '#f8f3ea',
                  fontSize: '15px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />

              {error && (
                <p style={{ margin: 0, fontSize: '13px', color: '#f87171' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  background: loading || !email ? 'rgba(184,136,46,0.4)' : '#b8882e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#f8f3ea' }}>
              Check your inbox
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'rgba(248,243,234,0.5)', lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: '#f8f3ea' }}>{email}</strong>. Click it to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(184,136,46,0.3)',
                borderRadius: '10px',
                padding: '10px 20px',
                color: 'rgba(248,243,234,0.5)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p style={{
        marginTop: '32px',
        fontSize: '12px',
        color: 'rgba(248,243,234,0.2)',
      }}>
        © {new Date().getFullYear()} VaughanAI
      </p>
    </div>
  );
}
