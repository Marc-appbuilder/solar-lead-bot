import { Suspense } from 'react';
import { getClient, clients } from '@/lib/clients';
import ChatWidget from './ChatWidget';

interface PageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function WidgetPage({ searchParams }: PageProps) {
  const { clientId = 'demo' } = await searchParams;
  const rawConfig = getClient(clientId);
  // Gives every hand-configured client an explicit 'SolarDesk' identity
  // in the widget footer (previously a hardcoded literal — see
  // ChatWidget.tsx). Only applies when clientId is literally a key in
  // the hardcoded clients.ts object — a Chatacus-provisioned id is never
  // a key there, so this is a no-op for them and they get the 'Chatacus'
  // default from ChatWidget itself.
  const config = clients[clientId]
    ? { ...rawConfig, assistantDisplayName: rawConfig.assistantDisplayName ?? 'SolarDesk' }
    : rawConfig;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
          Loading…
        </div>
      }
    >
      <ChatWidget clientId={clientId} config={config} />
    </Suspense>
  );
}
