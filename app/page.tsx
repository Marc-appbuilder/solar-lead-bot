import Link from 'next/link';
import Script from 'next/script';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans antialiased">

      {/* Live demo widget */}
      <Script src="/embed.js?clientId=landing-demo" strategy="afterInteractive" />

      {/* "Try the live demo" label above the FAB */}
      <div className="pointer-events-none fixed bottom-[100px] right-4 z-[2147483646] flex flex-col items-end gap-1">
        <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-lg backdrop-blur-sm">
          👇 Try the live demo
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <span className="text-lg font-black tracking-tight">
              Solar<span className="text-amber-400">Desk</span>
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:border-white/20 hover:text-white/70"
          >
            Client Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-4xl px-5 pb-24 pt-20 text-center">
        <div className="mb-6 inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-400">
          Built for UK solar installers
        </div>
        <h1 className="mb-6 text-5xl font-black leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
          Every Solar Enquiry,<br />
          <span className="text-amber-400">Answered</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/55 sm:text-xl">
          A chat widget that qualifies your leads while you're on the roof.
        </p>
        <a
          href="#how-it-works"
          className="inline-block rounded-xl bg-amber-400 px-8 py-4 text-base font-bold text-[#0f172a] shadow-[0_0_40px_rgba(245,158,11,0.35)] transition hover:bg-amber-300"
        >
          See How It Works ↓
        </a>
      </section>

      {/* ── Pain points ── */}
      <section className="border-y border-white/5 bg-[#0b1120] px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-black tracking-tight sm:text-3xl">
            Why Solar Installers Use SolarDesk
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                problem: 'Missing enquiries while you\'re on a job?',
                fix: 'SolarDesk picks up while you\'re busy. Every enquiry gets answered straight away.',
              },
              {
                problem: 'Too many enquiries going nowhere?',
                fix: 'Every lead gets qualified before it reaches you. You only see the ones worth calling back.',
              },
              {
                problem: 'Turning up to jobs that don\'t convert?',
                fix: 'You\'ll know their bill, whether they own the home, and their roof situation before you call.',
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="rounded-2xl border border-white/6 bg-[#0f172a] p-6"
              >
                <p className="mb-3 text-sm font-semibold text-white/35">{item.problem}</p>
                <div className="mb-3 h-px bg-white/6" />
                <p className="text-sm font-semibold leading-relaxed text-white/80">
                  <span className="text-amber-400">→ </span>{item.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-3xl font-black tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mb-16 text-center text-base text-white/45">
            We handle the setup. You just start getting leads.
          </p>
          <div className="flex flex-col gap-6">
            {[
              {
                n: '1',
                title: 'Your site starts the conversation',
                body: 'A friendly chat widget opens the moment someone visits your site — day or night, no missed enquiries.',
              },
              {
                n: '2',
                title: 'Qualifies everything that matters',
                body: 'Postcode, home ownership, monthly bill size, and an optional roof photo — all collected before you even know the name.',
              },
              {
                n: '3',
                title: 'Drops a Gold Lead into your dashboard',
                body: 'Ready to call or WhatsApp with one tap, straight from your dashboard.',
              },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-base font-black text-amber-400">
                  {step.n}
                </div>
                <div className="pt-1.5">
                  <p className="mb-1 font-bold text-white">{step.title}</p>
                  <p className="text-sm leading-relaxed text-white/45">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gold Lead ── */}
      <section className="border-y border-white/5 bg-[#0b1120] px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-amber-400">
            The Gold Lead
          </div>
          <h2 className="mb-4 text-center text-3xl font-black tracking-tight sm:text-4xl">
            You know it's real before you call
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-base leading-relaxed text-white/50">
            A Gold Lead means: they own the home, pay £150+ a month, are in your service area, and have uploaded a roof photo.
          </p>

          {/* Mock lead card */}
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-amber-400/20 bg-[#0f172a] shadow-[0_0_60px_rgba(245,158,11,0.08)]">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold">07911 234567</span>
                  <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    ⭐ Gold
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/30">Just now · Steve's Solar</p>
              </div>
              <span className="rounded-full bg-[#1e3a5f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#60a5fa]">
                New
              </span>
            </div>

            {/* Card details */}
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {[
                { label: 'Postcode', value: 'BH12 4AB' },
                { label: 'Bill',     value: '£250+' },
                { label: 'Owner',    value: 'Yes' },
              ].map((d) => (
                <div key={d.label} className="rounded-lg bg-white/4 px-3 py-2 text-xs">
                  <span className="text-white/30">{d.label} </span>
                  <span className="font-semibold text-white">{d.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 rounded-lg bg-white/4 px-3 py-2 text-xs font-semibold text-amber-400">
                📷 Roof photo
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 px-5 pb-5">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3 text-sm font-semibold text-[#60a5fa]">
                📞 Call
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0a2e1a] py-3 text-sm font-semibold text-[#34d399]">
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl">
            Simple Pricing
          </h2>
          <p className="mb-12 text-base text-white/45">One plan. Everything included.</p>

          <div className="overflow-hidden rounded-2xl border border-amber-400/25 bg-[#0b1120]">
            <div className="border-b border-white/5 bg-amber-400/5 px-8 py-8">
              <div className="mb-1 flex items-end justify-center gap-1">
                <span className="text-6xl font-black text-amber-400">£99</span>
                <span className="mb-3 text-lg text-white/40">/month</span>
              </div>
              <p className="text-sm text-white/40">Everything you need to stop losing leads</p>
            </div>
            <div className="px-8 py-8">
              <ul className="mb-8 space-y-3 text-left">
                {[
                  'No setup fee',
                  'Cancel anytime',
                  'Live within 24 hours',
                  'Gold lead qualification',
                  'Roof photo capture',
                  'WhatsApp one-tap calling',
                  'Unlimited leads',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <span className="text-amber-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/447404259301"
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-xl bg-amber-400 py-4 text-center text-base font-bold text-[#0f172a] transition hover:bg-amber-300"
              >
                💬 Get Started on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="border-t border-white/5 bg-[#0b1120] px-5 py-20 text-center">
        <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl">
          Get set up today
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-white/50">
          We'll get you set up in 24 hours. No contracts, no tech headaches.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="tel:+447404259301"
            className="rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            📞 Call Us
          </a>
          <a
            href="https://wa.me/447404259301"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-[#0a2e1a] px-6 py-3.5 text-sm font-semibold text-[#34d399] transition hover:bg-[#0f3d22]"
          >
            💬 WhatsApp Us
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-5 py-6 text-center text-xs text-white/20">
        © {new Date().getFullYear()} SolarDesk · Built for UK solar installers
      </footer>

    </div>
  );
}
