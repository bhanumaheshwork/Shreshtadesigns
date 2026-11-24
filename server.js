import { accessSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { consultationRouter } from './scripts/consultation.mjs';
import { mcpRouter } from './scripts/mcp.mjs';

const staging = process.env.SITE_STAGING === '1';
const root = fileURLToPath(new URL(staging ? './dist-staging/' : './dist/', import.meta.url));
accessSync(join(root, 'index.html'));

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);

function linkHeaderFor(routePath) {
  const normalized = routePath === '/' ? '/' : routePath.replace(/\/?$/, '/');
  const mdPath = normalized === '/' ? '/index.md' : `${normalized}index.md`;
  return [
    '</llms.txt>; rel="llms-txt"; type="text/plain"',
    `<${mdPath}>; rel="alternate"; type="text/markdown"`,
    '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  ].join(', ');
}

function prefersMarkdown(acceptHeader) {
  if (!acceptHeader || typeof acceptHeader !== 'string') return false;
  let mdQ = -1;
  let htmlQ = -1;
  for (const part of acceptHeader.split(',')) {
    const [rawType, ...params] = part.trim().split(';');
    const type = rawType.toLowerCase();
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/i);
      if (m) q = Number(m[1]);
    }
    if (type === 'text/markdown' || type === 'text/x-markdown') mdQ = Math.max(mdQ, q);
    if (type === 'text/html') htmlQ = Math.max(htmlQ, q);
  }
  return mdQ > 0 && mdQ >= htmlQ;
}

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'",
  });
  next();
});

app.use('/api/consultation', consultationRouter());
app.use('/api/mcp', mcpRouter(root));
app.use('/api', (_req, res) => res.status(404).set('Cache-Control', 'no-store').json({ error: 'Not found.' }));

// Explicitly allow the MCP server card while keeping other dotfiles denied.
app.get('/.well-known/mcp/server-card.json', (_req, res) => {
  res.type('application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.sendFile(join(root, '.well-known', 'mcp', 'server-card.json'), { dotfiles: 'allow' });
});

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.endsWith('.md')) {
    const mdFile = join(root, req.path.slice(1));
    if (existsSync(mdFile)) {
      res.type('text/markdown; charset=utf-8');
      res.setHeader('Vary', 'Accept');
      return res.sendFile(mdFile);
    }
  }
  const normalized = req.path === '/' ? '/' : req.path.replace(/\/?$/, '/');
  const mdFile = join(root, normalized.slice(1), 'index.md');
  if (existsSync(mdFile)) {
    res.setHeader('Vary', 'Accept');
    res.setHeader('Link', linkHeaderFor(normalized));
    if (prefersMarkdown(req.headers.accept)) {
      res.type('text/markdown; charset=utf-8');
      return res.sendFile(mdFile);
    }
  }
  next();
});

app.use(express.static(root, {
  dotfiles: 'deny',
  setHeaders(res, path) {
    if (/-[A-Za-z0-9_-]{8}\.(?:js|css|png|webp)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', staging ? 'private, no-store' : 'public, max-age=0, s-maxage=300');
    } else if (/\.(?:webp|jpe?g|png)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  },
}));
app.use((_req, res) => res.status(404).set('Cache-Control', 'no-store').sendFile(join(root, '404.html')));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, '0.0.0.0', () => console.log(`Shreshta Designs listening on port ${port}`));
