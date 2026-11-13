import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { DISTRICTS, districtBn } from '../shared/districts';
import { Card, PageHeader, Btn, Field, Notice, Toggle, inputCls, money, useLoad, Badge } from './ui';

const EMPTY = { label: '', zone: 'dhaka', district: '', order_type: 'any', mode: 'flat', amount: '', free_from_bags: '', is_active: true };
const ZONE = { dhaka: 'Inside Dhaka', outside_dhaka: 'Outside Dhaka', district: 'Specific district' };
const TYPE = { any: 'Wholesale & retail', wholesale: 'Wholesale only', retail: 'Retail only' };

function describe(r) {
  const base = r.mode === 'free' ? 'Free' : r.mode === 'flat' ? `${money(r.amount)} per order` : `${money(r.amount)} per bag`;
  return r.free_from_bags ? `${base} · free from ${r.free_from_bags} bags` : base;
}

function RateForm({ initial, onSave, onCancel, saving, error }) {
  const [f, setF] = useState({ ...EMPTY, ...initial, district: initial?.district || '', amount: initial?.amount ?? '', free_from_bags: initial?.free_from_bags ?? '', is_active: initial ? !!initial.is_active : true });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Area">
          <select className={inputCls} value={f.zone} onChange={set('zone')}>
            {Object.entries(ZONE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        {f.zone === 'district' && (
          <Field label="District">
            <select className={inputCls} value={f.district} onChange={set('district')} required>
              <option value="">Choose…</option>
              {DISTRICTS.map((d) => <option key={d.en} value={d.en}>{d.en} — {d.bn}</option>)}
            </select>
          </Field>
        )}
        <Field label="Order type">
          <select className={inputCls} value={f.order_type} onChange={set('order_type')}>
            {Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Charge type">
          <select className={inputCls} value={f.mode} onChange={set('mode')}>
            <option value="flat">Flat — per order</option>
            <option value="per_bag">Per bag (quantity based)</option>
            <option value="free">Free delivery</option>
          </select>
        </Field>
        {f.mode !== 'free' && (
          <Field label={f.mode === 'flat' ? 'Charge per order (৳)' : 'Charge per bag (৳)'}>
            <input className={inputCls} inputMode="numeric" value={f.amount} onChange={(e) => setF((x) => ({ ...x, amount: e.target.value.replace(/\D/g, '') }))} required />
          </Field>
        )}
        <Field label="Free from (bags)" hint="Optional — free when the order has this many bags">
          <input className={inputCls} inputMode="numeric" value={f.free_from_bags} onChange={(e) => setF((x) => ({ ...x, free_from_bags: e.target.value.replace(/\D/g, '') }))} />
        </Field>
        <Field label="Label (shown to admins)" className="lg:col-span-2">
          <input className={inputCls} value={f.label} onChange={set('label')} placeholder="e.g. Dhaka city retail" />
        </Field>
      </div>
      <Toggle checked={f.is_active} onChange={(v) => setF((x) => ({ ...x, is_active: v }))} label="Active" />
      <Notice>{error}</Notice>
      <div className="flex gap-2">
        <Btn type="submit" variant="primary" busy={saving}>Save rate</Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </form>
  );
}

export default function Delivery() {
  const { data, error, reload } = useLoad('/admin/delivery-rates');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const save = async (f) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') await api('/admin/delivery-rates', { method: 'POST', body: f });
      else await api(`/admin/delivery-rates/${editing}`, { method: 'PUT', body: f });
      setEditing(null);
      reload();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Delivery charges"
        subtitle="Charges are calculated on the server from these rates. If no rate matches, the customer sees “delivery charge to be confirmed” and you set it on the order."
        actions={<Btn variant="primary" onClick={() => { setEditing('new'); setFormError(''); }}><Plus className="h-4 w-4" /> Add rate</Btn>}
      />
      <Notice>{error}</Notice>

      <Card className="mb-6">
        <p className="text-sm text-ink/70">
          <strong>How a rate is chosen:</strong> a rate for the customer’s <em>specific district</em> wins over “Inside / Outside Dhaka”, and a rate for the order’s type (wholesale or retail) wins over “Wholesale & retail”.
          Inside Dhaka means Dhaka district; add district rates for Gazipur, Narayanganj and others as needed.
        </p>
      </Card>

      {editing === 'new' && (
        <Card title="New delivery rate" className="mb-6">
          <RateForm onSave={save} onCancel={() => setEditing(null)} saving={saving} error={formError} />
        </Card>
      )}

      <Card pad={false}>
        {data?.length === 0 && <p className="p-6 text-sm text-ink/55">No delivery rates yet — every order will show “delivery charge to be confirmed” until you add one.</p>}
        <ul className="divide-y divide-forest-900/[0.06]">
          {data?.map((r) => (
            <li key={r.id} className="px-5 py-4">
              {editing === r.id ? (
                <RateForm initial={r} onSave={save} onCancel={() => setEditing(null)} saving={saving} error={formError} />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-forest-950">{r.label}</p>
                    <p className="text-sm text-ink/60">
                      {r.zone === 'district' ? `${r.district} (${districtBn(r.district)})` : ZONE[r.zone]} · {TYPE[r.order_type]}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{describe(r)}</span>
                  {!r.is_active && <Badge className="bg-slate-100 text-slate-700 ring-slate-200">Inactive</Badge>}
                  <Btn variant="ghost" onClick={() => { setEditing(r.id); setFormError(''); }}><Pencil className="h-4 w-4" /> Edit</Btn>
                  <Btn variant="danger" onClick={async () => { if (window.confirm(`Delete “${r.label}”?`)) { await api(`/admin/delivery-rates/${r.id}`, { method: 'DELETE' }); reload(); } }}>
                    <Trash2 className="h-4 w-4" />
                  </Btn>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
