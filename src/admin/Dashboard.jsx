import { AlertTriangle } from 'lucide-react';
import { Link } from '../lib/router';
import { Card, PageHeader, StatusBadge, TypeBadge, PayBadge, money, dateTime, useLoad, Notice } from './ui';

function Stat({ label, value, sub, tone = 'default', to }) {
  const cls = tone === 'dark' ? 'bg-forest-900 text-cream ring-forest-900' : 'bg-white ring-forest-900/[0.08]';
  const body = (
    <div className={`h-full rounded-2xl p-4 ring-1 transition hover:shadow-md ${cls}`}>
      <p className={`text-xs font-medium ${tone === 'dark' ? 'text-cream/65' : 'text-ink/50'}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${tone === 'dark' ? 'text-cream/55' : 'text-ink/45'}`}>{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function SalesChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 700;
  const H = 180;
  const bw = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="h-auto w-full" role="img" aria-label="Order value per day, last 14 days">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="#0e2416" strokeOpacity="0.07" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * (H - 8);
        const day = new Date(`${d.day}T00:00:00`);
        return (
          <g key={d.day}>
            <title>{`${d.day}: ${money(d.value)} · ${d.orders} orders · ${d.bags} bags`}</title>
            <rect x={i * bw + bw * 0.2} y={H - h} width={bw * 0.6} height={Math.max(h, d.value ? 2 : 0)} rx="4" fill={i === data.length - 1 ? '#c39a3e' : '#1f6440'} />
            <text x={i * bw + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="#0e2416" fillOpacity="0.5">
              {day.getDate()}/{day.getMonth() + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { data: s, error } = useLoad('/admin/stats');
  if (error) return <Notice>{error}</Notice>;
  if (!s) return <p className="text-ink/50">Loading…</p>;
  const b = s.byStatus;
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Orders from the website, updated live" />

      {s.pendingDelivery > 0 && (
        <Link to="/admin/orders?status=pending" className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="h-4 w-4" />
          {s.pendingDelivery} order{s.pendingDelivery > 1 ? 's need' : ' needs'} a delivery charge before confirmation.
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total orders" value={s.total} tone="dark" to="/admin/orders" />
        <Stat label="Pending" value={b.pending} to="/admin/orders?status=pending" />
        <Stat label="Confirmed" value={b.confirmed} to="/admin/orders?status=confirmed" />
        <Stat label="Processing" value={b.processing} sub={`${b.shipped} shipped`} to="/admin/orders?status=processing" />
        <Stat label="Delivered" value={b.delivered} to="/admin/orders?status=delivered" />
        <Stat label="Cancelled" value={b.cancelled} to="/admin/orders?status=cancelled" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label="Wholesale orders" value={s.wholesale} to="/admin/orders?type=wholesale" />
        <Stat label="Retail orders" value={s.retail} to="/admin/orders?type=retail" />
        <Stat label="Bags sold" value={new Intl.NumberFormat('en-IN').format(s.totalBags)} sub="excluding cancelled" />
        <Stat label="Total order value" value={money(s.totalValue)} sub="excluding cancelled" />
        <Stat label="Confirmed revenue" value={money(s.confirmedRevenue)} sub="marked as paid" />
        <Stat label="Pending payment" value={money(s.pendingPayment)} sub="unpaid orders" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card title="Order value — last 14 days" className="xl:col-span-2">
          <SalesChart data={s.chart} />
        </Card>
        <Card title="Recent orders" className="xl:col-span-3" pad={false} actions={<Link to="/admin/orders" className="text-sm font-semibold text-forest-700 hover:underline">All orders →</Link>}>
          {s.recent.length === 0 ? (
            <p className="p-5 text-sm text-ink/50">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-forest-900/[0.06]">
              {s.recent.map((o) => (
                <li key={o.id}>
                  <Link to={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-forest-50/60">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-forest-900">{o.order_no}</span>
                        <TypeBadge type={o.order_type} />
                      </p>
                      <p className="truncate text-sm">{o.customer_name} · <span className="text-ink/50">{o.customer_phone}</span></p>
                      <p className="text-xs text-ink/45">{dateTime(o.created_at)} · {o.total_bags} bags</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold">{money(o.grand_total ?? o.subtotal)}{o.grand_total == null && <span className="text-xs font-normal text-amber-700"> + delivery?</span>}</span>
                      <span className="flex gap-1.5"><StatusBadge status={o.status} /><PayBadge status={o.payment_status} /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
