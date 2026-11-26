import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import {
  BRAND_EMAIL,
  BRAND_LOCATION,
  BRAND_LOGO_URL,
  BRAND_NAME,
  BRAND_PHONE_E164,
  BRAND_SAME_AS,
  BRAND_WHATSAPP_PROFILE_URL,
} from './data/brand';
import { CEREMONY_SLIDES } from './data/ceremonies';
import { notFound, pages, SITE_ORIGIN, type SitePage } from './data/pages';
import { ceremonyAlbumHref, ceremonyServiceHref, SERVICES_HREF } from './data/siteNavigation';
import { CONSULTATION_NOTE, PLANNING_FAQS, PROCESS_STAGES, STORY_LINE, STORY_PORTRAIT_LINES } from './data/studioContent';
import { renderPage } from './renderPage';

const organizationId = SITE_ORIGIN + '/#organization';
const websiteId = SITE_ORIGIN + '/#website';

function webPageType(page: SitePage) {
  if (page.kind === 'studio') {
    if (page.link.id === 'our-story') return 'AboutPage';
    if (page.link.id === 'enquire') return 'ContactPage';
    if (page.link.id === 'celebrations') return 'CollectionPage';
  }
  return 'WebPage';
}

function breadcrumbsFor(page: SitePage) {
  if (page.kind === 'home' || page.kind === 'missing') return null;

  const items: Array<{ name: string; item: string }> = [
    { name: 'Home', item: SITE_ORIGIN + '/' },
  ];

  if (page.kind === 'album') {
    items.push({ name: 'Services', item: SITE_ORIGIN + SERVICES_HREF });
    items.push({ name: `${page.slide.name} Album`, item: SITE_ORIGIN + page.path });
  } else if (page.kind === 'services') {
    items.push({ name: 'Services', item: SITE_ORIGIN + page.path });
  } else {
    items.push({ name: page.link.label, item: SITE_ORIGIN + page.path });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_ORIGIN}${page.path}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

function schemaFor(page: SitePage) {
  const pageUrl = SITE_ORIGIN + page.path;
  const pageTitle = `${page.title} | ${BRAND_NAME}`;
  const image = SITE_ORIGIN + page.image;
  const hyderabadArea = {
    '@type': 'City',
    name: BRAND_LOCATION.city,
    containedInPlace: {
      '@type': 'State',
      name: BRAND_LOCATION.region,
      containedInPlace: {
        '@type': 'Country',
        name: BRAND_LOCATION.countryName,
      },
    },
  };

  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: BRAND_NAME,
    url: SITE_ORIGIN + '/',
    logo: SITE_ORIGIN + BRAND_LOGO_URL,
    email: BRAND_EMAIL,
    telephone: BRAND_PHONE_E164,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BRAND_LOCATION.city,
      addressRegion: BRAND_LOCATION.region,
      addressCountry: BRAND_LOCATION.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BRAND_PHONE_E164,
      email: BRAND_EMAIL,
      contactType: 'customer service',
      availableLanguage: ['English'],
      areaServed: BRAND_LOCATION.country,
    },
    sameAs: [...BRAND_SAME_AS],
    description: 'Hyderabad-based luxury wedding planning, mandap architecture, floral decor and event management studio serving weddings across Hyderabad and India.',
    areaServed: [
      hyderabadArea,
      { '@type': 'Country', name: BRAND_LOCATION.countryName },
    ],
  };

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: BRAND_NAME,
    url: SITE_ORIGIN + '/',
    inLanguage: 'en-IN',
    publisher: { '@id': organizationId },
  };

  const breadcrumb = breadcrumbsFor(page);
  const webPage: Record<string, unknown> = {
    '@type': webPageType(page),
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageTitle,
    description: page.description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
    },
  };
  if (breadcrumb) {
    webPage.breadcrumb = { '@id': breadcrumb['@id'] };
  }

  const graph: object[] = [organization, website, webPage];
  if (breadcrumb) {
    graph.push(breadcrumb);
  }

  if (page.kind === 'home' || page.kind === 'services') {
    const serviceBaseUrl = SITE_ORIGIN + SERVICES_HREF;
    graph.push({
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: 'Wedding planning and design',
      serviceType: 'Wedding planning, mandap architecture, wedding decoration and event management',
      url: serviceBaseUrl,
      description: page.description,
      provider: { '@id': organizationId },
      areaServed: [hyderabadArea, { '@type': 'Country', name: BRAND_LOCATION.countryName }],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Ceremonial wedding planning and design services',
        itemListElement: CEREMONY_SLIDES.map((slide) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${slide.name} — ${slide.service.subtitle}`,
            description: slide.album.storyLead,
            url: `${serviceBaseUrl}#service-${slide.id}`,
          },
        })),
      },
    });
  }

  if (page.kind === 'home') {
    graph.push({
      '@type': 'HowTo',
      '@id': `${pageUrl}#process`,
      name: 'Wedding planning and design process at Shreshta Designs',
      description: 'How our Hyderabad studio plans, designs, and coordinates celebrations from concept to execution.',
      step: PROCESS_STAGES.map((stage, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: stage.title,
        text: stage.story,
      })),
    });
  }

  if (page.kind === 'services' || (page.kind === 'studio' && page.link.id === 'our-story')) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: PLANNING_FAQS.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    });
  }

  if (page.kind === 'album') {
    graph.push({
      '@type': 'ImageGallery',
      '@id': `${pageUrl}#gallery`,
      name: `${page.slide.name} Design Album`,
      description: page.slide.album.storyLead,
      url: pageUrl,
      creator: { '@id': organizationId },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function pageHead(page: SitePage, staging: boolean) {
  const title = `${page.title} | ${BRAND_NAME}`;
  const url = SITE_ORIGIN + page.path;
  const image = SITE_ORIGIN + page.image;
  const indexable = page.kind !== 'missing' && !staging;
  return renderToStaticMarkup(
    <>
      <title>{title}</title>
      <meta name="description" content={page.description} />
      {indexable && <link rel="canonical" href={url} />}
      <meta name="robots" content={indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={image} />
      {page.kind !== 'missing' && <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaFor(page)).replace(/</g, '\\u003c'),
      }} />}
    </>
  );
}

function markdownFor(page: SitePage): string {
  const header = [
    `# ${page.title} | ${BRAND_NAME}`,
    '',
    `> ${page.description}`,
    '',
    `- Canonical URL: ${SITE_ORIGIN}${page.path}`,
    `- Location: ${BRAND_LOCATION.city}, ${BRAND_LOCATION.region}, ${BRAND_LOCATION.countryName}`,
    `- Email: ${BRAND_EMAIL}`,
    `- Telephone / WhatsApp: ${BRAND_PHONE_E164} (${BRAND_WHATSAPP_PROFILE_URL})`,
    '',
  ];

  if (page.kind === 'home') {
    return [
      ...header,
      '## About Us',
      '',
      STORY_LINE,
      ...STORY_PORTRAIT_LINES,
      '',
      '## Ceremonies & Services',
      '',
      ...CEREMONY_SLIDES.map(
        (s) => `- **${s.name}** (${s.service.subtitle}): ${s.album.storyLead} — [Details](${SITE_ORIGIN}${ceremonyServiceHref(s.id)}) · [Album](${SITE_ORIGIN}${ceremonyAlbumHref(s.id)})`,
      ),
      '',
      '## Wedding Planning Process',
      '',
      ...PROCESS_STAGES.map((stage, i) => `${i + 1}. **${stage.title}**: ${stage.story}`),
      '',
      '## Key Pages',
      '',
      ...pages.map((p) => `- [${p.title}](${SITE_ORIGIN}${p.path})`),
      '',
    ].join('\n');
  }

  if (page.kind === 'services') {
    return [
      ...header,
      '## Ceremony Planning & Design Services',
      '',
      ...CEREMONY_SLIDES.flatMap((s) => [
        `### ${s.name} — ${s.service.subtitle}`,
        '',
        s.album.storyLead,
        '',
        ...s.service.highlights.map((h) => `- ${h}`),
        '',
        `Album: ${SITE_ORIGIN}${ceremonyAlbumHref(s.id)}`,
        '',
      ]),
      '## Planning Questions (FAQ)',
      '',
      ...PLANNING_FAQS.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
    ].join('\n');
  }

  if (page.kind === 'album') {
    return [
      ...header,
      `Palette: ${page.slide.album.paletteName}`,
      '',
      page.slide.album.storyLead,
      '',
      '## Featured Moments',
      '',
      ...page.slide.album.moments.map((m) => `- **${m.time} — ${m.title}**: ${m.detail}`),
      '',
      `Service details: ${SITE_ORIGIN}${ceremonyServiceHref(page.slide.id)}`,
      '',
    ].join('\n');
  }

  if (page.kind === 'studio') {
    const extra: string[] = [];
    if (page.link.id === 'our-story') {
      extra.push(
        STORY_LINE,
        '',
        ...STORY_PORTRAIT_LINES,
        '',
        '## Frequently Asked Questions',
        '',
        ...PLANNING_FAQS.flatMap((f) => [`### ${f.question}`, '', f.answer, '']),
      );
    } else if (page.link.id === 'our-approach') {
      extra.push(...PROCESS_STAGES.map((s, i) => `${i + 1}. **${s.title}**: ${s.story}`));
    } else if (page.link.id === 'celebrations') {
      extra.push(...CEREMONY_SLIDES.map((s) => `- [${s.name}](${SITE_ORIGIN}${ceremonyServiceHref(s.id)}): ${s.album.storyLead}`));
    } else if (page.link.id === 'enquire') {
      extra.push(CONSULTATION_NOTE);
    }
    return [...header, ...extra, ''].join('\n');
  }

  return [...header].join('\n');
}

function buildLlmsTxt(): string {
  return [
    `# ${BRAND_NAME}`,
    '',
    `> Luxury wedding planning, carved mandap architecture, floral decoration, lighting, and event management studio in ${BRAND_LOCATION.city}, ${BRAND_LOCATION.region}, ${BRAND_LOCATION.countryName}.`,
    '',
    `${BRAND_NAME} plans and designs bespoke weddings and private celebrations across Hyderabad and destination venues in India, spanning Engagement, Sangeet, Haldi, Wedding, and Reception.`,
    '',
    `- Website: ${SITE_ORIGIN}/`,
    `- Email: ${BRAND_EMAIL}`,
    `- Telephone / WhatsApp: ${BRAND_PHONE_E164} (${BRAND_WHATSAPP_PROFILE_URL})`,
    `- MCP Server Card: ${SITE_ORIGIN}/.well-known/mcp/server-card.json`,
    '',
    '## Key Pages',
    '',
    ...pages.map((p) => `- [${p.title}](${SITE_ORIGIN}${p.path}): ${p.description}`),
    '',
    '## Ceremonies & Design Albums',
    '',
    ...CEREMONY_SLIDES.map(
      (s) => `- [${s.name}](${SITE_ORIGIN}${ceremonyServiceHref(s.id)}): ${s.service.subtitle} — [Photo Album](${SITE_ORIGIN}${ceremonyAlbumHref(s.id)})`,
    ),
    '',
  ].join('\n');
}

function buildMcpServerCard() {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server-card.json',
    serverInfo: {
      name: 'shreshta-designs',
      title: BRAND_NAME,
      version: '1.0.0',
    },
    name: 'shreshta-designs',
    version: '1.0.0',
    description: 'Luxury wedding planning, mandap architecture, floral decor and event management in Hyderabad and destination venues across India.',
    endpoint: `${SITE_ORIGIN}/api/mcp`,
    transport: {
      type: 'streamable-http',
      endpoint: '/api/mcp',
    },
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
    },
    tools: [
      {
        name: 'list_ceremony_services',
        description: 'List wedding planning, mandap design, and ceremony decoration services offered by Shreshta Designs.',
      },
      {
        name: 'get_studio_overview',
        description: 'Get verified business details, 6-stage process, contact information, and FAQs for Shreshta Designs.',
      },
      {
        name: 'submit_consultation_enquiry',
        description: 'Submit a private wedding consultation enquiry to Shreshta Designs.',
      },
    ],
  };
}

