import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    build: { cssCodeSplit: false, copyPublicDir: false },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'agent-ready-dev-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = (req.url || '/').split('?')[0];
            const distDir = path.resolve(import.meta.dirname, 'dist');
            if (url === '/.well-known/mcp/server-card.json') {
              const file = path.join(distDir, '.well-known/mcp/server-card.json');
              if (fs.existsSync(file)) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(fs.readFileSync(file));
                return;
              }
            }
            if (url === '/llms.txt' || url === '/robots.txt' || url === '/sitemap.xml') {
              const file = path.join(distDir, url.slice(1));
              if (fs.existsSync(file)) {
                res.setHeader('Content-Type', url.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
                res.end(fs.readFileSync(file));
                return;
              }
            }
            const normalized = url === '/' ? '/' : url.replace(/\/?$/, '/');
            const mdFile = path.join(distDir, normalized.slice(1), 'index.md');
            if (!url.startsWith('/src/') && !url.startsWith('/@') && !url.startsWith('/node_modules/') && fs.existsSync(mdFile)) {
              const mdHref = normalized === '/' ? '/index.md' : `${normalized}index.md`;
              res.setHeader('Vary', 'Accept');
              res.setHeader('Link', `</llms.txt>; rel="llms-txt"; type="text/plain", <${mdHref}>; rel="alternate"; type="text/markdown", </.well-known/mcp/server-card.json>; rel="describedby"; type="application/json", </sitemap.xml>; rel="sitemap"; type="application/xml"`);
              if (req.headers.accept?.includes('text/markdown')) {
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                res.end(fs.readFileSync(mdFile));
                return;
              }
            }
            next();
          });
        },
      },
      // Copy the assets used by the production website.
      {
        name: 'copy-deployable-files',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error || this.environment.config.build.ssr) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, this.environment.config.build.outDir);
          const copy = (source: string, destination = source, filter?: (source: string) => boolean) => {
            const target = path.join(distDir, destination);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.cpSync(path.join(import.meta.dirname, source), target, { recursive: true, filter });
          };
          copy('src/assets/images', 'src/assets/images', (source) =>
            !/^(?:mountain_sunset_vista_|serene_alpine_blue_vista_).+\.jpg$/.test(path.basename(source)),
          );
          copy('public/assets/aistudio/golden-pavilion.webp', 'assets/aistudio/golden-pavilion.webp');
          copy('public/assets/aistudio/golden-pavilion-portrait.webp', 'assets/aistudio/golden-pavilion-portrait.webp');
          copy('public/assets/aistudio/shreshta-logo.webp', 'assets/aistudio/shreshta-logo.webp');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    ssr: { noExternal: ['gsap'] },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
