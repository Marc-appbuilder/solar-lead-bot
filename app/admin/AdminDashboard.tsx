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
  phone: string | null;
  website: string | null;
  brand_color: string;
  status: 'active' | 'inactive';
}

interface Lead {
  id: string;
  created_at: string;
  agent_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  enquiry_type: string | null;
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

const EMBED_BASE = 'https://app.vaughanai.co';

function embedSnippet(client: Client) {
  return `<script src="${EMBED_BASE}/embed.js" data-client="${client.agent_id}" data-color="${client.brand_color}"></script>`;
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
    const res = await fetch(`/api/clients/${client.id}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
    }
    setDetailLoading(false);
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
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>▶</div>
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
          { key: 'name',         label: 'Agency name *',    placeholder: 'Avenue Estates' },
          { key: 'agent_id',     label: 'Agent ID *',       placeholder: 'avenue-estates' },
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
          <button onClick={() => setView('list')} style={{ ...ghostBtn, fontSize: '14px' }}>← Back</button>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{selected.name}</span>
          <span style={{
            background: selected.status === 'active' ? '#0a2e1a' : '#1f1f1f',
            color: selected.status === 'active' ? '#34d399' : '#6b7280',
            fontSize: '10px', fontWeight: 700, borderRadius: '99px', padding: '3px 10px',
          }}>
            {selected.status}
          </span>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Client info card */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selected.contact_name && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Contact</span>
                  <span style={{ fontSize: '13px' }}>{selected.contact_name}</span>
                </div>
              )}
              {selected.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Email</span>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none' }}>{selected.email}</a>
                </div>
              )}
              {selected.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Phone</span>
                  <a href={`tel:${selected.phone}`} style={{ fontSize: '13px', color: '#60a5fa', textDecoration: 'none' }}>{selected.phone}</a>
                </div>
              )}
              {selected.website && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Website</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{selected.website}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Agent ID</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{selected.agent_id}</span>
              </div>
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
                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{lead.name}</span>
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
