import { useEffect, useState } from 'react';
import { adminGetContacts, adminMarkRead, adminDeleteContact, type ContactSubmission } from '../../api/contact';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminContact() {
  const [items, setItems]     = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const load = async () => {
    try {
      const data = await adminGetContacts();
      setItems(data);
    } catch {
      setError('Could not load messages. Check your connection and try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const open = async (item: ContactSubmission) => {
    setSelected(item);
    if (!item.isRead) {
      await adminMarkRead(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isRead: true } : i));
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    await adminDeleteContact(id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const unreadCount = items.filter(i => !i.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: 'var(--color-text-inverse)' }}>
          Contact Inbox
          {unreadCount > 0 && (
            <span
              className="ml-3 font-body text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              {unreadCount} new
            </span>
          )}
        </h1>
      </div>

      {loading && (
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading…
        </p>
      )}

      {!loading && error && (
        <p className="font-body text-sm" style={{ color: '#fca5a5' }}>{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          className="py-20 text-center font-body text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          No messages yet.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-140px)]">

          {/* Message list */}
          <div
            className="overflow-y-auto rounded divide-y"
            style={{ background: 'var(--color-bg-dark)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => open(item)}
                className="w-full text-left px-4 py-3 transition-colors duration-150 hover:bg-white/5"
                style={{
                  background: selected?.id === item.id ? 'rgba(255,255,255,0.08)' : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!item.isRead && (
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                        style={{ background: 'var(--color-accent)' }}
                      />
                    )}
                    <span
                      className={`font-body text-sm truncate ${!item.isRead ? 'font-semibold' : ''}`}
                      style={{ color: 'var(--color-text-inverse)' }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    className="font-body text-[11px] flex-shrink-0"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {formatDate(item.createdAt).split(',')[0]}
                  </span>
                </div>
                <p
                  className="font-body text-xs mt-0.5 truncate pl-4"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {item.subject || item.message.slice(0, 60)}
                </p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div
            className="rounded overflow-y-auto"
            style={{ background: 'var(--color-bg-dark)' }}
          >
            {!selected ? (
              <div
                className="h-full flex items-center justify-center font-body text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Select a message to read
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2
                      className="font-display text-xl"
                      style={{ color: 'var(--color-text-inverse)' }}
                    >
                      {selected.subject || '(No subject)'}
                    </h2>
                    <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      From{' '}
                      <a
                        href={`mailto:${selected.email}`}
                        className="underline underline-offset-2"
                        style={{ color: 'var(--color-accent-light)' }}
                      >
                        {selected.name}
                      </a>
                      {' '}·{' '}
                      <a
                        href={`mailto:${selected.email}`}
                        className="underline underline-offset-2"
                        style={{ color: 'var(--color-accent-light)' }}
                      >
                        {selected.email}
                      </a>
                    </p>
                    <p
                      className="font-body text-xs"
                      style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
                    >
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://mail.zoho.com/zm/#compose?to=${encodeURIComponent(selected.email)}&subject=${encodeURIComponent('Re: ' + (selected.subject ?? 'your message'))}&body=${encodeURIComponent(`Hi ${selected.name},\n\n`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-200"
                      style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                      }}
                    >
                      Reply in Zoho
                    </a>
                    <button
                      onClick={() => remove(selected.id)}
                      className="font-body text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-200"
                      style={{
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

                {/* Body */}
                <p
                  className="font-body text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'rgba(250,247,242,0.85)' }}
                >
                  {selected.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
