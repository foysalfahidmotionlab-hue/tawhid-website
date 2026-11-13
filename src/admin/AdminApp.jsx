import { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, ExternalLink, Image, LogOut, Menu, Package, Settings, Truck, Wheat, X } from 'lucide-react';
import '@fontsource/anek-bangla/400.css';
import '@fontsource/anek-bangla/600.css';
import { api } from '../lib/api';
import { usePath, Link, navigate } from '../lib/router';
import { Btn, Notice, inputCls } from './ui';
import Dashboard from './Dashboard';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Products from './Products';
import Delivery from './Delivery';
import Content from './Content';
import AccountSettings from './AccountSettings';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Products & prices', icon: Package },
  { to: '/admin/delivery', label: 'Delivery charges', icon: Truck },
  { to: '/admin/content', label: 'Website content', icon: Image },
  { to: '/admin/settings', label: 'Account', icon: Settings },
];

function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-hero grid min-h-screen place-items-center px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            onDone(await api('/admin/login', { method: 'POST', body: { email, password } }));
          } catch (er) {
            setError(er.message);
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-[0_30px_60px_-30px_rgba(11,53,32,0.45)] ring-1 ring-forest-900/10"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-900 text-gold-light">
            <Wheat className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-forest-950">Tawhid Admin</p>
            <p className="text-xs text-ink/50">Zinia™ order management</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <input className={inputCls} type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inputCls} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Notice>{error}</Notice>
          <Btn type="submit" variant="primary" busy={busy} className="w-full py-2.5">Sign in</Btn>
        </div>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const path = usePath();
  const [me, setMe] = useState(undefined);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.title = 'Admin — Tawhid Auto Rice Mill';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    api('/admin/me').then(setMe).catch(() => setMe(null));
    return () => meta.remove();
  }, []);
  useEffect(() => setMenu(false), [path]);

  if (me === undefined) return <div className="grid min-h-screen place-items-center text-ink/50">Loading…</div>;
  if (!me) return <Login onDone={setMe} />;

  const orderMatch = path.match(/^\/admin\/orders\/(\d+)$/);
  let page;
  if (orderMatch) page = <OrderDetail id={Number(orderMatch[1])} />;
  else if (path.startsWith('/admin/orders')) page = <Orders />;
  else if (path.startsWith('/admin/products')) page = <Products />;
  else if (path.startsWith('/admin/delivery')) page = <Delivery />;
  else if (path.startsWith('/admin/content')) page = <Content />;
  else if (path.startsWith('/admin/settings')) page = <AccountSettings me={me} />;
  else page = <Dashboard />;

  const isActive = (to) => (to === '/admin' ? path === '/admin' || path === '/admin/' : path.startsWith(to));

  const sidebar = (
    <nav className="flex h-full flex-col bg-forest-950 text-cream">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-gold-light/60 text-gold-light">
          <Wheat className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold leading-tight">Tawhid Admin</p>
          <p className="text-[0.7rem] text-cream/55">Zinia™ rice</p>
        </div>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(to) ? 'bg-white/12 text-white' : 'text-cream/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive(to) ? 'text-gold-light' : ''}`} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/70 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <button
          type="button"
          onClick={async () => {
            await api('/admin/logout', { method: 'POST' }).catch(() => {});
            setMe(null);
            navigate('/admin');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-cream/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="px-3 pt-2 text-xs text-cream/40">{me.email}</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f3f6f1] text-ink" style={{ fontFamily: '"DM Sans", "Anek Bangla", sans-serif' }}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">{sidebar}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-forest-900/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setMenu(true)} className="rounded-lg p-2 hover:bg-forest-50">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="font-bold text-forest-950">Tawhid Admin</p>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{page}</main>
      </div>
    </div>
  );
}
