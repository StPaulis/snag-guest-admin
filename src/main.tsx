import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { tenant } from './tenant';

// Co-branded tab title: partner name first (what guests look for in a tab),
// snag lockup second. index.html keeps the plain fallback until this runs.
document.title = `${tenant.name} · snag host portal`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
