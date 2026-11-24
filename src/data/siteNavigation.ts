import type { CeremonyId } from './ceremonies';

export const SERVICES_HREF = '/services/';

export function ceremonyServiceHref(ceremonyId: CeremonyId) {
  return `${SERVICES_HREF}#service-${ceremonyId}`;
}

export function ceremonyAlbumHref(ceremonyId: CeremonyId) {
  return `/album/${ceremonyId}/`;
}

export const STUDIO_LINKS = [
  { id: 'our-story', label: 'Our story', href: '/our-story/' },
  { id: 'experiences', label: 'Experiences', href: '/experiences/' },
  { id: 'celebrations', label: 'Celebrations', href: '/celebrations/' },
  { id: 'our-approach', label: 'Our approach', href: '/our-approach/' },
  { id: 'enquire', label: 'Enquire', href: '/enquire/' },
] as const;

export const LEGAL_LINKS = [
  { id: 'terms', label: 'Terms of use', href: '/terms/' },
  { id: 'privacy', label: 'Privacy policy', href: '/privacy/' },
] as const;

export type StudioLink = (typeof STUDIO_LINKS)[number];
export type LegalLink = (typeof LEGAL_LINKS)[number];
export type StudioPageLink = StudioLink | LegalLink;
