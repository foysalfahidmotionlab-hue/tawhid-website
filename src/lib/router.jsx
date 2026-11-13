import { useEffect, useState } from 'react';

/** Tiny client-side router: current pathname + navigate(). */
export function navigate(to, { replace = false } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
  window.dispatchEvent(new Event('locationchange'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener('locationchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('locationchange', update);
    };
  }, []);
  return path;
}

/** Link that navigates inside the app without a full page load. */
export function Link({ to, onClick, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    />
  );
}

/** Go to the homepage and scroll to a section. */
export function goToSection(id) {
  if (window.location.pathname !== '/') {
    navigate('/');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
