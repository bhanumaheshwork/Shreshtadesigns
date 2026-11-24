import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  CEREMONY_SLIDES,
  CeremonyId,
  CeremonySlide,
} from '../data/ceremonies';
import GalleryComponent01, {
  type GalleryImage,
} from '@/src/components/ui/shadcn-studio-gallery-component-01';
import './CeremonyPage.css';
import { BRAND_NAME } from '../data/brand';
import { ceremonyAlbumHref, ceremonyServiceHref } from '../data/siteNavigation';
import { ceremonyGallery } from '../data/ceremonyGallery';

interface CeremonyAlbumPageProps {
  slide: CeremonySlide;
  logoSrc: string;
  inquiryOpen: boolean;
  transitionKey?: number;
  restoreScrollTop?: number;
  onBackToCeremony: (ceremonyId: CeremonyId) => void;
  onOpenInquiry: (ceremonyId: CeremonyId) => void;
}

export const CeremonyAlbumPage: React.FC<CeremonyAlbumPageProps> = ({
  slide,
  logoSrc,
  inquiryOpen,
  transitionKey = 0,
  restoreScrollTop,
  onBackToCeremony,
  onOpenInquiry,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const currentIdx = CEREMONY_SLIDES.findIndex((s) => s.id === slide.id);
  const prevSlide =
    CEREMONY_SLIDES[(currentIdx - 1 + CEREMONY_SLIDES.length) % CEREMONY_SLIDES.length];
  const nextSlide = CEREMONY_SLIDES[(currentIdx + 1) % CEREMONY_SLIDES.length];

  const sections = useMemo(() => ceremonyGallery(slide.id), [slide.id]);
  const allImages = useMemo(
    () => sections.flatMap((section) => section.images),
    [sections]
  );

  // Reset scroll position and lightbox before paint when switching between ceremony albums
  useLayoutEffect(() => {
    setLightboxIndex(null);
    scrollContainerRef.current?.scrollTo({ top: restoreScrollTop ?? 0, behavior: 'instant' });
    scrollContainerRef.current?.focus({ preventScroll: true });
  }, [slide.id, restoreScrollTop]);

  // Keyboard navigation for Escape and Lightbox Prev/Next
  useEffect(() => {
    if (inquiryOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          onBackToCeremony(slide.id);
        }
      } else if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setLightboxIndex((prev) =>
            prev === null ? 0 : (prev + 1) % allImages.length
          );
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setLightboxIndex((prev) =>
            prev === null ? 0 : (prev - 1 + allImages.length) % allImages.length
          );
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, inquiryOpen, onBackToCeremony, allImages.length, slide.id]);

  const activeImage: GalleryImage | null =
    lightboxIndex !== null ? allImages[lightboxIndex] ?? null : null;

  return (
    <div
      ref={scrollContainerRef}
      className="ceremony-page"
      role="region"
      aria-label={`${slide.name} album gallery`}
      tabIndex={-1}
      inert={inquiryOpen}
    >
      <header className="ceremony-page__header">
        <div className="ceremony-page__nav ceremony-album__nav">
          <a href="/" className="ceremony-page__logo" aria-label={`${BRAND_NAME} home`}>
            <img src={logoSrc} alt="" />
          </a>

          <nav className="ceremony-page__chapters" aria-label="Ceremony albums">
            {CEREMONY_SLIDES.map((item) => (
              <a
                key={item.id}
                href={ceremonyAlbumHref(item.id)}
                aria-current={item.id === slide.id ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="ceremony-album__actions">
            <a className="ceremony-page__back" href={ceremonyServiceHref(slide.id)}>
              <ArrowLeft size={16} aria-hidden="true" />
              {slide.name} details
            </a>
            <button
              type="button"
              onClick={() => onOpenInquiry(slide.id)}
              className="ceremony-album__enquire"
            >
              Enquire
            </button>
          </div>
        </div>
      </header>

      <main
        key={slide.id}
        id="main-content"
        tabIndex={-1}
        className={`ceremony-page__content ceremony-album__content${transitionKey ? ' route-transition-in' : ''}`}
      >
        <div className="ceremony-album__intro">
          <h1>{slide.name} Album</h1>
          <p className="ceremony-page__lead">{slide.album.storyLead}</p>
          <p>Design inspiration for your celebration.</p>
        </div>
        <GalleryComponent01
          sections={sections}
          onImageClick={(_img, idx) => setLightboxIndex(idx)}
        />
      </main>

      <footer className="ceremony-album__footer">
        <nav className="ceremony-album__pager" aria-label="Previous and next albums">
          <a href={ceremonyAlbumHref(prevSlide.id)} aria-label={`Previous album, ${prevSlide.name}`}>
            <ArrowLeft size={16} aria-hidden="true" />
            {prevSlide.name}
          </a>
          <p>{slide.album.paletteName}</p>
          <a href={ceremonyAlbumHref(nextSlide.id)} aria-label={`Next album, ${nextSlide.name}`}>
            {nextSlide.name}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </footer>

      {activeImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ceremony-backdrop)] p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex w-full max-w-5xl flex-col overflow-hidden bg-[var(--ceremony-paper)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--ceremony-rule)] px-4 py-3 sm:px-6">
              <p className="text-xs font-medium tracking-wide text-[var(--ceremony-burgundy)]">
                Photo {lightboxIndex + 1} of {allImages.length}
              </p>
              <button
                type="button"
                aria-label="Close image preview"
                onClick={() => setLightboxIndex(null)}
                className="ceremony-album__icon-button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex max-h-[72vh] items-center justify-center bg-[var(--ceremony-surface)]">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-full object-contain"
              />

              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + allImages.length) % allImages.length
                  )
                }
                className="absolute left-3 top-1/2 ceremony-album__icon-button -translate-y-1/2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % allImages.length)
                }
                className="absolute right-3 top-1/2 ceremony-album__icon-button -translate-y-1/2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-[var(--ceremony-rule)] px-4 py-3.5 sm:px-6">
              <p className="text-sm text-[var(--ceremony-muted)]">
                {activeImage.alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
