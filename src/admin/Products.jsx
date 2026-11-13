import { useState } from 'react';
import { Archive, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { Card, PageHeader, Btn, Field, Notice, Toggle, UploadButton, inputCls, money, useLoad, Badge } from './ui';

const EMPTY = { name_bn: '', name_en: '', description_bn: '', description_en: '', weight_kg: 25, wholesale_price: '', retail_markup: 50, stock_qty: '', sort_order: 10, is_active: false, out_of_stock: false };

function ProductForm({ initial, onSave, onCancel, saving, error }) {
  const [f, setF] = useState(() => ({
    ...EMPTY,
    ...initial,
    wholesale_price: initial?.wholesale_price ?? '',
    stock_qty: initial?.stock_qty ?? '',
    is_active: !!initial?.is_active,
    out_of_stock: !!initial?.out_of_stock,
  }));
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const wp = f.wholesale_price === '' ? null : Number(f.wholesale_price);
  const retail = wp == null ? null : wp + Number(f.retail_markup || 0);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name_bn: f.name_bn,
          name_en: f.name_en,
          description_bn: f.description_bn,
          description_en: f.description_en,
          weight_kg: f.weight_kg,
          wholesale_price: f.wholesale_price,
          retail_markup: f.retail_markup,
          stock_qty: f.stock_qty,
          sort_order: f.sort_order,
          is_active: f.is_active,
          out_of_stock: f.out_of_stock,
        });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (Bangla) *"><input className={inputCls} value={f.name_bn} onChange={set('name_bn')} required /></Field>
        <Field label="Name (English) *"><input className={inputCls} value={f.name_en} onChange={set('name_en')} required /></Field>
        <Field label="Description (Bangla)"><textarea rows={2} className={`${inputCls} resize-none`} value={f.description_bn} onChange={set('description_bn')} /></Field>
        <Field label="Description (English)"><textarea rows={2} className={`${inputCls} resize-none`} value={f.description_en} onChange={set('description_en')} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Package weight (kg)"><input className={inputCls} inputMode="decimal" value={f.weight_kg} onChange={set('weight_kg')} /></Field>
        <Field label="Wholesale price / bag (৳)" hint="Empty = not for sale yet"><input className={inputCls} inputMode="numeric" value={f.wholesale_price} onChange={(e) => setF((x) => ({ ...x, wholesale_price: e.target.value.replace(/\D/g, '') }))} /></Field>
        <Field label="Retail markup / bag (৳)" hint={retail != null ? `Retail price: ${money(retail)}` : 'Retail = wholesale + markup'}><input className={inputCls} inputMode="numeric" value={f.retail_markup} onChange={(e) => setF((x) => ({ ...x, retail_markup: e.target.value.replace(/\D/g, '') }))} /></Field>
        <Field label="Bags in stock" hint="Empty = not tracked"><input className={inputCls} inputMode="numeric" value={f.stock_qty} onChange={(e) => setF((x) => ({ ...x, stock_qty: e.target.value.replace(/\D/g, '') }))} /></Field>
        <Field label="Display order"><input className={inputCls} inputMode="numeric" value={f.sort_order} onChange={set('sort_order')} /></Field>
      </div>
      <div className="flex flex-wrap gap-6">
        <Toggle checked={f.is_active} onChange={(v) => setF((x) => ({ ...x, is_active: v }))} label="Available for ordering" />
        <Toggle checked={f.out_of_stock} onChange={(v) => setF((x) => ({ ...x, out_of_stock: v }))} label="Out of stock" />
      </div>
      <Notice>{error}</Notice>
      <div className="flex gap-2">
        <Btn type="submit" variant="primary" busy={saving}>Save product</Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </form>
  );
}

