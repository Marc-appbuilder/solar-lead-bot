import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import type { LeadPayload } from '@/app/api/lead/route';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');
}

/* ── Rate limiting ──────────────────────────────────────────────────────── */
const RATE_LIMIT    = 30;          // max API calls per IP per window
const WINDOW_MS     = 10 * 60 * 1000;
const MAX_MSG_LEN   = 500;
const MAX_HISTORY   = 30;          // max messages in a single conversation

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
    'Call this tool as soon as the user provides their mobile number (step 6). ' +
    'Include all fields collected during the conversation. ' +
    'Never skip this tool because a field is missing — call it with whatever was collected.',
  input_schema: {
    type: 'object' as const,
    properties: {
      phone:          { type: 'string', description: 'Mobile number provided in step 6' },
      postcode:       { type: 'string', description: 'UK postcode provided in step 2' },
      owns_property:  { type: 'boolean', description: 'Whether they own the property (step 3)' },
      monthly_bill:   { type: 'string', enum: ['Under £100', '£100–£150', '£150–£250', '£250+'], description: 'Average monthly electricity bill (step 4)' },
      roof_photo_url: { type: 'string', description: 'URL of roof or fuse box photo if provided in step 5, otherwise omit' },
      summary:        { type: 'string', description: 'One sentence summary of the lead' },
    },
    required: ['phone'],
  },
};

/* ── Email helpers ──────────────────────────────────────────────────────── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHtml(lead: LeadPayload, clientName: string, brandColour: string): string {
  const isGold = lead.owns_property === true &&
    (lead.monthly_bill === '£150–£250' || lead.monthly_bill === '£250+');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<style>
  body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0;background:#f5f5f5}
  .wrapper{max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
  .header{background:${brandColour};color:#fff;padding:24px 32px}
  .header h1{margin:0;font-size:20px;font-weight:700}
  .header p{margin:4px 0 0;font-size:13px;opacity:.8}
  .gold{display:inline-block;background:#fbbf24;color:#78350f;font-size:12px;font-weight:700;padding:3px 10px;border-radius:99px;margin-top:8px}
  .body{padding:28px 32px}
  table{border-collapse:collapse;width:100%}
  td{padding:10px 14px;border:1px solid #e8e8e8;vertical-align:top;font-size:14px}
  td:first-child{background:#f9f9f9;font-weight:600;width:140px;color:#555}
  .summary{margin-top:20px;background:#f9f9f9;border-left:4px solid ${brandColour};padding:14px 18px;border-radius:4px;font-size:14px;white-space:pre-wrap;color:#333}
  .footer{margin-top:24px;font-size:11px;color:#aaa}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>New solar lead — ${escapeHtml(clientName)}</h1>
    <p>${new Date().toUTCString()}</p>
    ${isGold ? '<span class="gold">⭐ Gold Lead</span>' : ''}
  </div>
  <div class="body">
    <table>
      <tr><td>Phone</td><td>${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:${brandColour}">${escapeHtml(lead.phone)}</a>` : '<span style="color:#aaa">Not provided</span>'}</td></tr>
      <tr><td>Postcode</td><td>${lead.postcode ? escapeHtml(lead.postcode) : '<span style="color:#aaa">Not provided</span>'}</td></tr>
      <tr><td>Owns property</td><td>${lead.owns_property === true ? 'Yes' : lead.owns_property === false ? 'No' : '<span style="color:#aaa">Unknown</span>'}</td></tr>
      <tr><td>Monthly bill</td><td>${lead.monthly_bill ? escapeHtml(lead.monthly_bill) : '<span style="color:#aaa">Not provided</span>'}</td></tr>
      ${lead.roof_photo_url ? `<tr><td>Roof photo</td><td><a href="${escapeHtml(lead.roof_photo_url)}" style="color:${brandColour}">View photo</a></td></tr>` : ''}
    </table>
    ${lead.summary ? `<div class="summary"><strong>Summary:</strong>\n${escapeHtml(lead.summary)}</div>` : ''}
    <div class="footer">Sent automatically by SolarDesk</div>
  </div>
</div>
</body></html>`;
}

async function sendLeadEmail(lead: LeadPayload, clientId: string) {
  const config = getClient(clientId);
  const { error } = await getResend().emails.send({
    from: 'SolarDesk <leads@solardesk.co.uk>',
    to: config.notificationEmail,
    subject: `New solar lead — ${config.name}`,
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

  // Fetch language setting from Supabase
  let languageInstruction = '';
  const { data: clientRow } = await supabase
    .from('clients')
    .select('language')
    .eq('agent_id', clientId)
    .maybeSingle();
  const language = clientRow?.language ?? 'english';
  if (language === 'welsh') {
    languageInstruction = '\n\nAlways respond in Welsh (Cymraeg) only regardless of what language the user writes in.';
  } else if (language === 'bilingual') {
    languageInstruction = '\n\nYou support English and Welsh languages only. Detect whether the user is writing in English or Welsh and respond in the same language. If unsure, default to English.';
  }
  const systemPrompt = config.systemPrompt + languageInstruction;

  const sanitisedMessages: Anthropic.MessageParam[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY)
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
          system:     systemPrompt,
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
        let toolInput: LeadPayload = { clientId };
        try {
          const parsed = JSON.parse(toolRawInput);
          toolInput = { clientId, ...parsed };
        } catch {
          console.error('[chat] failed to parse tool input:', toolRawInput);
        }

        // Fire email and save to Supabase as long as we have a phone number
        if (toolInput.phone) {
          // Duplicate suppression: skip email if same phone already captured in last 24h
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          let isDuplicate = false;
          const { data } = await supabase.from('leads')
            .select('id').eq('agent_id', clientId).eq('phone', toolInput.phone)
            .gte('created_at', cutoff).limit(1);
          if (data && data.length > 0) isDuplicate = true;
          if (!isDuplicate) sendLeadEmail(toolInput, clientId).catch(console.error);
          const isGold = toolInput.owns_property === true &&
            (toolInput.monthly_bill === '£150–£250' || toolInput.monthly_bill === '£250+');
          supabase.from('leads').insert({
            agent_id:         clientId,
            phone:            toolInput.phone,
            postcode:         toolInput.postcode ?? null,
            owns_property:    toolInput.owns_property ?? null,
            monthly_bill:     toolInput.monthly_bill ?? null,
            roof_photo_url:   toolInput.roof_photo_url ?? null,
            gold:             isGold,
            notes:            toolInput.summary ?? null,
            raw_conversation: sanitisedMessages
              .map((m) => `${m.role}: ${m.content}`)
              .join('\n'),
          }).then(({ error }) => {
            if (error) console.error('[lead] supabase insert error:', error);
          });
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
          system:     systemPrompt,
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
