import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const site = 'https://www.shreshtadesigns.com';
const brand = 'Shreshta Designs';
const staging = dir === 'dist-staging';
const paths = [
  '/', '/services/', '/our-story/', '/experiences/', '/celebrations/', '/our-approach/', '/enquire/',
  '/terms/', '/privacy/',
  ...['engagement', 'sangeet', 'haldi', 'wedding', 'reception'].map((id) => `/album/${id}/`),
];
const titles = new Set();
const descriptions = new Set();
const htmlByPath = new Map();

function verifyBrand(path, page) {
  assert.doesNotMatch(page, /shreshtha|shrestha|rivaaz/i, `${path} has an outdated brand name`);
  const title = page.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title?.endsWith(` | ${brand}`), `${path} page title`);
  assert.ok(page.includes(`property="og:site_name" content="${brand}"`), `${path} social site name`);
  assert.ok(page.includes(`property="og:title" content="${title}"`), `${path} Open Graph title`);
  assert.ok(page.includes(`name="twitter:title" content="${title}"`), `${path} social card title`);

  const href = page.match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1];
  assert.ok(href, `${path} WhatsApp link`);
  const whatsapp = new URL(href.replaceAll('&#x27;', "'"));
  assert.ok(whatsapp.searchParams.get('text')?.startsWith(`Hi ${brand}, `), `${path} WhatsApp greeting`);
  return title;
}

for (const path of paths) {
  const page = await readFile(join(dir, path.slice(1), 'index.html'), 'utf8');
  htmlByPath.set(path, page);
  assert.equal([...page.matchAll(/<h1\b/g)].length, 1, path);
  assert.match(page, /<div id="root">\S/, path);
  const title = verifyBrand(path, page);
  const description = page.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `Unique title for ${path}`);
  assert.ok(description && !descriptions.has(description), `Unique description for ${path}`);
  titles.add(title);
  descriptions.add(description);
  assert.ok(page.includes(`property="og:url" content="${site}${path}"`));
  if (staging) {
    assert.ok(page.includes('content="noindex, nofollow"'));
  } else {
    assert.ok(page.includes(`rel="canonical" href="${site}${path}"`));
    assert.ok(page.includes('content="index, follow'));
  }

  const schema = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]);
  const schemaTypes = schema['@graph'].map((entry) => entry['@type']).sort();
  const expectedWebPageType = path === '/our-story/'
    ? 'AboutPage'
    : path === '/enquire/'
      ? 'ContactPage'
      : path === '/celebrations/'
        ? 'CollectionPage'
        : 'WebPage';
  const expectedTypes = path === '/'
    ? ['HowTo', 'Organization', 'Service', 'WebPage', 'WebSite']
    : path === '/services/'
      ? ['BreadcrumbList', 'FAQPage', 'Organization', 'Service', 'WebPage', 'WebSite']
      : path === '/our-story/'
        ? ['AboutPage', 'BreadcrumbList', 'FAQPage', 'Organization', 'WebSite']
        : path.startsWith('/album/')
          ? ['BreadcrumbList', 'ImageGallery', 'Organization', 'WebPage', 'WebSite']
          : ['BreadcrumbList', expectedWebPageType, 'Organization', 'WebSite'].sort();
  assert.deepEqual(schemaTypes, expectedTypes, `${path} schema types`);
  for (const type of ['Organization', 'WebSite']) {
    const entity = schema['@graph'].find((entry) => entry['@type'] === type);
    assert.equal(entity.name, brand, `${path} ${type} name`);
    assert.equal(entity.url, site + '/', `${path} ${type} URL`);
  }
  const organization = schema['@graph'].find((entry) => entry['@type'] === 'Organization');
  assert.equal(organization.areaServed[0].name, 'Hyderabad', `${path} service area`);
  assert.ok(organization.telephone, `${path} Organization telephone`);
  assert.equal(organization.address?.addressLocality, 'Hyderabad', `${path} Organization addressLocality`);
  assert.ok(Array.isArray(organization.sameAs) && organization.sameAs.length > 0, `${path} Organization sameAs`);
  const webPage = schema['@graph'].find((entry) => entry['@type'] === expectedWebPageType);
  assert.equal(webPage.url, site + path, `${path} WebPage URL`);
  await access(join(dir, new URL(organization.logo).pathname));
  const image = page.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.ok(image?.startsWith(site));
  await access(join(dir, new URL(image).pathname));
}

for (const [path, page] of htmlByPath) {
  for (const match of page.matchAll(/(?:href|src|action)="(\/(?!\/)[^"]+)"/g)) {
    const url = new URL(match[1], site);
    if (url.pathname === '/api/consultation') continue;
    const target = htmlByPath.get(url.pathname);
    if (target) {
      if (url.hash) assert.ok(target.includes(`id="${url.hash.slice(1)}"`), `${path} links to ${match[1]}`);
    } else {
      await access(join(dir, url.pathname));
    }
  }
  for (const [, sources] of page.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const candidate of sources.split(',')) {
      const [url] = candidate.trim().split(/\s+/, 1);
      if (url.startsWith('/') && !url.startsWith('//')) {
        await access(join(dir, new URL(url, site).pathname));
      }
    }
  }
}

const robots = await readFile(join(dir, 'robots.txt'), 'utf8');
for (const [path, page] of htmlByPath) {
  if (!path.startsWith('/album/')) continue;
  const previews = [...page.matchAll(/src="(\/src\/assets\/images\/albums\/[^"]+-preview\.webp)"/g)];
  assert.equal(previews.length, 8, path);
  for (const [, preview] of previews) {
    await access(join(dir, preview.replace('-preview.webp', '.webp')));
  }
}
if (staging) {
  assert.equal(robots, 'User-agent: *\nDisallow: /\n');
  await assert.rejects(access(join(dir, 'sitemap.xml')));
} else {
  const sitemap = await readFile(join(dir, 'sitemap.xml'), 'utf8');
  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
    paths.map((path) => site + path));
  assert.equal([...sitemap.matchAll(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)].length, paths.length, 'sitemap lastmod dates');
  assert.match(robots, /User-agent: \*\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /Content-Signal: search=yes, ai-input=yes, ai-train=no/);
  assert.match(robots, /User-agent: Googlebot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: Bingbot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: GPTBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: PerplexityBot\nAllow: \/\nDisallow: \/api\//);
  assert.doesNotMatch(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));
  await access(join(dir, 'llms.txt'));
  const serverCard = JSON.parse(await readFile(join(dir, '.well-known', 'mcp', 'server-card.json'), 'utf8'));
  assert.equal(serverCard.name, 'shreshta-designs');
  assert.ok(serverCard.endpoint);
  for (const path of paths) {
    await access(join(dir, path.slice(1), 'index.md'));
  }
}

const missing = await readFile(join(dir, '404.html'), 'utf8');
verifyBrand('/404.html', missing);
assert.ok(missing.includes('noindex, nofollow'));
assert.ok(missing.includes('Page unavailable'));
const files = await readdir(dir, { recursive: true });
const privateFiles = files.filter((file) => /(?:^|\/)(?:\.env|\.git|node_modules|\.prerender)|\.(?:gltf|glb|map)$/i.test(file));
assert.deepEqual(privateFiles, []);
console.log(`Verified ${paths.length} rendered routes, links, assets, metadata, schema, and crawler rules in ${dir}.`);
