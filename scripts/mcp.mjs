import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';

const PROTOCOL_VERSION = '2025-03-26';

export function mcpRouter(rootDir) {
  const router = express.Router();

  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.get('/', (_req, res) => {
    res.json({
      name: 'shreshta-designs',
      version: '1.0.0',
      protocolVersion: PROTOCOL_VERSION,
      serverCard: '/.well-known/mcp/server-card.json',
    });
  });

  router.post('/', express.json({ limit: 32000 }), (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: body?.id ?? null,
        error: { code: -32600, message: 'Invalid JSON-RPC 2.0 request.' },
      });
    }

    const { id = null, method, params = {} } = body;

    if (method === 'notifications/initialized') {
      return res.status(202).end();
    }

    if (method === 'ping') {
      return res.json({ jsonrpc: '2.0', id, result: {} });
    }

    if (method === 'initialize') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: { name: 'shreshta-designs', version: '1.0.0' },
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
        },
      });
    }

    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'get_site_summary',
              description: 'Return the llms.txt summary of Shreshta Designs services, ceremonies, and pages.',
              inputSchema: { type: 'object', properties: {}, additionalProperties: false },
            },
            {
              name: 'get_page_markdown',
              description: 'Return the clean Markdown representation for a public Shreshta Designs route path.',
              inputSchema: {
                type: 'object',
                properties: {
                  path: { type: 'string', description: 'Route path such as /, /services/, /our-story/, /enquire/' },
                },
                required: ['path'],
                additionalProperties: false,
              },
            },
          ],
        },
      });
    }

    if (method === 'tools/call') {
      const name = params?.name;
      if (name === 'get_site_summary') {
        const text = readFileSync(join(rootDir, 'llms.txt'), 'utf8');
        return res.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
      }
      if (name === 'get_page_markdown') {
        const rawPath = typeof params?.arguments?.path === 'string' ? params.arguments.path : '/';
        const normalized = rawPath === '/' ? '/' : `${rawPath.replace(/\/?$/, '/')}`;
        const safe = normalized.replace(/[^a-z0-9/-]/gi, '');
        try {
          const md = readFileSync(join(rootDir, safe.slice(1), 'index.md'), 'utf8');
          return res.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: md }] } });
        } catch {
          return res.json({
            jsonrpc: '2.0',
            id,
            isError: true,
            result: { content: [{ type: 'text', text: `Page not found: ${rawPath}` }] },
          });
        }
      }
      return res.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${String(name)}` },
      });
    }

    if (method === 'resources/list') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          resources: [
            {
              uri: 'https://www.shreshtadesigns.com/llms.txt',
              name: 'llms.txt',
              mimeType: 'text/plain',
            },
          ],
        },
      });
    }

    if (method === 'resources/read') {
      const text = readFileSync(join(rootDir, 'llms.txt'), 'utf8');
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          contents: [{ uri: 'https://www.shreshtadesigns.com/llms.txt', mimeType: 'text/plain', text }],
        },
      });
    }

    return res.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  });

  return router;
}
