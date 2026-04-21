'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

async function signOut() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  await supabase.auth.signOut();
  window.location.href = '/login';
}

interface Client {
  id: string;
  created_at: string;
  agent_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  notification_email: string | null;
  phone: string | null;
  website: string | null;
  brand_color: string;
  status: 'active' | 'inactive';
  teaser_text: string | null;
  border_colour: string | null;
  widget_position: string | null;
  language: string | null;
  bot_name: string | null;
}

interface Lead {
  id: string;
  created_at: string;
  agent_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postcode: string | null;
  monthly_bill: string | null;
  owns_property: boolean | null;
  gold: boolean | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'dead';
  raw_conversation: string | null;
}

const LEAD_STATUS: Record<string, { bg: string; text: string }> = {
  new:       { bg: '#1e3a5f', text: '#60a5fa' },
  contacted: { bg: '#3d2e0a', text: '#fbbf24' },
  qualified: { bg: '#0a2e1a', text: '#34d399' },
  dead:      { bg: '#1f1f1f', text: '#6b7280' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const EMBED_BASE = 'https://app.solardesk.co';

function embedSnippet(client: Client) {
  return `<script src="${EMBED_BASE}/embed.js?clientId=${client.agent_id}" async></script>`;
}

const EMPTY_FORM: {
  name: string; agent_id: string; contact_name: string; email: string;
  phone: string; website: string; brand_color: string; status: 'active' | 'inactive';
} = {
  name: '', agent_id: '', contact_name: '', email: '',
  phone: '', website: '', brand_color: '#b8882e', status: 'active',
};

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState<'list' | 'detail' | 'add'>('list');
  const [selected, setSelected] = useState<Client | null>(null);
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [teaserDraft, setTeaserDraft]   = useState<string>('');
  const [teaserSaving, setTeaserSaving] = useState(false);
  const [teaserSaved, setTeaserSaved]   = useState(false);
  const [colorDraft, setColorDraft]         = useState<string>('');
  const [colorSaving, setColorSaving]       = useState(false);
  const [colorSaved, setColorSaved]         = useState(false);
  const [borderDraft, setBorderDraft]       = useState<string>('');
  const [borderSaving, setBorderSaving]     = useState(false);
  const [borderSaved, setBorderSaved]       = useState(false);
  const [positionDraft, setPositionDraft]   = useState<string>('bottom-right');
  const [positionSaving, setPositionSaving] = useState(false);
  const [positionSaved, setPositionSaved]   = useState(false);
  const [positionResetting, setPositionResetting] = useState(false);
  const [positionReset, setPositionReset]   = useState(false);
  const [infoDraft, setInfoDraft] = useState({ contact_name: '', email: '', notification_email: '', phone: '', website: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved]   = useState(false);
  const [languageDraft, setLanguageDraft]   = useState<string>('english');
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageSaved, setLanguageSaved]   = useState(false);
  const [botNameDraft, setBotNameDraft]     = useState<string>('');
  const [botNameSaving, setBotNameSaving]   = useState(false);
  const [botNameSaved, setBotNameSaved]     = useState(false);

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/clients');
    if (res.ok) setClients(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  async function openClient(client: Client) {
    setSelected(client);
    setView('detail');
    setDetailLoading(true);
    setExpandedLead(null);
    setTeaserDraft(client.teaser_text ?? '');
    setTeaserSaved(false);
    setColorDraft(client.brand_color ?? '');
    setColorSaved(false);
    setBorderDraft(client.border_colour ?? '');
    setBorderSaved(false);
    setPositionDraft(client.widget_position ?? 'bottom-right');
    setPositionSaved(false);
    setLanguageDraft(client.language ?? 'english');
    setLanguageSaved(false);
    setBotNameDraft(client.bot_name ?? '');
    setBotNameSaved(false);
    setInfoDraft({
      contact_name: client.contact_name ?? '',
      email: client.email ?? '',
      notification_email: client.notification_email ?? '',
      phone: client.phone ?? '',
      website: client.website ?? '',
    });
    setInfoSaved(false);
    const res = await fetch(`/api/clients/${client.id}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
    }
    setDetailLoading(false);
  }

  async function saveColor(clientId: string) {
    setColorSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_color: colorDraft }),
    });
    setColorSaving(false);
    setColorSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, brand_color: colorDraft } : c));
    setTimeout(() => setColorSaved(false), 2000);
  }

  async function saveBorderColour(clientId: string) {
    setBorderSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ border_colour: borderDraft || null }),
    });
    setBorderSaving(false);
    setBorderSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, border_colour: borderDraft || null } : c));
    setTimeout(() => setBorderSaved(false), 2000);
  }

  async function savePosition(clientId: string) {
    setPositionSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widget_position: positionDraft }),
    });
    setPositionSaving(false);
    setPositionSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, widget_position: positionDraft } : c));
    setTimeout(() => setPositionSaved(false), 2000);
  }

  async function resetPosition(clientId: string) {
    setPositionResetting(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widget_position: 'bottom-right' }),
    });
    setPositionResetting(false);
    setPositionReset(true);
    setPositionDraft('bottom-right');
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, widget_position: 'bottom-right' } : c));
    setTimeout(() => setPositionReset(false), 2000);
  }

  async function saveTeaser(clientId: string) {
    setTeaserSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teaser_text: teaserDraft || null }),
    });
    setTeaserSaving(false);
    setTeaserSaved(true);
    setTimeout(() => setTeaserSaved(false), 2000);
  }

  async function saveLanguage(clientId: string) {
    setLanguageSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: languageDraft }),
    });
    setLanguageSaving(false);
    setLanguageSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, language: languageDraft } : c));
    setTimeout(() => setLanguageSaved(false), 2000);
  }

  async function saveBotName(clientId: string) {
    setBotNameSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bot_name: botNameDraft || null }),
    });
    setBotNameSaving(false);
    setBotNameSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, bot_name: botNameDraft || null } : c));
    setTimeout(() => setBotNameSaved(false), 2000);
  }

  async function saveInfo(clientId: string) {
    setInfoSaving(true);
    await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_name: infoDraft.contact_name || null,
        email: infoDraft.email || null,
        notification_email: infoDraft.notification_email || null,
        phone: infoDraft.phone || null,
        website: infoDraft.website || null,
      }),
    });
    setInfoSaving(false);
    setInfoSaved(true);
    setClients(prev => prev.map(c => c.id === clientId ? {
      ...c,
      contact_name: infoDraft.contact_name || null,
      email: infoDraft.email || null,
      notification_email: infoDraft.notification_email || null,
      phone: infoDraft.phone || null,
      website: infoDraft.website || null,
    } : c));
    if (selected?.id === clientId) {
      setSelected(prev => prev ? {
        ...prev,
        contact_name: infoDraft.contact_name || null,
        email: infoDraft.email || null,
        notification_email: infoDraft.notification_email || null,
        phone: infoDraft.phone || null,
        website: infoDraft.website || null,
      } : prev);
    }
    setTimeout(() => setInfoSaved(false), 2000);
  }

  async function toggleStatus(client: Client) {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
    await fetch(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function submitNew() {
    if (!form.name || !form.agent_id) return;
    setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchClients();
      setForm(EMPTY_FORM);
      setView('list');
    }
    setSaving(false);
  }

  function copyEmbed(client: Client) {
    navigator.clipboard.writeText(embedSnippet(client));
    setCopied(client.id);
    setTimeout(() => setCopied(null), 2000);
  }

  // ── Shared styles ──────────────────────────────────────────
  const page: React.CSSProperties = {
    minHeight: '100dvh', background: '#0d0f14', color: '#e8eaf0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    WebkitFontSmoothing: 'antialiased',
  };

  const header: React.CSSProperties = {
    padding: '20px 16px 16px', background: '#0a0c10',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky', top: 0, zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  const card: React.CSSProperties = {
    background: '#1a1d26', borderRadius: '14px', overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.04)',
  };

  const goldBtn: React.CSSProperties = {
    background: '#b8882e', color: '#fff', border: 'none',
    borderRadius: '10px', padding: '9px 16px', fontSize: '13px',
    fontWeight: 700, cursor: 'pointer',
  };

  const ghostBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
    border: 'none', borderRadius: '8px', padding: '7px 12px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  };

  const input: React.CSSProperties = {
    background: '#1a1d26', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '11px 14px', color: '#e8eaf0',
    fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none',
  };

  const label: React.CSSProperties = {
    fontSize: '11px', color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
  };

  // ── LIST VIEW ──────────────────────────────────────────────
  if (view === 'list') return (
    <div style={page}>
      <div style={header}>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: '20px' }}>Admin</span>
          <div style={{ marginTop: '4px' }}>
            <a href="/dashboard" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>← Dashboard</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={signOut} style={ghostBtn}>Sign out</button>
          <button style={goldBtn} onClick={() => setView('add')}>+ Add</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '60px', fontSize: '14px' }}>
            Loading clients…
          </p>
        )}
        {!loading && clients.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '60px', fontSize: '14px' }}>
            No clients yet — add your first one.
          </p>
        )}

        {clients.map(client => (
          <div key={client.id} style={card}>
            {/* Top row — clickable */}
            <div
              onClick={() => openClient(client)}
              style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{client.name}</span>
                    <span style={{
                      background: client.status === 'active' ? '#0a2e1a' : '#1f1f1f',
                      color: client.status === 'active' ? '#34d399' : '#6b7280',
                      fontSize: '10px', fontWeight: 700, borderRadius: '99px',
                      padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {client.status}
                    </span>
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: client.brand_color, display: 'inline-block', flexShrink: 0,
                    }} />
                  </div>
                  <div style={{ marginTop: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {client.contact_name && <span>{client.contact_name}</span>}
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>{client.phone}</span>}
                  </div>
                  {client.website && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                      {client.website}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>›</div>
              </div>
            </div>

            {/* Bottom row — actions */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '10px 16px', display: 'flex', gap: '8px',
            }}>
              <button
                onClick={() => copyEmbed(client)}
                style={{
                  ...ghostBtn,
                  color: copied === client.id ? '#34d399' : 'rgba(255,255,255,0.6)',
                }}
              >
                {copied === client.id ? '✓ Copied' : '⟨/⟩ Copy embed'}
              </button>
              <button onClick={() => toggleStatus(client)} style={ghostBtn}>
                {client.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── ADD CLIENT ─────────────────────────────────────────────
  if (view === 'add') return (
    <div style={page}>
      <div style={header}>
        <button onClick={() => setView('list')} style={{ ...ghostBtn, fontSize: '14px' }}>← Back</button>
        <span style={{ fontWeight: 700, fontSize: '18px' }}>New Client</span>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {([
          { key: 'name',         label: 'Client name *',    placeholder: "Steve's Solar" },
          { key: 'agent_id',     label: 'Client ID *',      placeholder: 'steves-solar' },
          { key: 'contact_name', label: 'Contact person',   placeholder: 'Jane Smith' },
          { key: 'email',        label: 'Email',            placeholder: 'jane@avenue.co.uk' },
          { key: 'phone',        label: 'Phone',            placeholder: '+44 7700 900000' },
          { key: 'website',      label: 'Website',          placeholder: 'https://avenue.co.uk' },
          { key: 'brand_color',  label: 'Brand colour',     placeholder: '#b8882e' },
        ] as { key: keyof typeof EMPTY_FORM; label: string; placeholder: string }[]).map(f => (
          <div key={f.key}>
            <div style={label}>{f.label}</div>
            <input
              style={input}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}

        <div>
          <div style={label}>Status</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => setForm(prev => ({ ...prev, status: s }))} style={{
                padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
                border: `1px solid ${form.status === s ? '#b8882e' : 'rgba(255,255,255,0.1)'}`,
                background: form.status === s ? 'rgba(184,136,46,0.15)' : 'transparent',
                color: form.status === s ? '#b8882e' : 'rgba(255,255,255,0.35)',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={submitNew}
          disabled={saving || !form.name || !form.agent_id}
          style={{
            ...goldBtn, width: '100%', padding: '14px',
            fontSize: '15px', marginTop: '8px',
            opacity: saving || !form.name || !form.agent_id ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Create Client'}
        </button>
      </div>
    </div>
  );

  // ── CLIENT DETAIL ──────────────────────────────────────────
  if (view === 'detail' && selected) {
    const newLeads = leads.filter(l => l.status === 'new').length;

    return (
      <div style={page}>
        <div style={header}>
          <button onClick={() => setView('list')} style={{ ...ghostBtn, fontSize: '14px' }}>← Clients</button>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{selected.name}</span>
          <button
            onClick={() => setView('list')}
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Close"
          >✕</button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Client info card — editable */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Contact info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {([
                { key: 'contact_name', label: 'Contact name', type: 'text', placeholder: 'Jane Smith' },
                { key: 'email',        label: 'Email',         type: 'email', placeholder: 'jane@example.com' },
                { key: 'notification_email', label: 'Notification email', type: 'email', placeholder: 'alerts@example.com' },
                { key: 'phone',        label: 'Phone',         type: 'tel',   placeholder: '+44 1202 512354' },
                { key: 'website',      label: 'Website',       type: 'url',   placeholder: 'https://example.com' },
              ] as { key: keyof typeof infoDraft; label: string; type: string; placeholder: string }[]).map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '3px' }}>{label}</label>
                  <input
                    type={type}
                    value={infoDraft[key]}
                    placeholder={placeholder}
                    onChange={e => setInfoDraft(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ ...input, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => saveInfo(selected.id)}
              disabled={infoSaving}
              style={{ ...ghostBtn, width: '100%', color: infoSaved ? '#34d399' : 'rgba(255,255,255,0.6)' }}
            >
              {infoSaving ? 'Saving…' : infoSaved ? '✓ Saved' : 'Save contact info'}
            </button>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Agent ID</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{selected.agent_id}</span>
            </div>
          </div>

          {/* Embed code */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Embed code
            </div>
            <div style={{
              background: '#0d0f14', borderRadius: '8px', padding: '10px 12px',
              fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace',
              wordBreak: 'break-all', lineHeight: 1.6, marginBottom: '10px',
            }}>
              {embedSnippet(selected)}
            </div>
            <button
              onClick={() => copyEmbed(selected)}
              style={{
                ...ghostBtn,
                color: copied === selected.id ? '#34d399' : 'rgba(255,255,255,0.6)',
                width: '100%',
              }}
            >
              {copied === selected.id ? '✓ Copied!' : '⟨/⟩ Copy embed code'}
            </button>
          </div>

          {/* Brand colour */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Brand colour
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="color"
                value={colorDraft}
                onChange={e => setColorDraft(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none', padding: 0 }}
              />
              <input
                style={{ ...input, flex: 1 }}
                placeholder="#1c1c1c"
                value={colorDraft}
                onChange={e => setColorDraft(e.target.value)}
              />
            </div>
            <button
              onClick={() => saveColor(selected.id)}
              disabled={colorSaving}
              style={{
                ...ghostBtn, width: '100%',
                color: colorSaved ? '#34d399' : 'rgba(255,255,255,0.6)',
              }}
            >
              {colorSaving ? 'Saving…' : colorSaved ? '✓ Saved' : 'Save colour'}
            </button>
          </div>

          {/* Border colour */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Teaser border colour
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }}>
              Leave blank to use brand colour
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="color"
                value={borderDraft || '#000000'}
                onChange={e => setBorderDraft(e.target.value)}
                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none', padding: 0 }}
              />
              <input
                style={{ ...input, flex: 1 }}
                placeholder="leave blank to use brand colour"
                value={borderDraft}
                onChange={e => setBorderDraft(e.target.value)}
              />
            </div>
            <button
              onClick={() => saveBorderColour(selected.id)}
              disabled={borderSaving}
              style={{
                ...ghostBtn, width: '100%',
                color: borderSaved ? '#34d399' : 'rgba(255,255,255,0.6)',
              }}
            >
              {borderSaving ? 'Saving…' : borderSaved ? '✓ Saved' : 'Save border colour'}
            </button>
          </div>

          {/* Widget position */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Widget position
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {([
                { val: 'bottom-left',  label: '↙ Bottom left'  },
                { val: 'bottom-right', label: '↘ Bottom right' },
                { val: 'lower-left',   label: '↖ Lower left'   },
                { val: 'lower-right',  label: '↗ Lower right'  },
                { val: 'middle-left',  label: '← Middle left'  },
                { val: 'middle-right', label: '→ Middle right' },
              ] as { val: string; label: string }[]).map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setPositionDraft(opt.val)}
                  style={{
                    padding: '9px 8px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, textAlign: 'center',
                    border: `1px solid ${positionDraft === opt.val ? '#b8882e' : 'rgba(255,255,255,0.08)'}`,
                    background: positionDraft === opt.val ? 'rgba(184,136,46,0.15)' : 'rgba(255,255,255,0.03)',
                    color: positionDraft === opt.val ? '#b8882e' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => savePosition(selected.id)}
              disabled={positionSaving}
              style={{
                ...ghostBtn, width: '100%',
                color: positionSaved ? '#34d399' : 'rgba(255,255,255,0.6)',
              }}
            >
              {positionSaving ? 'Saving…' : positionSaved ? '✓ Saved' : 'Save position'}
            </button>
            <button
              onClick={() => resetPosition(selected.id)}
              disabled={positionResetting}
              style={{
                ...ghostBtn, width: '100%', marginTop: '6px',
                color: positionReset ? '#34d399' : 'rgba(255,255,255,0.35)',
                fontSize: '11px',
              }}
            >
              {positionResetting ? 'Resetting…' : positionReset ? '✓ Reset to bottom-right' : '↺ Reset to default (bottom-right)'}
            </button>
          </div>

          {/* Teaser text */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Teaser label
            </div>
            <input
              style={{ ...input, marginBottom: '10px' }}
              placeholder="e.g. Get a free solar quote!"
              value={teaserDraft}
              onChange={e => setTeaserDraft(e.target.value)}
            />
            <button
              onClick={() => saveTeaser(selected.id)}
              disabled={teaserSaving}
              style={{
                ...ghostBtn, width: '100%',
                color: teaserSaved ? '#34d399' : 'rgba(255,255,255,0.6)',
              }}
            >
              {teaserSaving ? 'Saving…' : teaserSaved ? '✓ Saved' : 'Save teaser'}
            </button>
          </div>

          {/* Language */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Language
            </div>
            <select
              value={languageDraft}
              onChange={e => setLanguageDraft(e.target.value)}
              style={{
                ...input,
                marginBottom: '10px',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="english">English only</option>
              <option value="welsh">Welsh only</option>
              <option value="bilingual">Bilingual (English &amp; Welsh)</option>
            </select>
            <button
              onClick={() => saveLanguage(selected.id)}
              disabled={languageSaving}
              style={{
                ...ghostBtn, width: '100%',
                color: languageSaved ? '#34d399' : 'rgba(255,255,255,0.6)',
              }}
            >
              {languageSaving ? 'Saving…' : languageSaved ? '✓ Saved' : 'Save language'}
            </button>
          </div>

          {/* Bot name */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Bot name
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }}>
              Leave blank to use the default (Ray)
            </div>
            <input
              style={{ ...input, marginBottom: '10px' }}
              placeholder="Ray"
              value={botNameDraft}
              onChange={e => setBotNameDraft(e.target.value)}
            />
            <button
              onClick={() => saveBotName(selected.id)}
              disabled={botNameSaving}
              style={{ ...ghostBtn, width: '100%', color: botNameSaved ? '#34d399' : 'rgba(255,255,255,0.6)' }}
            >
              {botNameSaving ? 'Saving…' : botNameSaved ? '✓ Saved' : 'Save bot name'}
            </button>
          </div>

          {/* Leads */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Leads</span>
              {newLeads > 0 && (
                <span style={{
                  background: '#b8882e', color: '#fff',
                  fontSize: '10px', fontWeight: 700, borderRadius: '99px', padding: '2px 8px',
                }}>
                  {newLeads} new
                </span>
              )}
            </div>

            {detailLoading && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '30px' }}>
                Loading leads…
              </p>
            )}
            {!detailLoading && leads.length === 0 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '30px' }}>
                No leads yet.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leads.map(lead => {
                const isOpen = expandedLead === lead.id;
                const sc = LEAD_STATUS[lead.status] ?? LEAD_STATUS.new;
                return (
                  <div key={lead.id} style={{
                    ...card,
                    border: isOpen ? '1px solid rgba(184,136,46,0.25)' : '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div onClick={() => setExpandedLead(isOpen ? null : lead.id)}
                      style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{lead.phone ?? lead.name ?? 'Unknown'}</span>
                            <span style={{
                              background: sc.bg, color: sc.text,
                              fontSize: '10px', fontWeight: 700, borderRadius: '99px',
                              padding: '2px 8px', textTransform: 'uppercase',
                            }}>
                              {lead.status}
                            </span>
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {lead.phone && <span>{lead.phone}</span>}
                            {lead.email && <span>{lead.email}</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                          <div>{timeAgo(lead.created_at)}</div>
                          <div style={{ marginTop: '4px' }}>{isOpen ? '▲' : '▼'}</div>
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {lead.phone && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={`tel:${lead.phone}`} style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: '6px', padding: '10px 8px', borderRadius: '10px',
                              background: '#1e3a5f', color: '#60a5fa',
                              textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                            }}>📞 Call</a>
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: '6px', padding: '10px 8px', borderRadius: '10px',
                              background: '#0a2e1a', color: '#34d399',
                              textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                            }}>💬 WhatsApp</a>
                          </div>
                        )}
                        {lead.notes && (
                          <div style={{ background: '#0d0f14', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Summary</div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{lead.notes}</div>
                          </div>
                        )}
                        {lead.raw_conversation && (
                          <div style={{ background: '#0d0f14', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conversation</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                              {lead.raw_conversation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
