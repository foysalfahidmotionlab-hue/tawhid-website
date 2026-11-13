import { useState } from 'react';
import { api } from '../lib/api';
import { Card, PageHeader, Btn, Field, Notice, inputCls } from './ui';

export default function AccountSettings({ me }) {
  const [f, setF] = useState({ current: '', next: '', repeat: '' });
  const [msg, setMsg] = useState({ tone: 'ok', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <>
      <PageHeader title="Account" subtitle={`Signed in as ${me.name} (${me.email})`} />
      <Card title="Change password" className="max-w-lg">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (f.next !== f.repeat) return setMsg({ tone: 'error', text: 'The new passwords do not match.' });
            setBusy(true);
            try {
              await api('/admin/password', { method: 'POST', body: { current: f.current, next: f.next } });
              setF({ current: '', next: '', repeat: '' });
              setMsg({ tone: 'ok', text: 'Password changed. Other signed-in devices were signed out.' });
            } catch (er) {
              setMsg({ tone: 'error', text: er.message });
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-3"
        >
          <Field label="Current password"><input type="password" autoComplete="current-password" className={inputCls} value={f.current} onChange={set('current')} required /></Field>
          <Field label="New password" hint="At least 10 characters, with letters and numbers"><input type="password" autoComplete="new-password" className={inputCls} value={f.next} onChange={set('next')} required /></Field>
          <Field label="Repeat new password"><input type="password" autoComplete="new-password" className={inputCls} value={f.repeat} onChange={set('repeat')} required /></Field>
          <Notice tone={msg.tone}>{msg.text}</Notice>
          <Btn type="submit" variant="primary" busy={busy}>Change password</Btn>
        </form>
      </Card>
      <Card title="More admins" className="mt-6 max-w-lg">
        <p className="text-sm text-ink/70">
          To add another admin or reset a forgotten password, run this on the server:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-forest-950 p-3 text-xs text-cream">npm run admin:create -- name@example.com "Full Name"</pre>
      </Card>
    </>
  );
}
