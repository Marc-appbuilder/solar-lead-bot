import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export interface LeadPayload {
  clientId: string;
  name?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  owns_property?: boolean;
  monthly_bill?: string;
  roof_photo_url?: string;
  summary?: string;
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(lead: LeadPayload, clientName: string, brandColour: string): string {
  const isGold = lead.owns_property === true &&
    (lead.monthly_bill === '£150–£250' || lead.monthly_bill === '£250+');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #222; margin: 0; padding: 0; background: #f5f5f5; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: ${brandColour}; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.8; }
    .gold-badge { display: inline-block; background: #fbbf24; color: #78350f; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px; margin-top: 8px; }
    .body { padding: 28px 32px; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 10px 14px; border: 1px solid #e8e8e8; vertical-align: top; font-size: 14px; }
    td:first-child { background: #f9f9f9; font-weight: 600; width: 140px; color: #555; }
    .summary { margin-top: 20px; background: #f9f9f9; border-left: 4px solid ${brandColour}; padding: 14px 18px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; color: #333; }
    .footer { margin-top: 24px; font-size: 11px; color: #aaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New solar lead — ${escapeHtml(clientName)}</h1>
      <p>${new Date().toUTCString()}</p>
      ${isGold ? '<span class="gold-badge">⭐ Gold Lead</span>' : ''}
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
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { clientId, phone } = body;

  if (!clientId || !phone?.trim()) {
    return NextResponse.json(
      { error: 'clientId and phone are required' },
      { status: 400 }
    );
  }

  const config = getClient(clientId);

  const { error } = await getResend().emails.send({
    from: 'SolarDesk <leads@solardesk.co>',
    to: config.notificationEmail,
    subject: `New solar lead — ${config.name}`,
    html: buildHtml(body, config.name, config.brandColour),
  });

  if (error) {
    console.error('[lead] resend error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
