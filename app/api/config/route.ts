import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId') ?? 'demo';
  const config = getClient(clientId);
  return NextResponse.json({ brandColour: config.brandColour });
}
