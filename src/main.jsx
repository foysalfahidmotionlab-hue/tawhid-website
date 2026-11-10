import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

// Optional palette preview: add ?theme=<name> to the URL (see index.css for the palettes).
const THEMES = ['harvest', 'sage', 'maroon', 'navy', 'luxe', 'sunlit'];
const theme = new URLSearchParams(window.location.search).get('theme');
if (THEMES.includes(theme)) document.documentElement.dataset.theme = theme;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
