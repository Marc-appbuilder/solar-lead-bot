import Link from 'next/link';
import Script from 'next/script';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white font-sans antialiased">

      {/* Live demo widget */}
      <Script src="/embed.js?clientId=landing-demo" strategy="afterInteractive" />

      {/* Cal.com embed */}
      <Script id="cal-inline-embed" strategy="afterInteractive">{`
        (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
        Cal("init", "solardesk-demo", {origin:"https://app.cal.com"});
        Cal.ns["solardesk-demo"]("inline", {
          elementOrSelector:"#my-cal-inline-solardesk-demo",
          config: {"layout":"month_view","useSlotsViewOnSmallScreen":"true"},
          calLink: "gladetech/solardesk-demo",
        });
        Cal.ns["solardesk-demo"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      `}</Script>

      {/* Try Ray live label */}
      <div className="pointer-events-none fixed bottom-[100px] right-4 z-[2147483646] flex flex-col items-end gap-1">
        <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-lg backdrop-blur-sm">
          Try Ray live
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0f17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-base font-black tracking-tight">
            Solar<span className="text-amber-400">Desk</span>
          </span>
          <Link
            href="/login"
            className="text-sm text-white/35 transition hover:text-white/60"
          >
            Client login
          </Link>
        </div>
      </nav>

      {/* ── 1. Hero ── */}
      <section className="mx-auto max-w-3xl px-6 pb-28 pt-24">
        <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-amber-400">
          For UK solar installers
        </p>
        <h1 className="mb-8 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          While you're installing solar,<br />
          SolarDesk is answering<br />
          your enquiries.
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/50">
          SolarDesk answers questions, qualifies leads and captures opportunities while you're busy doing the work. No missed enquiries. No repetitive admin.
        </p>
        <a
          href="#video"
          className="inline-block rounded-xl bg-amber-400 px-8 py-4 text-base font-bold text-[#0c0f17] shadow-[0_0_40px_rgba(245,158,11,0.3)] transition hover:bg-amber-300"
        >
          Watch it in action
        </a>
      </section>

      {/* ── 2. The Problem ── */}
      <section className="border-t border-white/5 bg-[#080b12] px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-2xl font-black leading-snug tracking-tight sm:text-3xl">
            The best solar installers are usually the busiest.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-white/50">
            <p>They're not sitting at a desk waiting for enquiries to come in.</p>
            <p>They're visiting customers. Surveying roofs. Installing systems. Running a business.</p>
            <p>Meanwhile potential customers land on the website looking for a quick answer.</p>
            <p>Some wait. Some leave. Some choose someone else.</p>
            <p className="font-semibold text-white/70">
              Not because the installer didn't want the work. Because they were busy doing it.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. What SolarDesk Does ── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
            What SolarDesk does
          </p>
          <h2 className="mb-10 text-2xl font-black leading-snug tracking-tight sm:text-3xl">
            Not a chatbot.<br />A team member.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-white/50">
            <p>
              SolarDesk answers questions, collects useful information and identifies serious enquiries.
              By the time a lead reaches you, the important details have already been gathered.
            </p>
            <p>
              Whether they own their home. What their electricity bill looks like. Whether they're in your area. Whether they're ready to move forward.
            </p>
            <p>
              The best leads come through with a roof photo attached. You know it's worth your time before you even pick up the phone.
            </p>
            <p className="font-semibold text-white/70">
              No login. No CRM. No chasing. Just leads waiting in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Video ── */}
      <section id="video" className="border-t border-white/5 bg-[#080b12] px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-2xl font-black tracking-tight sm:text-3xl">
            Watch it working.
          </h2>
          <p className="mb-10 text-center text-base text-white/40">
            See SolarDesk handle a live enquiry from start to finish.
          </p>

          {/* Video embed — replace VIDEO_ID with your YouTube video ID */}
          <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-white/8 bg-[#050710]">
            {/* Placeholder shown until a real video is added */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 translate-x-0.5 text-amber-400">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
              <p className="text-sm text-white/25">Video coming soon</p>
            </div>
            {/*
              When ready, remove the placeholder above and uncomment this:
              <iframe
                src="https://www.youtube.com/embed/VIDEO_ID?autoplay=0&rel=0"
                title="SolarDesk in action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            */}
          </div>

          <p className="mt-8 text-center text-sm text-white/30">
            Or try it yourself — the button in the corner is SolarDesk running live.
          </p>
        </div>
      </section>

      {/* ── 5. Why I Built It ── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="sm:flex sm:gap-12">
            <div className="mb-8 flex-shrink-0 sm:mb-0">
              <img
                src="https://gladetech.uk/marc.jpeg"
                alt="Marc Richards"
                className="h-20 w-20 rounded-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-400">
                Why I built it
              </p>
              <div className="space-y-4 text-lg leading-relaxed text-white/55">
                <p>I noticed something.</p>
                <p>
                  The best solar installers were often the hardest people to reach. Not because they didn't care.
                  Because they were busy. They were doing the work.
                </p>
                <p>
                  Every missed enquiry is a real opportunity gone. Not because the business isn't good enough —
                  because there aren't enough hours in the day.
                </p>
                <p className="font-semibold text-white/75">So I built SolarDesk.</p>
              </div>
              <p className="mt-6 text-sm text-white/30">
                Marc Richards ·{' '}
                <a href="https://gladetech.uk" target="_blank" rel="noreferrer" className="text-amber-400/70 hover:text-amber-400">
                  Glade Tech
                </a>
                {' '}· Poole, Dorset
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. What Changes ── */}
      <section className="border-t border-white/5 bg-[#080b12] px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-2xl font-black leading-snug tracking-tight sm:text-3xl">
            What changes when SolarDesk is working.
          </h2>
          <ul className="space-y-6">
            {[
              'Fewer missed opportunities.',
              'Faster responses — even when you\'re on a job.',
              'Better-qualified enquiries by the time they reach you.',
              'Less time wasted on people who were never going to convert.',
              'More time for the work that actually moves the business forward.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-4 text-lg text-white/60">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 7. Closing ── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-2xl font-black leading-snug tracking-tight sm:text-3xl">
            Get in touch.
          </h2>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-white/50">
            If you'd like to see whether SolarDesk could work for your business, just reach out.
            No pressure. No sales pitch.
          </p>
          <div className="mb-16 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://wa.me/447404259301"
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-xl bg-amber-400 px-8 py-4 text-center text-base font-bold text-[#0c0f17] transition hover:bg-amber-300"
            >
              Message on WhatsApp
            </a>
            <a
              href="mailto:marc@gladetech.uk"
              className="inline-block rounded-xl border border-white/12 px-8 py-4 text-center text-base font-semibold text-white/55 transition hover:border-white/25 hover:text-white/75"
            >
              Send an email
            </a>
          </div>

          <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/25">
            Or book 15 minutes
          </p>
          <div
            id="my-cal-inline-solardesk-demo"
            className="overflow-hidden rounded-2xl border border-white/5"
            style={{ width: '100%', minHeight: '600px', overflow: 'scroll' }}
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 text-xs text-white/20 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SolarDesk</span>
          <span>
            Built by{' '}
            <a href="https://gladetech.uk" target="_blank" rel="noreferrer" className="hover:text-white/40">
              Glade Tech
            </a>
            {' '}· Poole, Dorset
          </span>
        </div>
      </footer>

    </div>
  );
}
