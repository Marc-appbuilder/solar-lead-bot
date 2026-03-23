import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId') ?? 'demo';

  // Try Supabase first — allows teaser_text (and brand_color) to be edited without deploys
  const { data: dbClient } = await supabase
    .from('clients')
    .select('brand_color, teaser_text')
    .eq('agent_id', clientId)
    .maybeSingle();

  // Fall back to static config for colour if not in DB
  const staticConfig = getClient(clientId);
  const brandColour  = dbClient?.brand_color ?? staticConfig.brandColour;
  const teaserText   = dbClient?.teaser_text ?? staticConfig.teaserText ?? null;

  return NextResponse.json({ brandColour, teaserText });
}
