import { Suspense } from 'react';
import { getClient } from '@/lib/clients';
import ChatWidget from './ChatWidget';

interface PageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function WidgetPage({ searchParams }: PageProps) {
  const { clientId = 'demo' } = await searchParams;
  const config = getClient(clientId);

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
