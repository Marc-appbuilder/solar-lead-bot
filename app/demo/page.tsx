import Script from 'next/script';

export const metadata = {
  title: 'SunRay Solar — Solar Panel Installers, Hampshire & Dorset',
  description: 'MCS certified solar panel installation across Hampshire, Dorset and Wiltshire. Free home survey and quote.',
};

export default function DemoPage() {
  return (
    <>
      {/* SolarDesk widget — this is the bit being demoed */}
      <Script src="/embed.js" data-client-id="landing-demo" strategy="afterInteractive" />

      <div className="min-h-screen bg-white font-sans antialiased text-gray-900">

        {/* ── Nav ── */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
                <circle cx="18" cy="18" r="7" fill="#f97316"/>
                <g stroke="#f97316" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="2"  x2="18" y2="7"/>
                  <line x1="18" y1="29" x2="18" y2="34"/>
                  <line x1="2"  y1="18" x2="7"  y2="18"/>
                  <line x1="29" y1="18" x2="34" y2="18"/>
                  <line x1="6.5"  y1="6.5"  x2="10" y2="10"/>
                  <line x1="26"   y1="26"   x2="29.5" y2="29.5"/>
                  <line x1="29.5" y1="6.5"  x2="26" y2="10"/>
                  <line x1="10"   y1="26"   x2="6.5" y2="29.5"/>
                </g>
              </svg>
              <span className="text-lg font-black tracking-tight text-gray-900">SunRay <span className="text-[#f97316]">Solar</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm text-gray-500 hover:text-gray-900 transition">Services</a>
              <a href="#about" className="text-sm text-gray-500 hover:text-gray-900 transition">About</a>
              <a href="#reviews" className="text-sm text-gray-500 hover:text-gray-900 transition">Reviews</a>
              <a href="tel:01202000000" className="text-sm text-gray-500 hover:text-gray-900 transition">01202 000 000</a>
              <a
                href="#contact"
                className="rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ea6c0a] transition"
              >
                Free Survey
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="bg-[#0c1e3d] px-6 py-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300">MCS Certified</span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300">Trustpilot 4.9 ★</span>
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Solar panels that<br />
              <span className="text-[#fb923c]">pay for themselves.</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-300">
              SunRay Solar has been installing high-performance solar systems across Hampshire and Dorset since 2012.
              Find out what your home could save — with no pressure, no jargon.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="inline-block rounded-lg bg-[#f97316] px-8 py-3.5 text-center text-sm font-bold text-white hover:bg-[#ea6c0a] transition"
              >
                Get a free quote
              </a>
              <a
                href="#services"
                className="inline-block rounded-lg border border-white/15 px-8 py-3.5 text-center text-sm font-semibold text-white/80 hover:bg-white/6 transition"
              >
                What we install ↓
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-10 max-w-lg">
              {[
                { n: '500+', label: 'homes installed' },
                { n: '£1,200', label: 'avg annual saving' },
                { n: '25yr', label: 'panel warranty' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{n}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="bg-[#f97316] px-6 py-5">
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4">
            {[
              '✓ MCS Certified',
              '✓ RECC Member',
              '✓ Trustpilot 4.9/5',
              '✓ 0% Finance Available',
              '✓ Free Home Survey',
            ].map((item) => (
              <span key={item} className="text-sm font-semibold text-white">{item}</span>
            ))}
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#f97316]">What we do</p>
            <h2 className="mb-14 text-3xl font-black tracking-tight text-gray-900">Complete solar solutions,<br/>start to finish.</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: '☀️',
                  title: 'Solar Panels',
                  desc: 'Tier-1 panels from leading manufacturers, sized and positioned for maximum yield on your roof.',
                },
                {
                  icon: '🔋',
                  title: 'Battery Storage',
                  desc: 'Store energy generated during the day and use it in the evening. Never waste a unit of solar.',
                },
                {
                  icon: '🚗',
                  title: 'EV Charging',
                  desc: 'Charge your car from your own roof. We install smart EV chargers alongside your solar system.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-gray-100 p-7">
                  <div className="mb-4 text-3xl">{icon}</div>
                  <h3 className="mb-2 text-base font-black text-gray-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us ── */}
        <section id="about" className="bg-slate-50 border-y border-gray-100 px-6 py-24">
          <div className="mx-auto max-w-4xl sm:flex sm:gap-16 sm:items-start">
            <div className="flex-1 mb-10 sm:mb-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#f97316]">Why SunRay</p>
              <h2 className="mb-6 text-3xl font-black tracking-tight text-gray-900">Local experts.<br/>No call centres.</h2>
              <p className="text-base leading-relaxed text-gray-500">
                We're a family-run business based in Ringwood. Every survey, every installation, every follow-up call is handled by our own engineers — not a third-party contractor.
              </p>
            </div>
            <div className="flex-1 space-y-5">
              {[
                'Fully employed MCS-certified engineers',
                'Detailed energy yield report before you commit',
                'No-pressure, no-jargon home surveys',
                '10-year workmanship warranty on all installs',
                'Dedicated aftercare team — not a chatbot',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#f97316]/10">
                    <svg className="h-3 w-3 text-[#f97316]" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section id="reviews" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#f97316]">Customer reviews</p>
            <h2 className="mb-12 text-3xl font-black tracking-tight text-gray-900">Trusted by 500+ homeowners.</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  name: 'James H.',
                  location: 'Bournemouth',
                  stars: 5,
                  text: 'Brilliant from start to finish. Survey was thorough, the install took one day, and our bills have halved. Couldn\'t recommend more highly.',
                },
                {
                  name: 'Sarah M.',
                  location: 'Winchester',
                  stars: 5,
                  text: 'We got four quotes. SunRay were not the cheapest but they were the most professional by a mile. The system has performed above the yield estimate.',
                },
                {
                  name: 'David & Clare T.',
                  location: 'Poole',
                  stars: 5,
                  text: 'Installation was spotless — no mess, no fuss. Team were polite and explained everything clearly. Exporting energy back to the grid within a week.',
                },
              ].map(({ name, location, stars, text }) => (
                <div key={name} className="rounded-2xl border border-gray-100 p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <span key={i} className="text-[#f97316] text-sm">★</span>
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-gray-600">"{text}"</p>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA / Contact ── */}
        <section id="contact" className="bg-[#0c1e3d] px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-white">Ready to go solar?</h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Use the chat in the corner to get a quick idea of your potential savings — or call us direct on 01202 000 000.
            </p>
            <a
              href="tel:01202000000"
              className="inline-block rounded-lg bg-[#f97316] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#ea6c0a] transition"
            >
              Call us now
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-[#071428] px-6 py-10">
          <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">SunRay Solar</p>
              <p className="text-xs text-slate-500 mt-0.5">Ringwood Road, Bournemouth, BH11 9AA</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <span className="text-xs text-slate-600">MCS Certified</span>
              <span className="text-xs text-slate-600">RECC Member</span>
              <span className="text-xs text-slate-600">Reg. 12345678</span>
            </div>
            <p className="text-xs text-slate-600">© 2024 SunRay Solar Ltd</p>
          </div>
        </footer>

      </div>
    </>
  );
}
