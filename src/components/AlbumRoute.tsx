import { useEffect, useState } from 'react';
import type { CeremonyId, CeremonySlide } from '../data/ceremonies';
import { ceremonyServiceHref } from '../data/siteNavigation';
import { navigate } from '../utils/router';
import { CeremonyAlbumPage } from './CeremonyAlbumPage';
import { InquiryModal } from './ServiceOverlays';

export function AlbumRoute({
  slide,
  logoSrc,
  transitionKey = 0,
}: {
  slide: CeremonySlide;
  logoSrc: string;
  transitionKey?: number;
}) {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    setInquiryOpen(false);
  }, [slide.id]);

  function openDetails(id: CeremonyId) {
    navigate(ceremonyServiceHref(id));
  }

  return (
    <>
      <CeremonyAlbumPage
        slide={slide}
        logoSrc={logoSrc}
        inquiryOpen={inquiryOpen}
        transitionKey={transitionKey}
        onBackToCeremony={openDetails}
        onOpenInquiry={() => setInquiryOpen(true)}
      />
      <InquiryModal open={inquiryOpen} initialCeremony={slide.id} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
