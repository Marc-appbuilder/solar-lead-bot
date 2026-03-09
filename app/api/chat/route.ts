import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/* ── Rate limiting ─────────────────────────────────────────────────────────
   In-memory store: fine for a single serverless instance / dev.
   For multi-region production, swap for Redis/Upstash.               ───── */
const RATE_LIMIT = 20;          // max messages
const WINDOW_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_MSG_LEN = 500;         // chars — longer messages are truncated

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { rateLimited: true },
      { status: 429 }
    );
  }

  let clientId: string;
  let messages: ChatMessage[];

  try {
    ({ clientId, messages } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!clientId || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'clientId and messages are required' }, { status: 400 });
  }

  const config = getClient(clientId);

  // Validate and truncate messages before sending to Anthropic
  const sanitisedMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, MAX_MSG_LEN),
    }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: config.systemPrompt,
          messages: sanitisedMessages,
        });

        for await (const event of anthropicStream) {
          // Only forward text deltas — skip thinking blocks
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const payload = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? err.message
            : 'Unexpected error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
