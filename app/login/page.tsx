'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth') {
      setError('For security reasons, please open this link in the same browser you requested it from, then try again.');
    }
  }, []);

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0f172a] px-5 py-10 font-sans antialiased">

      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">☀️</span>
          <span className="text-2xl font-black tracking-tight text-white">
            Solar<span className="text-amber-400">Desk</span>
          </span>
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/30">
          Client Login
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/8 bg-[#0b1120]">
        {!sent ? (
          <div className="px-8 py-8">
            <h1 className="mb-1 text-xl font-black text-white">Sign in</h1>
            <p className="mb-7 text-sm text-white/40">
              Enter your email and we'll send you a magic link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
              />

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </div>
        ) : (
          <div className="px-8 py-10 text-center">
            <div className="mb-4 text-4xl">✉️</div>
            <h2 className="mb-2 text-lg font-black text-white">Check your inbox</h2>
            <p className="mb-7 text-sm leading-relaxed text-white/40">
              We sent a magic link to{' '}
              <span className="font-semibold text-white">{email}</span>.
              Click it to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-white/20">
        © {new Date().getFullYear()} SolarDesk
      </p>
    </div>
  );
}
