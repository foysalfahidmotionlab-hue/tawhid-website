import { useRef, useState } from 'react';
import { ArrowLeft, Download, ExternalLink, Phone, Printer } from 'lucide-react';
import { api } from '../lib/api';
import { Link } from '../lib/router';
import { districtBn } from '../shared/districts';
import { ReceiptDoc, downloadReceiptPdf } from '../pages/Receipt';
import { Card, PageHeader, StatusBadge, TypeBadge, PayBadge, money, dateTime, useLoad, Btn, Notice, inputCls, STATUS_LABEL, PAY_LABEL } from './ui';

const NEXT_LABEL = {
  confirmed: 'Confirm order',
  processing: 'Start processing',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel order',
};

export default function OrderDetail({ id }) {
  const { data: o, error, reload } = useLoad(`/admin/orders/${id}`);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState({ tone: 'ok', text: '' });
  const [charge, setCharge] = useState('');
  const [note, setNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const receiptRef = useRef(null);

  if (error) return <Notice>{error}</Notice>;
  if (!o) return <p className="text-ink/50">Loading…</p>;

  const run = async (key, path, body, okText) => {
    setBusy(key);
    setMsg({ tone: 'ok', text: '' });
    try {
      await api(`/admin/orders/${o.id}/${path}`, { method: 'POST', body });
      setMsg({ tone: 'ok', text: okText });
      reload();
      return true;
    } catch (e) {
      setMsg({ tone: 'error', text: e.message });
      return false;
    } finally {
      setBusy('');
    }
  };

  const changeStatus = async (to) => {
    if (to === 'cancelled' && !window.confirm(`Cancel order ${o.order_no}? Reserved stock is returned. This cannot be undone.`)) return;
    if (await run(to, 'status', { status: to, note: statusNote }, `Status changed to ${STATUS_LABEL[to]}.`)) setStatusNote('');
  };

  const receiptData = { ...o, company: {} };
  const locked = o.status === 'cancelled' || o.status === 'delivered';

  return (
    <>
      <Link to="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      <PageHeader
        title={<span className="font-mono">{o.order_no}</span>}
        subtitle={`Placed ${dateTime(o.created_at)} · last updated ${dateTime(o.updated_at)}`}
        actions={
          <>
            <a href={`/receipt/${o.receipt_token}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-forest-900 ring-1 ring-inset ring-forest-900/15 hover:bg-forest-50">
              <ExternalLink className="h-4 w-4" /> Customer receipt
            </a>
            <Btn onClick={() => downloadReceiptPdf(receiptRef.current, `${o.order_no}.pdf`)}><Download className="h-4 w-4" /> PDF</Btn>
            <Btn onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Btn>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge status={o.status} />
        <PayBadge status={o.payment_status} />
        <TypeBadge type={o.order_type} />
      </div>
      {msg.text && <div className="mb-4"><Notice tone={msg.tone === 'ok' ? 'ok' : 'error'}>{msg.text}</Notice></div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Items">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-ink/50">
                <tr><th className="pb-2">Product</th><th className="pb-2 text-right">Per bag</th><th className="pb-2 text-right">Bags</th><th className="pb-2 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-forest-900/[0.06]">
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5"><span className="font-semibold">{i.name_bn}</span><span className="block text-xs text-ink/50">{i.name_en} · {i.weight_kg} kg</span></td>
                    <td className="py-2.5 text-right">{money(i.unit_price)}</td>
                    <td className="py-2.5 text-right">{i.quantity}</td>
                    <td className="py-2.5 text-right font-semibold">{money(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto mt-4 max-w-xs space-y-1.5 border-t border-forest-900/10 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink/55">Total bags</dt><dd className="font-semibold">{o.total_bags}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/55">Products</dt><dd>{money(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/55">Delivery</dt><dd>{o.delivery_charge == null ? <span className="font-semibold text-amber-700">To be confirmed</span> : money(o.delivery_charge)}</dd></div>
              <div className="flex justify-between border-t border-forest-900/10 pt-2 text-base"><dt className="font-bold">Grand total</dt><dd className="font-bold">{o.grand_total == null ? <span className="text-sm text-amber-700">Pending</span> : money(o.grand_total)}</dd></div>
            </dl>
            <p className="mt-2 text-right text-xs text-ink/45">
              Delivery: {o.delivery_source === 'rate' ? `auto — ${o.delivery_rate_label}` : o.delivery_source === 'admin' ? 'set by admin' : 'no matching rate'}
            </p>
          </Card>

          <Card title="Customer">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-ink/50">Name</dt><dd className="font-semibold">{o.customer_name}</dd></div>
              <div><dt className="text-xs text-ink/50">Mobile</dt><dd><a href={`tel:${o.customer_phone}`} className="inline-flex items-center gap-1.5 font-semibold text-forest-700 hover:underline"><Phone className="h-3.5 w-3.5" />{o.customer_phone}</a></dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-ink/50">Delivery address</dt><dd>{o.address}, {o.upazila}, {districtBn(o.district)} ({o.district})</dd></div>
              {o.notes && <div className="sm:col-span-2"><dt className="text-xs text-ink/50">Customer note</dt><dd className="rounded-lg bg-forest-50 px-3 py-2">{o.notes}</dd></div>}
            </dl>
          </Card>

          <Card title="History">
            <ol className="space-y-3 text-sm">
              {o.history.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest-600" />
                  <div>
                    <p>
                      {h.kind === 'created' && 'Order placed by customer'}
                      {h.kind === 'status' && <>Status: {STATUS_LABEL[h.from_value]} → <strong>{STATUS_LABEL[h.to_value]}</strong></>}
                      {h.kind === 'payment' && <>Payment: {PAY_LABEL[h.from_value]} → <strong>{PAY_LABEL[h.to_value]}</strong></>}
                      {h.kind === 'delivery' && <>Delivery charge: {h.from_value === 'to be confirmed' ? 'to be confirmed' : money(Number(h.from_value))} → <strong>{money(Number(h.to_value))}</strong></>}
                      {h.kind === 'note' && <>Note added</>}
                      {h.note && h.kind !== 'created' && <span className="text-ink/60"> — {h.note}</span>}
                    </p>
                    <p className="text-xs text-ink/45">{dateTime(h.created_at)}{h.admin_name ? ` · ${h.admin_name}` : ''}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Order status">
            <p className="text-sm text-ink/60">Pending → Confirmed → Processing → Shipped → Delivered</p>
            {o.next_statuses.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-ink/60">This order is {STATUS_LABEL[o.status].toLowerCase()} — no further changes.</p>
            ) : (
              <>
                <input className={`${inputCls} mt-3`} placeholder="Note for this change (optional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.next_statuses.map((s) => (
                    <Btn key={s} variant={s === 'cancelled' ? 'danger' : 'primary'} busy={busy === s} onClick={() => changeStatus(s)}>
                      {NEXT_LABEL[s]}
                    </Btn>
                  ))}
                </div>
                {o.status === 'pending' && o.delivery_charge == null && (
                  <p className="mt-2 text-xs text-amber-700">Set the delivery charge below before confirming.</p>
                )}
              </>
            )}
          </Card>

          <Card title="Delivery charge">
            {locked ? (
              <p className="text-sm text-ink/60">{o.delivery_charge == null ? 'Not set' : money(o.delivery_charge)}</p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (await run('delivery', 'delivery', { charge }, 'Delivery charge saved — receipt updated.')) setCharge('');
                }}
                className="flex gap-2"
              >
                <input className={inputCls} inputMode="numeric" placeholder={o.delivery_charge == null ? 'Amount in taka' : `Now ${o.delivery_charge}`} value={charge} onChange={(e) => setCharge(e.target.value.replace(/\D/g, ''))} aria-label="Delivery charge (taka)" />
                <Btn type="submit" variant="primary" busy={busy === 'delivery'} disabled={charge === ''}>Save</Btn>
              </form>
            )}
            <p className="mt-2 text-xs text-ink/45">Enter 0 for free delivery. The customer’s receipt link shows the new total.</p>
          </Card>

          <Card title="Payment (cash on delivery)">
            <p className="text-sm">Current: <PayBadge status={o.payment_status} /></p>
            <div className="mt-3 flex flex-wrap gap-2">
              {o.payment_status !== 'paid' && o.status !== 'cancelled' && (
                <Btn variant="primary" busy={busy === 'paid'} onClick={() => window.confirm('Mark as paid? Only do this after the money has been received.') && run('paid', 'payment', { payment_status: 'paid' }, 'Marked as paid.')}>
                  Mark as paid
                </Btn>
              )}
              {o.payment_status === 'paid' && (
                <>
                  <Btn busy={busy === 'unpaid'} onClick={() => run('unpaid', 'payment', { payment_status: 'unpaid' }, 'Marked as unpaid.')}>Mark as unpaid</Btn>
                  <Btn busy={busy === 'refunded'} onClick={() => window.confirm('Mark this payment as refunded?') && run('refunded', 'payment', { payment_status: 'refunded' }, 'Marked as refunded.')}>Refunded</Btn>
                </>
              )}
            </div>
          </Card>

          <Card title="Internal notes">
            {o.internal_notes ? <pre className="whitespace-pre-wrap rounded-lg bg-forest-50 p-3 font-sans text-sm text-ink/80">{o.internal_notes}</pre> : <p className="text-sm text-ink/50">No notes yet. Only admins see these.</p>}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run('note', 'note', { note }, 'Note added.')) setNote('');
              }}
              className="mt-3 space-y-2"
            >
              <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <Btn type="submit" busy={busy === 'note'} disabled={!note.trim()}>Add note</Btn>
            </form>
          </Card>
        </div>
      </div>

      {/* Bangla receipt used for PDF / print */}
      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-ink/60">Receipt preview (Bangla)</h2>
        <ReceiptDoc o={receiptData} lang="bn" docRef={receiptRef} />
      </div>
    </>
  );
}
