import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { paymentState } from '../shared/rules';

export const money = (n) => (n == null ? '—' : `৳ ${new Intl.NumberFormat('en-IN').format(n)}`);
export const dateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const STATUS_CLS = {
  pending: 'bg-amber-100 text-amber-900 ring-amber-200',
  confirmed: 'bg-sky-100 text-sky-900 ring-sky-200',
  processing: 'bg-indigo-100 text-indigo-900 ring-indigo-200',
  shipped: 'bg-violet-100 text-violet-900 ring-violet-200',
  delivered: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  cancelled: 'bg-rose-100 text-rose-900 ring-rose-200',
};
const PAY_CLS = { unpaid: 'bg-amber-50 text-amber-900 ring-amber-200', advance_paid: 'bg-sky-50 text-sky-900 ring-sky-200', paid: 'bg-emerald-50 text-emerald-900 ring-emerald-200', refunded: 'bg-slate-100 text-slate-700 ring-slate-200' };
export const PAY_LABEL = { unpaid: 'Unpaid', advance_paid: 'Advance paid', paid: 'Paid in full', refunded: 'Refunded' };
export const PLAN_LABEL = { advance10: '10% advance', delivery: 'Delivery charge in advance', advance50: '50% advance', full: 'Full payment in advance', cod: 'Cash on delivery' };

export const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}>{children}</span>
);
export const StatusBadge = ({ status }) => <Badge className={STATUS_CLS[status]}>{STATUS_LABEL[status]}</Badge>;
/** Pass the order (or {payment_status, amount_paid}); shows Unpaid / Advance paid / Paid in full / Refunded. */
export const PayBadge = ({ order }) => {
  const s = paymentState(order);
  return <Badge className={PAY_CLS[s]}>{PAY_LABEL[s]}</Badge>;
};
export const TypeBadge = ({ type }) => (
  <Badge className={type === 'wholesale' ? 'bg-forest-900 text-cream ring-forest-900' : 'bg-white text-forest-800 ring-forest-900/15'}>
    {type === 'wholesale' ? 'Wholesale' : 'Retail'}
  </Badge>
);

export function Card({ title, actions, children, className = '', pad = true }) {
  return (
    <section className={`rounded-2xl bg-white shadow-[0_1px_2px_rgba(14,36,22,0.06)] ring-1 ring-forest-900/[0.08] ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/[0.07] px-5 py-3.5">
          {title && <h2 className="font-semibold text-forest-950">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const BTN = {
  primary: 'bg-forest-800 text-white hover:bg-forest-700',
  gold: 'bg-gold text-forest-950 hover:bg-gold-light',
  secondary: 'bg-white text-forest-900 ring-1 ring-inset ring-forest-900/15 hover:bg-forest-50',
  danger: 'bg-white text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50',
  ghost: 'text-forest-800 hover:bg-forest-50',
};
export function Btn({ variant = 'secondary', busy, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      disabled={busy || rest.disabled}
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${BTN[variant]} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputCls =
  'w-full rounded-lg border border-forest-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest-600 focus:ring-2 focus:ring-forest-200';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-forest-900/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-forest-700' : 'bg-forest-900/20'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.15rem]' : 'left-0.5'}`} />
      </button>
      {label}
    </label>
  );
}

export function Notice({ tone = 'error', children }) {
  if (!children) return null;
  const cls = tone === 'error' ? 'bg-rose-50 text-rose-800 ring-rose-200' : 'bg-emerald-50 text-emerald-800 ring-emerald-200';
  return <p className={`rounded-lg px-3 py-2 text-sm ring-1 ring-inset ${cls}`}>{children}</p>;
}

/** Load data from the admin API; returns { data, error, loading, reload }. */
export function useLoad(path) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    api(path)
      .then((data) => setState({ data, error: '', loading: false }))
      .catch((e) => setState({ data: null, error: e.message, loading: false }));
  }, [path]);
  useEffect(reload, [reload]);
  return { ...state, reload };
}

/** Image upload button → returns optimised image URL from the server. */
export function UploadButton({ endpoint = '/admin/upload', kind, onUploaded, children = 'Upload image', variant = 'secondary' }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <span className="inline-flex flex-col gap-1">
      <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${BTN[variant]} ${busy ? 'opacity-60' : ''}`}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? 'Uploading…' : children}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setBusy(true);
            setErr('');
            try {
              const form = new FormData();
              form.append('image', file);
              const out = await api(`${endpoint}${kind ? `?kind=${kind}` : ''}`, { method: 'POST', form });
              onUploaded(out);
            } catch (er) {
              setErr(er.message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {err && <span className="text-xs text-rose-700">{err}</span>}
    </span>
  );
}
