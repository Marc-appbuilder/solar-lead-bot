import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';
import { Resend } from 'resend';
import type { LeadPayload } from '@/app/api/lead/route';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');
}

/* ── Rate limiting ──────────────────────────────────────────────────────── */
const RATE_LIMIT  = 20;
const WINDOW_MS   = 10 * 60 * 1000;
const MAX_MSG_LEN = 500;

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

/* ── Lead tool definition ───────────────────────────────────────────────── */
const captureLeadTool: Anthropic.Tool = {
  name: 'capture_lead',
  description:
    'Call this tool once you have collected the user\'s name and email address. ' +
    'Pass all details you have gathered so far.',
  input_schema: {
    type: 'object' as const,
    properties: {
      name:    { type: 'string', description: 'Full name of the lead' },
      email:   { type: 'string', description: 'Email address of the lead' },
      phone:   { type: 'string', description: 'Phone number if provided' },
      summary: { type: 'string', description: 'A one or two sentence summary of what they are looking for' },
    },
    required: ['name', 'email'],
  },
};

/* ── Email helpers ──────────────────────────────────────────────────────── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHtml(lead: LeadPayload, clientName: string, brandColour: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0;background:#f5f5f5}
  .wrapper{max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .header{background:${brandColour};color:#fff;padding:24px 32px}
  .header h1{margin:0;font-size:20px;font-weight:700}
  .header p{margin:4px 0 0;font-size:13px;opacity:.8}
  .body{padding:28px 32px}
  table{border-collapse:collapse;width:100%}
  td{padding:10px 14px;border:1px solid #e8e8e8;vertical-align:top;font-size:14px}
  td:first-child{background:#f9f9f9;font-weight:600;width:120px;color:#555}
  .summary{margin-top:20px;background:#f9f9f9;border-left:4px solid ${brandColour};padding:14px 18px;border-radius:4px;font-size:14px;white-space:pre-wrap;color:#333}
  .footer{margin-top:24px;font-size:11px;color:#aaa}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>New lead from Vaughan — ${escapeHtml(clientName)}</h1>
    <p>${new Date().toUTCString()}</p>
  </div>
  <div class="body">
    <table>
      <tr><td>Name</td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escapeHtml(lead.email)}" style="color:${brandColour}">${escapeHtml(lead.email)}</a></td></tr>
      ${lead.phone ? `<tr><td>Phone</td><td><a href="tel:${escapeHtml(lead.phone)}" style="color:${brandColour}">${escapeHtml(lead.phone)}</a></td></tr>` : ''}
    </table>
    ${lead.summary ? `<div class="summary"><strong>What they were looking for:</strong>\n${escapeHtml(lead.summary)}</div>` : ''}
    <div class="footer">Sent automatically by Vaughan</div>
  </div>
</div>
</body></html>`;
}

async function sendLeadEmail(lead: LeadPayload, clientId: string) {
  const config = getClient(clientId);
  const { error } = await getResend().emails.send({
    from: 'Vaughan <onboarding@resend.dev>',
    to: config.notificationEmail,
    replyTo: lead.email,
    subject: `New lead from Vaughan — ${config.name}`,
    html: buildHtml(lead, config.name, config.brandColour),
  });
  if (error) console.error('[lead] resend error:', error);
}

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/* ── Chat route ─────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ rateLimited: true }, { status: 429 });
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

  const sanitisedMessages: Anthropic.MessageParam[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_MSG_LEN) }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (text: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));

      try {
        /* ── First pass ── */
        const firstStream = anthropic.messages.stream({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system:     config.systemPrompt,
          messages:   sanitisedMessages,
          tools:      [captureLeadTool],
        });

        // Collect tool call input while streaming text
        let toolUseId    = '';
        let toolRawInput = '';
        let toolCalled   = false;

        for await (const event of firstStream) {
          if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
            toolUseId = event.content_block.id;
            toolRawInput = '';
            toolCalled = true;
          } else if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
            toolRawInput += event.delta.partial_json;
          } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            enqueue(event.delta.text);
          }
        }

        if (!toolCalled) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        /* ── Tool called: parse input, fire email, continue ── */
        let toolInput: LeadPayload = { clientId, name: '', email: '' };
        try {
          const parsed = JSON.parse(toolRawInput);
          toolInput = { clientId, ...parsed };
        } catch {
          console.error('[chat] failed to parse tool input:', toolRawInput);
        }

        // Fire email (non-blocking)
        if (toolInput.name && toolInput.email) {
          sendLeadEmail(toolInput, clientId).catch(console.error);
        }

        /* ── Second pass: give Claude the tool result ── */
        const followUpMessages: Anthropic.MessageParam[] = [
          ...sanitisedMessages,
          {
            role: 'assistant',
            content: [{
              type: 'tool_use' as const,
              id:    toolUseId,
              name:  'capture_lead',
              input: toolInput,
            }],
          },
          {
            role: 'user',
            content: [{
              type:        'tool_result' as const,
              tool_use_id: toolUseId,
              content:     'Lead captured successfully.',
            }],
          },
        ];

        const followUpStream = anthropic.messages.stream({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 256,
          system:     config.systemPrompt,
          messages:   followUpMessages,
          tools:      [captureLeadTool],
        });

        for await (const event of followUpStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            enqueue(event.delta.text);
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const message = err instanceof Anthropic.APIError ? err.message : 'Unexpected error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':     'text/event-stream',
      'Cache-Control':    'no-cache, no-transform',
      'Connection':       'keep-alive',
      'X-Accel-Buffering':'no',
    },
  });
}
