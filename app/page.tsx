import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans antialiased">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-base font-black tracking-tight text-[#0F172A]">
            ☀️ SolarDesk
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-400 transition hover:text-gray-600"
          >
            Client login
          </Link>
        </div>
      </nav>

      {/* ── 1. Hero ── */}
      <section className="bg-[#0F172A] px-6 pb-40 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#B7791F]">
            For UK solar installers
          </p>
          <h1 className="mb-8 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Capture solar leads.<br />
            While you're on the roof.
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-400">
            SolarDesk answers questions, qualifies leads and captures opportunities while you're busy doing the work. No missed enquiries. No repetitive admin.
          </p>
          <a
            href="#video"
            className="inline-block rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-[#0F172A] transition hover:bg-slate-100"
          >
            Watch it in action
          </a>
        </div>
      </section>

      {/* ── 2. The Problem ── */}
      <section className="bg-white px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-2xl font-black leading-snug tracking-tight text-[#0F172A] sm:text-3xl">
            The best solar installers are usually the busiest.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-gray-500">
            <p>They're not sitting at a desk waiting for enquiries to come in.</p>
            <p>They're visiting customers. Surveying roofs. Installing systems. Running a business.</p>
            <p>Meanwhile potential customers land on the website looking for a quick answer.</p>
            <p>Some wait. Some leave. Some choose someone else.</p>
            <p className="font-semibold text-[#0F172A]">
              Not because the installer didn't want the work. Because they were busy doing it.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. What SolarDesk Does ── */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#B7791F]">
            What SolarDesk does
          </p>
          <h2 className="mb-10 text-2xl font-black leading-snug tracking-tight text-[#0F172A] sm:text-3xl">
            Not a chatbot.<br />A team member.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-gray-500">
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
            <p className="font-semibold text-[#0F172A]">
              No login. No CRM. No chasing. Just leads waiting in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Video ── */}
      <section id="video" className="bg-[#0F172A] px-6 py-32">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-3 text-center text-2xl font-black tracking-tight text-white sm:text-3xl">
            Watch it working.
          </h2>
          <p className="mb-10 text-center text-base text-slate-400">
            See SolarDesk handle a live enquiry from start to finish.
          </p>

          <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-white/8 bg-[#0d1829]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/6">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 translate-x-0.5 text-white/50">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Video coming soon</p>
            </div>
            {/*
              When ready, remove the placeholder above and uncomment:
              <iframe
                src="https://www.youtube.com/embed/VIDEO_ID?rel=0"
                title="SolarDesk in action"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            */}
          </div>
        </div>
      </section>

      {/* ── 5. Why I Built It ── */}
      <section className="bg-white px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <div className="sm:flex sm:gap-12">
            <div className="mb-8 flex-shrink-0 sm:mb-0">
              <img
                src="https://gladetech.uk/marc.jpeg"
                alt="Marc Richards"
                className="h-20 w-20 rounded-full object-cover ring-1 ring-gray-200"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#B7791F]">
                Why I built it
              </p>
              <div className="space-y-4 text-lg leading-relaxed text-gray-500">
                <p>I noticed something.</p>
                <p>
                  The best solar installers were often the hardest people to reach. Not because they didn't care.
                  Because they were busy. They were doing the work.
                </p>
                <p>
                  Every missed enquiry is a real opportunity gone. Not because the business isn't good enough —
                  because there aren't enough hours in the day.
                </p>
                <p className="font-semibold text-[#0F172A]">So I built SolarDesk.</p>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                Marc Richards ·{' '}
                <a
                  href="https://gladetech.uk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0F172A] underline underline-offset-2 hover:opacity-70"
                >
                  Glade Tech
                </a>
                {' '}· Poole, Dorset
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. What Changes ── */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-2xl font-black leading-snug tracking-tight text-[#0F172A] sm:text-3xl">
            What changes when SolarDesk is working.
          </h2>
          <ul className="space-y-6">
            {[
              'Fewer missed opportunities.',
              "Faster responses — even when you're on a job.",
              'Better-qualified enquiries by the time they reach you.',
              "Less time wasted on people who were never going to convert.",
              'More time for the work that actually moves the business forward.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-4 text-lg text-gray-500">
                <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0F172A]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 7. Get In Touch ── */}
      <section className="bg-white px-6 py-32">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-2xl font-black leading-snug tracking-tight text-[#0F172A] sm:text-3xl">
            Get in touch.
          </h2>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-gray-500">
            If you'd like to see whether SolarDesk could work for your business, just reach out.
            No pressure. No sales pitch.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://wa.me/447404259301"
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg bg-[#0F172A] px-7 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#1E293B]"
            >
              Message on WhatsApp
            </a>
            <a
              href="mailto:marc@gladetech.uk"
              className="inline-block rounded-lg border border-gray-200 px-7 py-3.5 text-center text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
            >
              Send an email
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SolarDesk</span>
          <span>
            Built by{' '}
            <a
              href="https://gladetech.uk"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-600"
            >
              Glade Tech
            </a>
            {' '}· Poole, Dorset
          </span>
        </div>
      </footer>

    </div>
  );
}
