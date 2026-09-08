import { NextRequest, NextResponse } from 'next/server';
import { clients } from '@/lib/clients';
import { supabase } from '@/lib/supabase';
import { buildPrompt, type ProvisioningFields } from '@/lib/chatacus/promptTemplate';

/**
 * Chatacus provisioning endpoint — creates a new Chatacus-provisioned
 * client row in the same `clients` table 'solar-demo'/'landing-demo'
 * live in. Never touches an existing row; only ever inserts. Mirrors
 * Vaughan's and Bloom's app/api/chatacus/provision/route.ts exactly,
 * adapted to Sunny Jim's onboarding fields.
 */

const RATE_LIMIT = 10;
const WINDOW_MS  = 10 * 60 * 1000;
const ipCounts   = new Map<string, { count: number; resetAt: number }>();

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

const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMBED_BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://app.solardesk.co.uk';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'client'
  );
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

async function generateUniqueAgentId(businessName: string): Promise<string> {
  const base = slugify(businessName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${base}-${randomSuffix()}`;
    if (clients[candidate]) continue;
    const { data } = await supabase
      .from('clients')
      .select('agent_id')
      .eq('agent_id', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new Error('Could not generate a unique agentId after 5 attempts');
}

interface ProvisionRequestBody {
  businessName?: string;
  contactEmail?: string;
  chatacusCustomerId?: string;
  phone?: string;
  serviceArea?: string;
  tone?: 'warm' | 'professional' | 'energetic';
  brandColour?: string;
  assistantDisplayName?: string;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const secret = req.headers.get('x-chatacus-secret');
  if (!secret || secret !== process.env.CHATACUS_PROVISION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ProvisionRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    businessName,
    contactEmail,
    chatacusCustomerId,
    phone,
    serviceArea,
    tone,
    brandColour,
    assistantDisplayName,
  } = body;

  if (!businessName?.trim()) {
    return NextResponse.json({ error: 'businessName is required' }, { status: 400 });
  }
  if (!contactEmail?.trim() || !EMAIL_RE.test(contactEmail)) {
    return NextResponse.json({ error: 'A valid contactEmail is required' }, { status: 400 });
  }
  if (!chatacusCustomerId?.trim()) {
    return NextResponse.json({ error: 'chatacusCustomerId is required' }, { status: 400 });
  }

  const promptFields: ProvisioningFields = {
    businessName,
    contactEmail,
    phone,
    serviceArea,
    tone,
  };
  const systemPrompt = buildPrompt(promptFields);

  let agentId: string;
  try {
    agentId = await generateUniqueAgentId(businessName);
  } catch (err) {
    console.error('[chatacus/provision] agentId generation failed:', err);
    return NextResponse.json({ error: 'Could not generate a unique agentId, please retry' }, { status: 500 });
  }

  const { error } = await supabase.from('clients').insert({
    agent_id:              agentId,
    name:                  businessName,
    email:                 contactEmail,
    notification_email:    contactEmail,
    phone:                 phone ?? null,
    brand_color:           brandColour ?? '#f97316',
    status:                'active',
    widget_position:       'bottom-right',
    language:              'english',
    system_prompt:         systemPrompt,
    provisioned_via:       'chatacus-v1',
    assistant_display_name: assistantDisplayName ?? null,
    chatacus_customer_id:  chatacusCustomerId,
    provisioning_meta: {
      businessName,
      contactEmail,
      phone:       phone ?? null,
      serviceArea: serviceArea ?? null,
      tone:        tone ?? null,
      brandColour: brandColour ?? null,
      assistantDisplayName: assistantDisplayName ?? null,
      submittedAt: new Date().toISOString(),
    },
  });

  if (error) {
    console.error('[chatacus/provision] insert error:', error);
    return NextResponse.json({ error: 'Failed to provision client' }, { status: 500 });
  }

  return NextResponse.json(
    {
      agentId,
      embedSnippet: `<script src="${EMBED_BASE}/embed.js?clientId=${agentId}" async></script>`,
    },
    { status: 201 }
  );
}
