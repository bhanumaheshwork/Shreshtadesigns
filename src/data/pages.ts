import { BRAND_NAME } from './brand';
import { ALBUM_COVERS } from './ceremonyGallery';
import { CEREMONY_SLIDES } from './ceremonies';
import { ceremonyAlbumHref, LEGAL_LINKS, SERVICES_HREF, STUDIO_LINKS } from './siteNavigation';

export const SITE_ORIGIN = 'https://www.shreshtadesigns.com';
export const OPENING_PHOTO = '/src/assets/images/album_engagement_hero_1795088227985.webp';
export const OPENING_PHOTO_SMALL = '/src/assets/images/album_engagement_hero_720.webp';

const studioTitles = {
  'our-story': 'About Us — Wedding Design Studio in Hyderabad',
  experiences: 'Wedding Decor, Mandap & Stage Design in Hyderabad',
  celebrations: 'Wedding Ceremonies & Celebration Planning in Hyderabad',
  'our-approach': 'Wedding Planning & Production Process in Hyderabad',
  enquire: 'Enquire — Wedding Planners in Hyderabad',
  terms: 'Terms of Use',
  privacy: 'Privacy Policy',
} as const;

const studioDescriptions = {
  'our-story': `Meet ${BRAND_NAME}, a Hyderabad wedding planning and design studio crafting carved mandaps, floral decor and lighting for calm, memorable ceremonies.`,
  experiences: 'Explore luxury wedding decoration, carved stone and timber mandap design, floral installations, lighting and sangeet stage production in Hyderabad.',
  celebrations: 'Explore wedding themes and decor inspiration for Engagement, Sangeet, Haldi, Wedding and Reception celebrations curated by Shreshta Designs in Hyderabad.',
  'our-approach': `See how ${BRAND_NAME} plans and manages weddings in Hyderabad and destination venues across India, from concept and mandap sketches to execution.`,
  enquire: `Book a private wedding planning and decor consultation with ${BRAND_NAME} in Hyderabad. Share your dates, guest count, destination and ceremony vision.`,
  terms: `Read the website terms of use and consultation enquiry terms for ${BRAND_NAME}, a wedding planning and design studio in Hyderabad.`,
  privacy: `Read how ${BRAND_NAME} collects and uses consultation enquiry details submitted through our website, email, and WhatsApp.`,
};

const albumTitles: Record<(typeof CEREMONY_SLIDES)[number]['id'], string> = {
  engagement: 'Engagement Event Design & Ring Ceremony Album',
  sangeet: 'Sangeet Stage Design & Night Celebration Album',
  haldi: 'Haldi Decoration & Courtyard Ceremony Album',
  wedding: 'Wedding Mandap Design & Ceremony Decor Album',
  reception: 'Wedding Reception Decor & Gala Design Album',
};

const albumDescriptions: Record<(typeof CEREMONY_SLIDES)[number]['id'], string> = {
  engagement: `Explore engagement decor and ring ceremony styling by ${BRAND_NAME} in Hyderabad—courtyard lighting, floral arches and editorial seating.`,
  sangeet: `Explore sangeet stage design, mirror-work dance floors, acoustic lighting and live dhol celebration decor by ${BRAND_NAME} in Hyderabad.`,
  haldi: `Explore haldi decoration ideas by ${BRAND_NAME} in Hyderabad—marigold canopies, brass urlis, mogra garlands and sunlit courtyard styling.`,
  wedding: `Explore bespoke wedding mandap architecture, varmala stages, jasmine garlands and heritage ceremony decor designed by ${BRAND_NAME} in Hyderabad.`,
  reception: `Explore luxury wedding reception decoration by ${BRAND_NAME} in Hyderabad—crystal chandeliers, floral stages and candlelit banquet tables.`,
};

export const pages = [
  {
    kind: 'home',
    path: '/',
    title: 'Luxury Wedding & Event Planners in Hyderabad',
    description: 'Luxury wedding planners in Hyderabad for bespoke mandap design, wedding decor and event management across Engagement, Sangeet, Haldi, Wedding and Reception.',
    image: OPENING_PHOTO,
  },
  {
    kind: 'services',
    path: SERVICES_HREF,
    title: 'Wedding Planning & Decor Services in Hyderabad',
    description: 'Wedding planning, mandap design, floral decor and event coordination in Hyderabad for Engagement, Sangeet, Haldi, Wedding and Reception.',
    image: OPENING_PHOTO,
  },
  ...[...STUDIO_LINKS, ...LEGAL_LINKS].map((link) => ({
    kind: 'studio' as const,
    path: link.href,
    title: studioTitles[link.id],
    description: studioDescriptions[link.id],
    image: '/src/assets/images/our-story-wedding-portrait.webp',
    link,
  })),
  ...CEREMONY_SLIDES.map((slide) => ({
    kind: 'album' as const,
    path: ceremonyAlbumHref(slide.id),
    title: albumTitles[slide.id],
    description: albumDescriptions[slide.id],
    image: ALBUM_COVERS[slide.id].src,
    slide,
  })),
] as const;

export const notFound = {
  kind: 'missing',
  path: '/404.html',
  title: 'Page unavailable',
  description: `Return to ${BRAND_NAME} to browse our wedding services and albums.`,
  image: OPENING_PHOTO,
} as const;

export type SitePage = (typeof pages)[number] | typeof notFound;

export function findPage(path: string): SitePage {
  const normalized = path === '/' || path.endsWith('/') ? path : path + '/';
  return pages.find((page) => page.path === normalized) ?? notFound;
}

export function legacyPageHref(hash: string) {
  if (!hash.startsWith('#/')) return;
  const direct = pages.find((page) => page.path === hash.slice(1).replace(/\/?$/, '/'));
  if (direct && direct.path !== '/') return direct.path;
  const id = hash.match(/^#\/(?:services|ceremony)\/([a-z]+)\/?$/)?.[1];
  const ceremony = CEREMONY_SLIDES.find((slide) => slide.id === id);
  return ceremony ? `${SERVICES_HREF}#service-${ceremony.id}` : undefined;
}
