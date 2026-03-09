import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/clients';

export interface LeadPayload {
  clientId: string;
  name: string;
  email: string;
  phone?: string;
  /** Optional: first message or note from the user */
  note?: string;
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildHtml(lead: LeadPayload, agencyName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #222; margin: 0; padding: 0; }
    .header { background: #1a365d; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 32px; }
    table { border-collapse: collapse; width: 100%; max-width: 480px; }
    td { padding: 10px 14px; border: 1px solid #e2e8f0; vertical-align: top; }
    td:first-child { background: #f7fafc; font-weight: bold; width: 130px; }
    .note { margin-top: 24px; background: #f7fafc; border-left: 4px solid #1a365d;
            padding: 14px 18px; border-radius: 4px; white-space: pre-wrap; }
    .footer { margin-top: 32px; font-size: 12px; color: #718096; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Lead — ${agencyName}</h1>
  </div>
  <div class="body">
    <p>A new lead has been captured via the EstateAssist widget.</p>
    <table>
      <tr><td>Name</td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
      ${lead.phone ? `<tr><td>Phone</td><td><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a></td></tr>` : ''}
      <tr><td>Time</td><td>${new Date().toUTCString()}</td></tr>
    </table>
    ${lead.note ? `<div class="note"><strong>Message:</strong>\n${escapeHtml(lead.note)}</div>` : ''}
    <div class="footer">Sent automatically by EstateAssist</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { clientId, name, email, phone, note } = body;

  if (!clientId || !name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: 'clientId, name, and email are required' },
      { status: 400 }
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const config = getClient(clientId);
  const transport = createTransport();

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? `"EstateAssist" <${process.env.SMTP_USER}>`,
      to: config.agentEmail,
      replyTo: email,
      subject: `New lead from ${name} — ${config.name}`,
      html: buildHtml({ clientId, name, email, phone, note }, config.name),
    });
  } catch (err) {
    console.error('[lead] email send failed:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
