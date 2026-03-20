import { clients } from '@/lib/clients';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.vaughanai.co';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Vaughan</h1>
        <p className="text-lg text-gray-600 mb-10">
          Embeddable AI chat widget, powered by Claude.
        </p>

        {/* Clients */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configured clients</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(clients).map(([id, c]) => (
              <div
                key={id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div
                  className="h-2"
                  style={{ background: c.brandColour }}
                />
                <div className="p-4">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: <code>{id}</code></p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">→ {c.agentEmail}</p>
                  <a
                    href={`/widget?clientId=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium underline underline-offset-2"
                    style={{ color: c.brandColour }}
                  >
                    Preview widget ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Embed instructions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Embed instructions</h2>
          <p className="text-gray-600 mb-3">
            Paste one line into any website — just before the closing{' '}
            <code className="bg-gray-100 px-1 rounded text-sm">&lt;/body&gt;</code> tag:
          </p>

          {Object.entries(clients).map(([id, c]) => (
            <div key={id} className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-1">{c.name}</p>
              <pre className="bg-gray-900 text-green-300 rounded-xl text-xs p-4 overflow-x-auto whitespace-pre-wrap">
                {`<script src="${APP_URL}/embed.js?clientId=${id}" async></script>`}
              </pre>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
