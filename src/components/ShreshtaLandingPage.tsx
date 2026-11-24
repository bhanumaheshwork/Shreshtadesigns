import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { BRAND_NAME, BRAND_SHORT_NAME } from '../data/brand';
import { OPENING_PHOTO, OPENING_PHOTO_SMALL } from '../data/pages';
import { SiteNavigation } from './SiteNavigation';
import { ConsultationForm } from './ConsultationForm';
import { CONSULTATION_NOTE, PROCESS_STAGES, STORY_LINE, STORY_PHOTO_ALT, STORY_PHOTO_URL, STORY_PORTRAIT_LINES } from '../data/studioContent';
import { SERVICES_HREF } from '../data/siteNavigation';
import { bindSlideTrack } from '../utils/slideTrack';
import { CEREMONY_SLIDES } from '../data/ceremonies';
import './ShreshtaLanding.css';

gsap.registerPlugin(ScrollTrigger);
if (typeof window !== 'undefined') {
  ScrollTrigger.config({ ignoreMobileResize: true });
}

interface ShreshtaLandingPageProps {
  logoSrc: string;
  services: React.ReactNode;
  renderService: (from: number, to: number, progress: number) => void;
  selectService: React.RefObject<((index: number) => void) | null>;
  navigateSection?: React.RefObject<((targetId: string) => void) | null>;
}

const BANDS = 72;
const SLICES = 72;
const WL = 0.61;
const wordmark = BRAND_SHORT_NAME.toUpperCase();
const EDITORIAL_LAYOUT = '(min-width: 720px)';
const PHONE_LAYOUT = '(max-width: 719px)';
const PHONE_PORTRAIT_LAYOUT = `${PHONE_LAYOUT} and (orientation: portrait)`;
const PHONE_SALON_PINNED_LAYOUT = `${PHONE_PORTRAIT_LAYOUT} and (min-height: 500px)`;
const COMPACT_SALON_LAYOUT = `${PHONE_SALON_PINNED_LAYOUT}, (min-width: 720px) and (max-width: 1199px), (min-width: 720px) and (pointer: coarse)`;
const MANDAP_REVEALS = [0.08, 0.39, 0.70];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const off = (i: number, amp: number) =>
  Math.sin(i * 2.399) * amp * (0.45 + 0.55 * Math.abs(Math.cos(i * 1.31)));

