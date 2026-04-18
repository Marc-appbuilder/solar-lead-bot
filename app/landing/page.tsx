'use client';

import Script from 'next/script';

export default function LandingPage() {
  return (
    <>
      {/* Inject the embed script — points to same origin so it works in dev */}
      <Script
        src="/embed.js?clientId=solar-demo"
        strategy="afterInteractive"
      />

      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#0a0c10',
        color: '#e8eaf0',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(10,12,16,0.92)', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>☀️</span>
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>
              Bright<span style={{ color: '#f97316' }}>Solar</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '28px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            <a href="#benefits" style={{ color: 'inherit', textDecoration: 'none' }}>Benefits</a>
            <a href="#how" style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
            <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '100px 32px 80px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '99px',
            padding: '5px 16px',
            fontSize: '13px',
            color: '#fb923c',
            marginBottom: '28px',
            fontWeight: 600,
          }}>
            ☀️ Spring installation slots available
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            margin: '0 0 24px',
          }}>
            Cut your energy bill<br />
            <span style={{ color: '#f97316' }}>by up to 70%</span>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 44px',
          }}>
            Premium solar panel installation for UK homeowners. Get a tailored quote in under 60 seconds — no site visit needed.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{
                background: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: '14px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 32px rgba(249,115,22,0.35)',
              }}
            >
              Get my free quote ☀️
            </button>
            <button style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              padding: '16px 32px',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
            }}>
              See how it works
            </button>
          </div>
        </section>

        {/* Stats bar */}
        <section style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '36px 32px',
        }}>
          <div style={{
            maxWidth: '800px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px', textAlign: 'center',
          }}>
            {[
              { val: '2,400+', label: 'Installations completed' },
              { val: '£850', label: 'Avg. annual saving' },
              { val: '10 yr', label: 'Workmanship guarantee' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f97316' }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '40px', textAlign: 'center' }}>
            Why homeowners choose BrightSolar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '⚡', title: 'Fast installation', body: 'Most installs completed in a single day with minimal disruption to your home.' },
              { icon: '🔋', title: 'Battery storage ready', body: 'All our systems are pre-wired for battery storage — future-proof your home today.' },
              { icon: '📊', title: 'Live monitoring app', body: 'Track your generation and savings in real time from your phone.' },
              { icon: '🛡️', title: '10-year guarantee', body: 'Full workmanship warranty on every installation, backed by our insurance.' },
            ].map(b => (
              <div key={b.title} style={{
                background: '#12151e',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{b.title}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{b.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{
          background: '#0d1017',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '80px 32px',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '48px' }}>
              Get a quote in 3 steps
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              {[
                { n: '1', title: 'Chat with our bot', body: 'Answer 4 quick questions — takes under a minute.' },
                { n: '2', title: 'Steve calls you back', body: 'Our installer calls within the hour with a tailored quote.' },
                { n: '3', title: 'Book your install', body: 'Choose a date and we handle everything else.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: '#f97316', fontSize: '16px', flexShrink: 0,
                  }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{s.title}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '40px', textAlign: 'center' }}>
            Common questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'Do I need planning permission?', a: 'Most domestic solar installations are permitted development and require no planning permission.' },
              { q: 'How long does installation take?', a: 'A standard 4kW system takes 4–6 hours. We aim to complete most jobs in a single day.' },
              { q: 'What if my roof faces north?', a: 'East or west-facing roofs still generate 80–85% of optimal output. Steve will assess your specific situation.' },
              { q: 'Is there a deposit?', a: 'We require a small reservation fee to book your slot, with the balance due on completion.' },
            ].map(f => (
              <div key={f.q} style={{
                background: '#12151e',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '22px 24px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{f.q}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '32px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.2)',
        }}>
          © {new Date().getFullYear()} BrightSolar Ltd · Demo page powered by{' '}
          <span style={{ color: '#f97316' }}>SolarDesk</span>
        </footer>
      </div>
    </>
  );
}