export async function buildPages(directory: string) {
  const staging = process.env.SITE_STAGING === '1';
  const lastmod = new Date().toISOString().slice(0, 10);
  const template = await readFile(join(directory, 'index.html'), 'utf8');
  const headPlaceholder = /<title>[^<]*<\/title><!--page-head-->/;
  if (!headPlaceholder.test(template) || !template.includes('<div id="root"></div>')) {
    throw new Error('Expected page head and React root in the built template.');
  }

  for (const page of [...pages, notFound]) {
    const path = page.kind === 'missing' ? '404.html' : page.path.slice(1) + 'index.html';
    const file = join(directory, path);
    const markup = renderToString(await renderPage(page));
    const html = template
      .replace(headPlaceholder, () => pageHead(page, staging))
      .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);

    if (page.kind !== 'missing') {
      const mdPath = page.path.slice(1) + 'index.md';
      const mdFile = join(directory, mdPath);
      await writeFile(mdFile, markdownFor(page));
    }
  }

  await writeFile(join(directory, 'llms.txt'), buildLlmsTxt());
  const serverCardFile = join(directory, '.well-known', 'mcp', 'server-card.json');
  await mkdir(dirname(serverCardFile), { recursive: true });
  await writeFile(serverCardFile, JSON.stringify(buildMcpServerCard(), null, 2) + '\n');

  const sitemap = stageSitemap(staging, lastmod);
  if (sitemap) await writeFile(join(directory, 'sitemap.xml'), sitemap);
  await writeFile(join(directory, 'robots.txt'), staging ? 'User-agent: *\nDisallow: /\n' : [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n'));
}

function stageSitemap(staging: boolean, lastmod: string) {
  if (staging) return '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(({ path }) => `  <url><loc>${SITE_ORIGIN}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
}