export const ShreshtaLandingPage: React.FC<ShreshtaLandingPageProps> = ({
  logoSrc,
  services,
  renderService,
  selectService,
  navigateSection,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const slicesRef = useRef<HTMLDivElement | null>(null);
  const numbersTrackRef = useRef<HTMLDivElement | null>(null);
  const plateRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flineRef = useRef<HTMLHeadingElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const selectProcessRef = useRef<((index: number) => void) | null>(null);
  const [processIndex, setProcessIndex] = useState(0);

  const scrollToAnchor = useCallback((targetId: string, immediate = false) => {
    const sections = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('#top, main > section') ?? []);
    const index = sections.findIndex((section) => `#${section.id}` === targetId);
    if (index < 0) return;

    // Sticky elements report their pinned position. Use the flow dimensions for anchor targets.
    const flowTop = sections.slice(0, index + 1).reduce((offset, section, step) => {
      const margin = parseFloat(getComputedStyle(section).marginTop) || 0;
      return offset + margin + (step < index ? section.getBoundingClientRect().height : 0);
    }, 0);
    const targetSection = sections[index];
    const targetHeight = targetSection.getBoundingClientRect().height;
    const top = targetSection.id === 'services' && targetHeight < window.innerHeight - 64
      ? Math.max(0, Math.round(flowTop - 64 - (window.innerHeight - 64 - targetHeight) / 2))
      : flowTop;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(top, { duration: 2, immediate: immediate || reduce });
    } else {
      window.scrollTo({ top, behavior: immediate || reduce ? 'instant' : 'smooth' });
    }
  }, []);

  const handleHomeClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.1, immediate: reduce });
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
    }
  };

  // Landing page scroll reveals and section-local motion
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.body.dataset.nav = 'light';

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    // Only the consultation section uses the dark navigation palette.
    const enquire = root.querySelector('#enquire');
    let navFrame = 0;
    const updateNav = () => {
      navFrame = 0;
      const scrolled = window.scrollY > 80;
      const dark = (enquire?.getBoundingClientRect().top ?? Infinity) <= 40;
      root.classList.toggle('is-scrolled', scrolled);
      const theme = dark ? 'dark' : 'light';
      if (document.body.dataset.nav !== theme) document.body.dataset.nav = theme;
    };
    const scheduleNav = () => {
      if (!navFrame) navFrame = requestAnimationFrame(updateNav);
    };
    window.addEventListener('scroll', scheduleNav, { passive: true });
    window.addEventListener('resize', scheduleNav);
    updateNav();
    cleanups.push(() => {
      cancelAnimationFrame(navFrame);
      window.removeEventListener('scroll', scheduleNav);
      window.removeEventListener('resize', scheduleNav);
      root.classList.remove('is-scrolled');
      delete document.body.dataset.nav;
    });

    // 2. IntersectionObserver scroll reveals (.rv -> .in)
    const revealEls = Array.from(root.querySelectorAll<HTMLElement>('.rv'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px' }
    );
    root.classList.add('has-reveals');
    revealEls.forEach((el) => io.observe(el));
    cleanups.push(() => {
      io.disconnect();
      root.classList.remove('has-reveals');
    });

    // The sliced portrait is used in the wide layout.
    const editorialMedia = gsap.matchMedia(root);
    const stripEl = stripRef.current;
    editorialMedia.add(EDITORIAL_LAYOUT, () => {
      if (!stripEl) return;
      const bands = Array.from({ length: BANDS }, () => {
        const b = document.createElement('b');
        b.style.backgroundImage = `url("${STORY_PHOTO_URL}")`;
        stripEl.appendChild(b);
        return b;
      });

      const stripImg = new Image();
      stripImg.src = STORY_PHOTO_URL;
      const layoutStrip = () => {
        if (!stripImg.naturalWidth) return;
        const W = stripEl.clientWidth;
        const H = stripEl.clientHeight;
        const s = Math.max(W / stripImg.naturalWidth, H / stripImg.naturalHeight);
        const iw = stripImg.naturalWidth * s;
        const ih = stripImg.naturalHeight * s;
        const ox = (W - iw) / 2;
        const oy = (H - ih) / 2;
        const h = H / BANDS;

        bands.forEach((b, i) => {
          Object.assign(b.style, {
            top: `${i * h}px`,
            height: `${Math.ceil(h) + 1}px`,
            left: '0px',
            width: `${W}px`,
            backgroundSize: `${iw}px ${ih}px`,
            backgroundPosition: `${ox}px ${oy - i * h}px`,
          });
        });
      };
      if (stripImg.complete) layoutStrip();
      stripImg.onload = layoutStrip;
      window.addEventListener('resize', layoutStrip);

      if (!still) {
        gsap.fromTo(bands, {
          x: (index: number) => {
            const position = (index + 0.5) / BANDS;
            const distance = Math.min(Math.abs(position - 0.45), Math.abs(position - 0.62));
            const calm = position > 0.45 && position < 0.62 ? 0 : clamp(distance / 0.06);
            return off(index, 18) * calm;
          },
        }, {
          x: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.shreshta-landing .reflect',
            start: 'top 85%',
            end: 'top 10%',
            scrub: true,
          },
        });
      }

      return () => {
        stripImg.onload = null;
        window.removeEventListener('resize', layoutStrip);
        bands.forEach((band) => band.remove());
      };
    });
    cleanups.push(() => editorialMedia.revert());

    // 4. Build 2-row x 72 vertical slices for #slices (#hull architecture)
    const slicesHost = slicesRef.current;
    const hullSrc = '/src/assets/images/album_wedding_hero_1795088227497.webp';
    const hullRows: HTMLDivElement[] = [];
    if (slicesHost) {
      slicesHost.innerHTML = '';
      for (let k = 0; k < 2; k++) {
        const part = document.createElement('div');
        part.className = 'part';
        for (let i = 0; i < SLICES; i++) {
          const b = document.createElement('b');
          b.style.backgroundImage = `url("${hullSrc}")`;
          part.appendChild(b);
        }
        slicesHost.appendChild(part);
        hullRows.push(part);
      }

      const hullImg = new Image();
      hullImg.src = hullSrc;
      const layoutHull = () => {
        if (!hullImg.naturalWidth || !slicesHost) return;
        const W = slicesHost.clientWidth;
        const H = slicesHost.clientHeight;
        const s = Math.max(W / hullImg.naturalWidth, H / hullImg.naturalHeight);
        const iw = hullImg.naturalWidth * s;
        const ih = hullImg.naturalHeight * s;
        const ox = (W - iw) / 2;
        const oy = (H - ih) / 2;
        const w = W / SLICES;

        hullRows.forEach((rowDiv, k) => {
          const y0 = k ? WL * H : 0;
          const h = k ? H - y0 : WL * H;
          Object.assign(rowDiv.style, {
            top: `${y0}px`,
            height: `${Math.ceil(h)}px`,
          });
          Array.from(rowDiv.children).forEach((child, i) => {
            const b = child as HTMLElement;
            Object.assign(b.style, {
              left: `${i * w}px`,
              width: `${Math.ceil(w) + 1}px`,
              top: '0px',
              height: `${Math.ceil(h)}px`,
              backgroundSize: `${iw}px ${ih}px`,
              backgroundPosition: `${ox - i * w}px ${oy - y0}px`,
            });
          });
        });
      };
      if (hullImg.complete) layoutHull();
      hullImg.onload = layoutHull;
      window.addEventListener('resize', layoutHull);
      cleanups.push(() => window.removeEventListener('resize', layoutHull));
    }

    if (!still) {
      const mandap = root.querySelector<HTMLElement>('#salon .track');
      const lenis: Lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 0.72,
        smoothWheel: true,
        virtualScroll: ({ event }) => !event.defaultPrevented,
      });
      lenisRef.current = lenis;
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);

      // Editorial sections may pin at the bottom. Long tracks pin only their own panels.
      const sheets = root.querySelectorAll<HTMLElement>('.overlap-sheet');
      const resizeSheets = () => {
        for (const sheet of sheets) {
          sheet.style.setProperty('--sheet-height', `${sheet.getBoundingClientRect().height}px`);
        }
      };
      const sheetObserver = new ResizeObserver(resizeSheets);
      for (const sheet of sheets) sheetObserver.observe(sheet);
      resizeSheets();
      root.classList.add('has-overlaps');


      const gsapCtx = gsap.context(() => {
        const slices = hullRows.flatMap((row) => Array.from(row.children));
        if (slices.length) {
          const scrollTrigger = {
            trigger: '.shreshta-landing .hull .track',
            start: 'top 80%',
            end: 'top -25%',
            scrub: true,
          };
          gsap.fromTo(slices, {
            y: (index: number) => 12 * Math.sin((index % SLICES) * 0.25 + 0.6),
          }, { y: 0, ease: 'power2.out', scrollTrigger });
          gsap.fromTo(slices, {
            x: (index: number) => index % SLICES < SLICES / 2 ? -4 : 4,
          }, { x: 0, ease: 'none', scrollTrigger });
        }

        // Celebrations window settle
        gsap.fromTo(
          '.shreshta-landing .win img',
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.shreshta-landing .voyages',
              start: 'top bottom',
              end: 'center center',
              scrub: true,
            },
          }
        );
      }, root);

      editorialMedia.add(EDITORIAL_LAYOUT, () => {
        // Salon background shift
        gsap.fromTo(
          '.shreshta-landing .salon',
          { '--salon-top': '#bc7b59' },
          {
            '--salon-top': '#faf4ea',
            ease: 'none',
            scrollTrigger: {
              trigger: '.shreshta-landing .salon .track',
              start: 'top top',
              end: 'top -15%',
              scrub: true,
            },
          }
        );

        // Florals light sweep & poster scale settle
        gsap.fromTo(
          '.shreshta-landing .poster .sweep',
          { '--sx': '46%' },
          {
            '--sx': '68%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.shreshta-landing .atrium',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );

        gsap.to('.shreshta-landing .poster-photo img', {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.shreshta-landing .atrium',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.fromTo('.shreshta-landing .trials .plate img', { scale: 1.06 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.shreshta-landing .trials',
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });

      editorialMedia.add(PHONE_LAYOUT, () => {
        // Reveal each photo within its frame without changing the section's layout.
        const photos = root.querySelectorAll('.story-photo img');
        photos.forEach((photo) => {
          gsap.fromTo(photo, { clipPath: 'inset(0% 6% 18% 6%)' }, {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: photo,
              start: 'top 96%',
              end: 'top 40%',
              scrub: true,
            },
          });
        });

        gsap.fromTo('.salon .hall', { y: 8, opacity: 0.8 }, {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: '.salon .track',
            start: 'top bottom',
            end: 'top 45%',
            scrub: true,
          },
        });

        gsap.fromTo('.poster .sweep', { '--sx': '32%' }, {
          '--sx': '68%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.poster',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      editorialMedia.add({ wide: EDITORIAL_LAYOUT, compact: COMPACT_SALON_LAYOUT }, ({ conditions }) => {
        const notes = root.querySelectorAll('.salon .cord');
        if (!conditions?.compact) {
          notes.forEach((note, index) => {
            gsap.fromTo(note, { '--k': 0 }, {
              '--k': 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: mandap,
                start: `top ${30 - index * 22}%`,
                end: `top ${-10 - index * 22}%`,
                scrub: true,
              },
            });
          });
          return;
        }
        const noteTransition = gsap.timeline({
          scrollTrigger: {
            trigger: mandap,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });

        notes.forEach((note, index) => {
          noteTransition.fromTo(note, { '--k': 0 }, { '--k': 1, duration: 0.12 }, MANDAP_REVEALS[index]);
        });
        noteTransition.set(notes[notes.length - 1], { '--k': 1 }, 1);
      });

      editorialMedia.add({ phone: PHONE_LAYOUT, pinned: PHONE_SALON_PINNED_LAYOUT }, ({ conditions }) => {
        if (!conditions?.phone || conditions.pinned) return;
        root.querySelectorAll('.salon .cord').forEach((note) => {
          gsap.fromTo(note, { y: 8, opacity: 0 }, {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: note,
              start: 'top bottom',
              end: 'top 76%',
              scrub: true,
            },
          });
        });
      });

      const slices = slicesRef.current;
      const shimmerObserver = new IntersectionObserver(([entry]) => {
        slices?.classList.toggle('is-shimmering', entry.isIntersecting);
      });
      if (slices) shimmerObserver.observe(slices);

      ScrollTrigger.refresh();
      cleanups.push(() => {
        sheetObserver.disconnect();
        shimmerObserver.disconnect();
        slices?.classList.remove('is-shimmering');
        root.classList.remove('has-overlaps');
        for (const sheet of sheets) sheet.style.removeProperty('--sheet-height');
        gsapCtx.revert();
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      });
    }

    const alignPage = (top: number) => {
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true });
      // A native touch fling can move the viewport while Lenis still targets this anchor.
      if (Math.abs(window.scrollY - top) > 0.5) window.scrollTo({ top, behavior: 'instant' });
    };

    const showcase = root.querySelector<HTMLElement>('#services');
    const stage = showcase?.querySelector<HTMLElement>('.services-sticky');
    if (showcase && stage) {
      const servicesTrack = bindSlideTrack(showcase, stage, CEREMONY_SLIDES.length, renderService, alignPage);
      selectService.current = servicesTrack.select;
      cleanups.push(() => {
        selectService.current = null;
        servicesTrack.destroy();
      });
    }

    // Keep the original plate, text and photo pan on the shared slide timing.
    const trackEl = numbersTrackRef.current;
    const processPanel = trackEl?.querySelector<HTMLElement>('.stick');
    const plates = plateRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const fline = flineRef.current;

    if (trackEl && processPanel && plates.length > 0) {
      const n = plates.length;
      const editorialLayout = window.matchMedia(EDITORIAL_LAYOUT);
      const ioCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const renderProcess = (from: number, to: number, t: number) => {
        const P = from + (to - from) * ioCubic(t);
        const width = trackEl.clientWidth;
        const splitLayout = editorialLayout.matches;
        const slideDistance = width + Math.round(width * 0.018);
        plates.forEach((el, k) => {
          const d = k - P;
          el.style.transform = `translate3d(${(d * slideDistance).toFixed(1)}px,0,0)`;
          el.style.setProperty('--px', `${(-d * 22).toFixed(2)}%`);
          el.style.visibility = Math.abs(d) > 1.4 ? 'hidden' : 'visible';
          el.style.opacity = clamp(1 - Math.abs(d) * 1.2).toFixed(3);
        });

        cards.forEach((c, k) => {
          const d = k - P;
          const active = Math.abs(d) < 0.55;
          c.setAttribute('aria-hidden', String(!active));
          c.style.pointerEvents = active ? '' : 'none';
          c.style.visibility = Math.abs(d) > 1.4 ? 'hidden' : 'visible';
          c.style.opacity = clamp(1 - Math.abs(d) * 1.5).toFixed(3);
          c.style.transform = splitLayout
            ? `translateY(-50%) translateX(${(d * width * 0.5).toFixed(1)}px)`
            : `translate3d(${(d * slideDistance).toFixed(1)}px,0,0)`;
        });

        if (fline) {
          fline.style.opacity = clamp(1 - 2 * Math.abs(P - Math.round(P))).toFixed(3);
        }
        setProcessIndex(Math.max(0, Math.min(n - 1, Math.round(P))));
      };

      const processTrack = bindSlideTrack(trackEl, processPanel, n, renderProcess, alignPage);
      selectProcessRef.current = processTrack.select;
      cleanups.push(() => {
        selectProcessRef.current = null;
        processTrack.destroy();
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [renderService, selectService]);

  useEffect(() => {
    if (navigateSection) {
      navigateSection.current = (targetId: string) => scrollToAnchor(targetId);
    }
    const followHash = () => scrollToAnchor(window.location.hash, true);
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => {
      if (navigateSection) navigateSection.current = null;
      window.removeEventListener('hashchange', followHash);
    };
  }, [navigateSection, scrollToAnchor]);

  return (
    <div ref={rootRef} className="shreshta-landing">
      {/* SVG water displacement ripple filter for dusk mirror reflection */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute' }}
        aria-hidden="true"
      >
        <filter
          id="shreshta-ripple"
          x="-5%"
          y="-20%"
          width="110%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0025 0.035"
            numOctaves={2}
            seed={7}
          >
            <animate
              attributeName="baseFrequency"
              values="0.0025 0.035;0.0025 0.042;0.0025 0.035"
              dur="9s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={6} />
        </filter>
      </svg>

      <SiteNavigation logoSrc={logoSrc} onHomeClick={handleHomeClick} />

      {/* 0 · Hero */}
      <header className="hero overlap-sheet" id="top" data-nav="light">
        <div className="film">
          <img
            src={OPENING_PHOTO}
            srcSet={`${OPENING_PHOTO_SMALL} 720w, ${OPENING_PHOTO} 1376w`}
            sizes="(orientation: portrait) max(100vw, 179svh), 100vw"
            alt="A couple exchanges rings under string lights in a limestone courtyard"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="lede">
          <p className="top">Crafted for the timeless moments between vows.</p>
          <div className="row">
            <span>{BRAND_NAME.toUpperCase()}</span>
            <span>
              <b>Bespoke wedding planning &amp; design in Hyderabad</b>
            </span>
            <span>5 Ceremonial Chapters</span>
            <span>
              <b>2026 &amp; 2027 Season</b>
            </span>
          </div>
        </div>
        <h1 aria-label={`${BRAND_NAME}, luxury wedding planners and event designers in Hyderabad`}>{wordmark}</h1>
      </header>

      <main id="main-content" tabIndex={-1}>
        {/* 1 · Our Story */}
        <section
          className="reflect overlap-sheet"
          id="our-story"
          data-nav="light"
          aria-label="Our story"
        >
          <div
            ref={stripRef}
            className="strip"
            role="img"
            aria-label={STORY_PHOTO_ALT}
          >
            <picture className="story-photo">
              <source media={PHONE_LAYOUT} srcSet={STORY_PHOTO_URL} />
              <img alt="" loading="lazy" decoding="async" />
            </picture>
          </div>
          <div className="words">
            <div className="l rv">
              <span className="cap">Our story</span>
              {STORY_PORTRAIT_LINES.map((line) => <p key={line}>{line}</p>)}
            </div>
            <div aria-hidden="true" />
            <p className="r rv">{STORY_LINE}</p>
          </div>
        </section>

        {/* 2 · Experiences (sliced mandap collage) */}
        <section
          className="hull"
          id="experiences"
          data-nav="light"
          aria-label="Experiences"
        >
          <div className="track">
            <div className="stick">
              <div
                ref={slicesRef}
                className="slices f4"
                role="img"
                aria-label="Carved palace sunset mandap framed by roses and mogra, sliced into vertical strips that align on scroll"
              />
              <div className="specs rv">
                <b>{wordmark} STUDIO</b>
                <span>5 bespoke ceremony worlds</span>
                <span>Carved stone &amp; timber mandaps</span>
                <span>Hyderabad, Telangana</span>
                <span>Engagement · Sangeet · Haldi · Wedding · Reception</span>
              </div>
              <span className="rot" aria-hidden="true">
                bespoke
              </span>
              <div className="sayline">
                <span className="script" aria-hidden="true">
                  at every scale
                </span>
                <p className="heavy">timeless.</p>
              </div>
            </div>
          </div>
        </section>

        {services}

        {/* 3 · Our process, in the original horizontal storytelling track */}
        <section className="numbers" id="numbers" data-nav="light" aria-labelledby="process-heading">
          <div ref={numbersTrackRef} className="track">
            <div className="stick">
              <div className="nums">
                {PROCESS_STAGES.map((stage, index) => (
                  <div
                    className="pl"
                    key={stage.title}
                    ref={(el) => { plateRefs.current[index] = el; }}
                  >
                    <div className="pl-visual">
                      <span className="pl-numeral" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <img
                        className="pl-photo"
                        src={'/src/assets/images/' + stage.image}
                        alt={stage.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <span className="cap kick">{BRAND_NAME} · Our process</span>
              <h2 ref={flineRef} id="process-heading" className="fline">
                From concept to unforgettable moments.
              </h2>
              {PROCESS_STAGES.map((stage, index) => (
                <div
                  className="card"
                  key={stage.title}
                  ref={(el) => { cardRefs.current[index] = el; }}
                >
                  <span className="n">{String(index + 1).padStart(2, '0')} / 06</span>
                  <h3 className="process-stage-title">{stage.title}</h3>
                  <p>{stage.story}</p>
                </div>
              ))}
              <button
                type="button"
                className="process-arrow process-arrow--prev"
                aria-label={
                  processIndex === 0
                    ? 'Go to previous section: Services'
                    : `Previous process stage: ${PROCESS_STAGES[processIndex - 1].title}`
                }
                onClick={() => {
                  if (processIndex === 0) {
                    scrollToAnchor('#services');
                  } else {
                    selectProcessRef.current?.(processIndex - 1);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M19 12H5M11 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="process-arrow process-arrow--next"
                aria-label={
                  processIndex === PROCESS_STAGES.length - 1
                    ? 'Go to next section: Our approach'
                    : `Next process stage: ${PROCESS_STAGES[processIndex + 1].title}`
                }
                onClick={() => {
                  if (processIndex === PROCESS_STAGES.length - 1) {
                    scrollToAnchor('#our-approach');
                  } else {
                    selectProcessRef.current?.(processIndex + 1);
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* 4 · Our Approach (The Florals & Atrium) */}
        <section
          className="atrium overlap-sheet"
          id="our-approach"
          data-nav="light"
          aria-label="Our approach"
        >
          <figure className="poster">
            <i className="sweep" aria-hidden="true" />
            <picture className="poster-photo">
              <source
                media={PHONE_PORTRAIT_LAYOUT}
                srcSet="/src/assets/images/approach-mandap-detail-portrait.webp"
                width={900}
                height={1600}
              />
              <img
                src="/src/assets/images/approach-mandap-detail.webp"
                alt="Carved timber mandap pillar draped with jasmine garlands and ivory linen beside a brass urli"
                width={1672}
                height={941}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <figcaption className="pcol rv">
              <h2>Our approach</h2>
              <p>
                Morning Pavilion
                <br />
                Fresh seasonal flowers
                <br />
                Hand-strung mogra &amp; genda
              </p>
              <p>
                Raw linen drapes
                <br />
                Hammered brass urlis
                <br />
                Filtered daylight
              </p>
            </figcaption>
            <p className="pword rv">
              Daylight falls through garlands of jasmine and gold.
            </p>
          </figure>
        </section>

        {/* 4b · The Salon (Suspended glass notes) */}
        <section
          className="salon"
          id="salon"
          data-nav="light"
          aria-label="The salon"
        >
          <div className="track">
            <div className="stick">
              <picture className="hall">
                <source
                  media={PHONE_PORTRAIT_LAYOUT}
                  srcSet="/assets/aistudio/golden-pavilion-portrait.webp"
                  width={900}
                  height={1600}
                />
                <img
                  src="/assets/aistudio/golden-pavilion.webp"
                  alt="Golden carved mandap with hanging flower garlands and a lantern-lit herringbone aisle"
                  width={1672}
                  height={941}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <h2 className="eave">The grand mandap</h2>
              <div className="salon-notes">
                <div
                  className="cord"
                  style={{ '--x': '9%', '--d': '13svh' } as React.CSSProperties}
                >
                  <div className="t">
                    <p>Three carved pavilions anchor the room beneath warm timber bays.</p>
                    <small>Stepped ivory spires · Carved pillars</small>
                  </div>
                </div>
                <div
                  className="cord"
                  style={{ '--x': '66%', '--d': '24svh' } as React.CSSProperties}
                >
                  <div className="t">
                    <p>Etched lotus screens glow softly behind jasmine and blush rose.</p>
                    <small>Botanical eaves · Hand-strung daily</small>
                  </div>
                </div>
                <div
                  className="cord"
                  style={{ '--x': '27%', '--d': '44svh' } as React.CSSProperties}
                >
                  <div className="t">
                    <p>Lantern light glides across herringbone oak toward the sacred altar.</p>
                    <small>Warm architectural wash · 2,700 K</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 · Celebrations (Editorial showcase + link to Services slider) */}
        <section
          className="voyages overlap-sheet"
          id="celebrations"
          data-nav="light"
          aria-label="Celebrations"
        >
          <div className="sheet6">
            <figure className="win rv">
              <img
                src="/src/assets/images/album_sangeet_hero_1795088227933.webp"
                alt="Grand sangeet stage lighting with live percussionists and couple dance celebration"
                loading="lazy"
                decoding="async"
              />
              <h2 className="mega">CELEBRATIONS</h2>
            </figure>
            <div className="info rv">
              <div className="labels">
                <span>Engagement</span>
                <span>Sangeet · Haldi</span>
                <span>Wedding · Reception</span>
              </div>
              <h3>
                Five ceremonial chapters <span className="bar">|</span>{' '}
                <em>curated as one</em>
              </h3>
              <p>
                Every {BRAND_NAME} wedding unfolds across five distinct visual
                chapters—from a twilight limestone engagement and morning marigold
                haldi courtyard to mirrored sangeet stages, sunset palace mandaps,
                and black-tie glasshouse galas. Explore the design details and
                photo album for each ceremony.
              </p>
              <b>Five moods, one studio, effortless orchestration.</b>
              <a href={SERVICES_HREF} className="services-link">
                Explore Wedding Services →
              </a>
              <div className="meta">
                <span>{BRAND_NAME}</span>
                <span>Curations 01 – 05</span>
                <span>2026 Studio</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6 · Studio Preview */}
        <section
          className="trials"
          id="trials"
          data-nav="light"
          aria-label="Studio preview"
        >
          <figure className="plate">
            <img
              src="/src/assets/images/temple_wedding_mandap_1795089784740.webp"
              alt="Hand-sculpted Dravidian sandstone wedding mandap with deity reliefs, jasmine and crimson rose garlands, brass lamps, and rattan aisle seating"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="say rv">
              <span className="cap">Temple mandap architecture, 2026 season</span>
              <h2>Every sculpture carved by hand before the sacred fire is lit.</h2>
            </figcaption>
          </figure>
        </section>

        {/* 7 · Enquire + Watermark Footer */}
        <section
          className="enquire"
          id="enquire"
          data-nav="dark"
          aria-label="Enquire"
        >
          <div className="inner">
            <div className="lead rv">
              <span className="cap">Enquire</span>
              <h2>Begin a private consultation.</h2>
              <p className="note">{CONSULTATION_NOTE}</p>
            </div>
            <ConsultationForm className="rv" />
          </div>
          <div className="mirror" aria-hidden="true">
            <span>{wordmark}</span>
            <span>{wordmark}</span>
          </div>
          <div className="foot">
            <span>{BRAND_NAME} · Wedding Planners &amp; Designers in Hyderabad</span>
            <span>
              <a href="/our-story/">About</a>
              <span aria-hidden="true"> · </span>
              <a href="/enquire/">Contact</a>
              <span aria-hidden="true"> · </span>
              <a href="/terms/">Terms</a>
              <span aria-hidden="true"> · </span>
              <a href="/privacy/">Privacy</a>
            </span>
            <span>Engagement · Sangeet · Haldi · Wedding · Reception</span>
          </div>
        </section>
      </main>
    </div>
  );
};