export default function Products() {
  const { data, error, reload } = useLoad('/admin/products');
  const [editing, setEditing] = useState(null); // product id | 'new'
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [msg, setMsg] = useState('');

  const save = async (body) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') await api('/admin/products', { method: 'POST', body });
      else await api(`/admin/products/${editing}`, { method: 'PATCH', body });
      setEditing(null);
      setMsg('Saved. The website shows the new details straight away.');
      reload();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const quick = async (p, body, text) => {
    setMsg('');
    try {
      await api(`/admin/products/${p.id}`, { method: 'PATCH', body });
      setMsg(text);
      reload();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Products & prices"
        subtitle="Retail price = wholesale price + retail markup. Existing orders always keep the price they were placed at."
        actions={<Btn variant="primary" onClick={() => { setEditing('new'); setFormError(''); }}><Plus className="h-4 w-4" /> Add product</Btn>}
      />
      <Notice>{error}</Notice>
      {msg && <div className="mb-4"><Notice tone="ok">{msg}</Notice></div>}

      {editing === 'new' && (
        <Card title="New product" className="mb-6">
          <ProductForm onSave={save} onCancel={() => setEditing(null)} saving={saving} error={formError} />
          <p className="mt-3 text-xs text-ink/50">You can upload the product image after saving.</p>
        </Card>
      )}

      <div className="space-y-4">
        {data?.map((p) => (
          <Card key={p.id} className={p.is_archived ? 'opacity-60' : ''}>
            {editing === p.id ? (
              <ProductForm initial={p} onSave={save} onCancel={() => setEditing(null)} saving={saving} error={formError} />
            ) : (
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <div className="grid h-36 w-32 place-items-center rounded-xl bg-forest-50">
                    {p.image ? <img src={p.image} alt="" className="h-32 w-auto object-contain" /> : <span className="text-xs text-ink/40">No image</span>}
                  </div>
                  <UploadButton endpoint={`/admin/products/${p.id}/image`} onUploaded={() => { setMsg('Image updated.'); reload(); }}>
                    Change image
                  </UploadButton>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-forest-950">{p.name_bn}</h3>
                    <span className="text-sm text-ink/50">{p.name_en}</span>
                    {p.is_archived ? <Badge className="bg-slate-100 text-slate-700 ring-slate-200">Archived</Badge>
                      : p.is_active ? <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-200">On sale</Badge>
                      : <Badge className="bg-slate-100 text-slate-700 ring-slate-200">Not for sale</Badge>}
                    {!!p.out_of_stock && <Badge className="bg-rose-50 text-rose-800 ring-rose-200">Out of stock</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/60">{p.description_bn}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                    <div><dt className="text-xs text-ink/50">Weight</dt><dd className="font-semibold">{p.weight_kg} kg</dd></div>
                    <div><dt className="text-xs text-ink/50">Wholesale</dt><dd className="font-semibold">{money(p.wholesale_price)}</dd></div>
                    <div><dt className="text-xs text-ink/50">Retail (+{p.retail_markup})</dt><dd className="font-semibold">{money(p.retail_price)}</dd></div>
                    <div><dt className="text-xs text-ink/50">Stock</dt><dd className="font-semibold">{p.stock_qty == null ? 'Not tracked' : `${p.stock_qty} bags`}</dd></div>
                    <div><dt className="text-xs text-ink/50">Orders</dt><dd className="font-semibold">{p.order_count}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Btn variant="primary" onClick={() => { setEditing(p.id); setFormError(''); }}>Edit</Btn>
                    {!p.is_archived && (
                      <Btn onClick={() => quick(p, { is_active: !p.is_active }, p.is_active ? 'Product hidden from ordering.' : 'Product is now available for ordering.')}>
                        {p.is_active ? 'Stop selling' : 'Start selling'}
                      </Btn>
                    )}
                    {!p.is_archived && (
                      <Btn onClick={() => quick(p, { out_of_stock: !p.out_of_stock }, p.out_of_stock ? 'Marked as in stock.' : 'Marked as out of stock.')}>
                        {p.out_of_stock ? 'Back in stock' : 'Mark out of stock'}
                      </Btn>
                    )}
                    {p.is_archived ? (
                      <Btn onClick={() => quick(p, { is_archived: false }, 'Product restored (not for sale until you start selling).')}>Restore</Btn>
                    ) : (
                      <Btn
                        variant="danger"
                        onClick={async () => {
                          const verb = p.order_count ? 'archive' : 'permanently delete';
                          if (!window.confirm(`${verb[0].toUpperCase()}${verb.slice(1)} “${p.name_en}”?${p.order_count ? ' It has orders, so it will be archived (hidden) instead of deleted.' : ' This cannot be undone.'}`)) return;
                          const out = await api(`/admin/products/${p.id}`, { method: 'DELETE' });
                          setMsg(out.archived ? 'Product archived (it has past orders).' : 'Product deleted.');
                          reload();
                        }}
                      >
                        {p.order_count ? <Archive className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        {p.order_count ? 'Archive' : 'Delete'}
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
