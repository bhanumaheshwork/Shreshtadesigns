import { createRoot, hydrateRoot } from 'react-dom/client';
import { findPage, formatPageTitle, legacyPageHref } from './data/pages';
import { renderPage } from './renderPage';
import { registerWebMcpTools } from './utils/webmcp';
import './index.css';

function start() {
  if (location.pathname === '/') {
    const href = legacyPageHref(location.hash);
    if (href) {
      location.replace(href);
      return;
    }
  }

  registerWebMcpTools();

  const root = document.getElementById('root')!;
  const page = findPage(location.pathname);
  const content = renderPage(page);
  if (root.hasChildNodes()) {
    hydrateRoot(root, content);
  } else {
    document.title = formatPageTitle(page);
    createRoot(root).render(content);
  }
}

start();
