import { createRoot, hydrateRoot } from 'react-dom/client';
import { BRAND_NAME } from './data/brand';
import { findPage, legacyPageHref } from './data/pages';
import { renderPage } from './renderPage';
import './index.css';

function start() {
  if (location.pathname === '/') {
    const href = legacyPageHref(location.hash);
    if (href) {
      location.replace(href);
      return;
    }
  }

  const root = document.getElementById('root')!;
  const page = findPage(location.pathname);
  const content = renderPage(page);
  if (root.hasChildNodes()) {
    hydrateRoot(root, content);
  } else {
    document.title = `${page.title} | ${BRAND_NAME}`;
    createRoot(root).render(content);
  }
}

start();
