import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [clientRes, leadsRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
  ]);

  if (clientRes.error) return NextResponse.json({ error: clientRes.error.message }, { status: 500 });

  // filter leads by agent_id matching the client's agent_id
  const leads = (leadsRes.data ?? []).filter(l => l.agent_id === clientRes.data.agent_id);

  return NextResponse.json({ client: clientRes.data, leads });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const { error } = await supabase.from('clients').update(body).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
