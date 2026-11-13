import { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { Link, navigate } from '../lib/router';
import { districtBn } from '../shared/districts';
import { ORDER_STATUSES } from '../shared/rules';
import { Card, PageHeader, StatusBadge, TypeBadge, PayBadge, money, dateTime, useLoad, inputCls, Btn, Notice, STATUS_LABEL } from './ui';

const initial = () => {
  const q = new URLSearchParams(window.location.search);
  return { q: q.get('q') || '', status: q.get('status') || '', type: q.get('type') || '', payment: q.get('payment') || '', from: q.get('from') || '', to: q.get('to') || '', page: Number(q.get('page')) || 1 };
};

export default function Orders() {
  const [f, setF] = useState(initial);
  const [search, setSearch] = useState(f.q);

  useEffect(() => {
    const t = setTimeout(() => setF((x) => (x.q === search ? x : { ...x, q: search, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v && !(k === 'page' && v === 1)) p.set(k, v);
    return p.toString();
  }, [f]);

  useEffect(() => {
    window.history.replaceState({}, '', `/admin/orders${qs ? `?${qs}` : ''}`);
  }, [qs]);

  const { data, error, loading } = useLoad(`/admin/orders${qs ? `?${qs}` : ''}`);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value, page: 1 }));
  const csvQs = qs.replace(/(^|&)page=\d+/, '');
  const pages = data ? Math.max(1, Math.ceil(data.total / data.size)) : 1;

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={data ? `${data.total} order${data.total === 1 ? '' : 's'}` : ' '}
        actions={
          <a href={`/api/admin/orders.csv${csvQs ? `?${csvQs}` : ''}`} className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-forest-900 ring-1 ring-inset ring-forest-900/15 hover:bg-forest-50">
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input className={`${inputCls} pl-9`} placeholder="Search name, phone or order ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select className={inputCls} value={f.status} onChange={set('status')} aria-label="Status">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select className={inputCls} value={f.type} onChange={set('type')} aria-label="Order type">
            <option value="">All types</option>
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
          </select>
          <input type="date" className={inputCls} value={f.from} onChange={set('from')} aria-label="From date" />
          <input type="date" className={inputCls} value={f.to} onChange={set('to')} aria-label="To date" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select className={`${inputCls} w-auto`} value={f.payment} onChange={set('payment')} aria-label="Payment">
            <option value="">Any payment</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          {qs && (
            <Btn variant="ghost" onClick={() => { setSearch(''); setF({ q: '', status: '', type: '', payment: '', from: '', to: '', page: 1 }); }}>
              Clear filters
            </Btn>
          )}
        </div>
      </Card>

      <Notice>{error}</Notice>

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] text-sm">
            <thead className="bg-forest-50/70 text-left text-xs font-semibold text-forest-900/70">
              <tr>
                {['Order ID', 'Date', 'Customer', 'Mobile', 'Products', 'Bags', 'Type', 'Location', 'Total', 'Payment', 'Status', ''].map((h) => (
                  <th key={h} className="px-3 py-2.5 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/[0.06]">
              {data?.rows.map((o) => (
                <tr key={o.id} className="cursor-pointer align-top hover:bg-forest-50/50" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                  <td className="whitespace-nowrap px-3 py-3 pl-5 font-mono font-semibold text-forest-900">{o.order_no}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-ink/60">{dateTime(o.created_at)}</td>
                  <td className="px-3 py-3 font-medium">{o.customer_name}</td>
                  <td className="whitespace-nowrap px-3 py-3">{o.customer_phone}</td>
                  <td className="max-w-[16rem] px-3 py-3 text-ink/70">{o.products}</td>
                  <td className="px-3 py-3 text-right">{o.total_bags}</td>
                  <td className="px-3 py-3"><TypeBadge type={o.order_type} /></td>
                  <td className="px-3 py-3 text-ink/70">{o.upazila}, {districtBn(o.district)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                    {o.grand_total != null ? money(o.grand_total) : <span title="Delivery charge not set">{money(o.subtotal)} <span className="text-xs font-normal text-amber-700">+ delivery?</span></span>}
                  </td>
                  <td className="px-3 py-3"><PayBadge status={o.payment_status} /></td>
                  <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-3 pr-5">
                    <Link to={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-forest-700 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.rows.length === 0 && <p className="p-6 text-center text-sm text-ink/50">{loading ? 'Loading…' : 'No orders match these filters.'}</p>}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-forest-900/[0.07] px-5 py-3 text-sm">
            <span className="text-ink/55">Page {f.page} of {pages}</span>
            <div className="flex gap-2">
              <Btn disabled={f.page <= 1} onClick={() => setF((x) => ({ ...x, page: x.page - 1 }))}>Previous</Btn>
              <Btn disabled={f.page >= pages} onClick={() => setF((x) => ({ ...x, page: x.page + 1 }))}>Next</Btn>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
