import { BRAND_EMAIL, BRAND_NAME, BRAND_PHONE_E164, BRAND_WHATSAPP_PROFILE_URL } from '../data/brand';
import { CEREMONY_SLIDES } from '../data/ceremonies';
import { pages, SITE_ORIGIN } from '../data/pages';
import { ceremonyAlbumHref, ceremonyServiceHref } from '../data/siteNavigation';
import { PLANNING_FAQS, PROCESS_STAGES } from '../data/studioContent';
import { navigate } from './router';

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface NavigatorWithModelContext extends Navigator {
  modelContext?: {
    registerTool: (tool: ModelContextTool) => void;
  };
}

let registered = false;

export function registerWebMcpTools() {
  if (registered || typeof window === 'undefined') return;
  const nav = navigator as NavigatorWithModelContext;
  if (!nav.modelContext || typeof nav.modelContext.registerTool !== 'function') return;
  registered = true;

  const tools: ModelContextTool[] = [
    {
      name: 'list_ceremony_services',
      description: 'List wedding planning, mandap design, and ceremony decoration services offered by Shreshta Designs in Hyderabad and across India.',
      inputSchema: {
        type: 'object',
        properties: {
          ceremony: {
            type: 'string',
            enum: ['engagement', 'sangeet', 'haldi', 'wedding', 'reception'],
            description: 'Optional ceremony filter.',
          },
        },
        additionalProperties: false,
      },
      execute: ({ ceremony }) => {
        const filtered = typeof ceremony === 'string'
          ? CEREMONY_SLIDES.filter((s) => s.id === ceremony)
          : CEREMONY_SLIDES;
        return {
          studio: BRAND_NAME,
          location: 'Hyderabad, Telangana, India',
          services: filtered.map((slide) => ({
            id: slide.id,
            name: slide.name,
            subtitle: slide.service.subtitle,
            duration: slide.service.duration,
            guestRange: slide.service.guestRange,
            highlights: slide.service.highlights,
            serviceUrl: `${SITE_ORIGIN}${ceremonyServiceHref(slide.id)}`,
            albumUrl: `${SITE_ORIGIN}${ceremonyAlbumHref(slide.id)}`,
          })),
        };
      },
    },
    {
      name: 'get_studio_overview',
      description: 'Get verified business details, 6-stage planning process, contact information, and FAQs for Shreshta Designs.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      execute: () => ({
        name: BRAND_NAME,
        url: `${SITE_ORIGIN}/`,
        location: 'Hyderabad, Telangana, India',
        email: BRAND_EMAIL,
        telephone: BRAND_PHONE_E164,
        whatsapp: BRAND_WHATSAPP_PROFILE_URL,
        process: PROCESS_STAGES.map(({ title, story }, index) => ({
          step: index + 1,
          title,
          description: story,
        })),
        faqs: PLANNING_FAQS,
        pages: pages.map((page) => ({
          path: page.path,
          url: `${SITE_ORIGIN}${page.path}`,
          title: page.title,
          description: page.description,
        })),
      }),
    },
    {
      name: 'navigate_to_page',
      description: 'Navigate inside the Shreshta Designs single-page application without a full browser reload.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            enum: pages.map((p) => p.path),
            description: 'Target route path.',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
      execute: ({ path }) => {
        if (typeof path !== 'string') {
          return { ok: false, error: 'A valid route path is required.' };
        }
        navigate(path);
        return { ok: true, navigatedTo: path };
      },
    },
    {
      name: 'submit_consultation_enquiry',
      description: 'Submit a wedding planning consultation enquiry to Shreshta Designs.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Primary contact full name' },
          partner_name: { type: 'string', description: 'Partner full name' },
          email: { type: 'string', format: 'email', description: 'Contact email address' },
          phone: { type: 'string', description: 'Contact phone number (7-15 digits)' },
          wedding_date: { type: 'string', description: 'Wedding date in YYYY-MM-DD format' },
          guest_range: {
            type: 'string',
            enum: ['Under 100', '100–499', '500–999', '1,000–1,999', '2,000–2,999', '3,000–4,000', 'Over 4,000', 'custom'],
          },
          guest_count: { type: 'integer', minimum: 1 },
          ceremonies: {
            type: 'array',
            items: { type: 'string', enum: ['engagement', 'sangeet', 'haldi', 'wedding', 'reception'] },
          },
          venue: { type: 'string', description: 'Dream venue or destination (optional)' },
          vision: { type: 'string', description: 'Celebration vision notes (optional)' },
          scope: { type: 'string', description: 'Celebration scope (optional)' },
        },
        required: ['name', 'partner_name', 'email', 'phone', 'wedding_date', 'guest_range'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const response = await fetch('/api/consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(input),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok !== true) {
          return {
            ok: false,
            status: response.status,
            error: typeof result?.error === 'string' ? result.error : 'Unable to submit enquiry.',
          };
        }
        return { ok: true, message: 'Consultation enquiry submitted.' };
      },
    },
  ];

  for (const tool of tools) {
    try {
      nav.modelContext.registerTool(tool);
    } catch {
      // Ignore duplicate registration or browser-specific rejections.
    }
  }
}
