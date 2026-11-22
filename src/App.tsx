import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  SHOWCASE_ASSETS,
  CEREMONY_SLIDES,
  FLOOR_SHADOWS,
} from './data/ceremonies';
import { ShreshtaLandingPage } from './components/ShreshtaLandingPage';
import { ceremonyServiceHref } from './data/siteNavigation';
import { ceremonyStep } from './utils/ceremonyScroll';

const TRANSITION_MS = 970;
const COVER_TABLE: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0.031, 0.006], [0.134, 0.012], [0.206, 0.023],
  [0.278, 0.047], [0.34, 0.07], [0.412, 0.105], [0.485, 0.158],
  [0.546, 0.246], [0.583, 0.55], [0.62, 0.825], [0.69, 0.9],
  [0.79, 0.94], [0.85, 0.956], [0.93, 0.975], [1, 1],
];

const PARALLAX_FACTORS = {
  word: 0.4,
  shadow: 0.3,
  centerpiece: 0.15,
  fruit: 0.55,
  corner: 0.75,
} as const;

type LayerName = keyof typeof PARALLAX_FACTORS;
const LAYER_NAMES: LayerName[] = ['word', 'shadow', 'centerpiece', 'fruit', 'corner'];

function smoothstep(k: number): number {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
}

function easeOutQuad(k: number): number {
  const c = Math.max(0, Math.min(1, k));
  return 1 - (1 - c) * (1 - c);
}

function sampleCover(t: number): number {
  if (t <= 0) return 0;
  for (let i = 1; i < COVER_TABLE.length; i++) {
    const [end, endCover] = COVER_TABLE[i];
    if (t <= end) {
      const [start, startCover] = COVER_TABLE[i - 1];
      return startCover + (endCover - startCover) * smoothstep((t - start) / (end - start));
    }
  }
  return 1;
}

interface WordLayout {
  fontSize: number;
  letterSpacing: string;
  top: number;
}

function computeWordLayout(
  word: string,
  ctx: CanvasRenderingContext2D | null,
  isMobile: boolean,
  vw: number,
  u: number
): WordLayout {
  let baseInkWidth = word.length * 64;
  if (ctx) {
    ctx.font = '700 100px "Bodoni Moda", Didot, "Times New Roman", serif';
    const metrics = ctx.measureText(word);
    const left = metrics.actualBoundingBoxLeft ?? 0;
    const right = metrics.actualBoundingBoxRight ?? metrics.width;
    baseInkWidth = Math.max(metrics.width, left + right);
  }

  const visibleDesignWidth = isMobile ? Math.min(1440, vw / Math.max(0.01, u)) * 0.92 : 1240;
  const maxInkWidth = isMobile ? visibleDesignWidth : 1280;

  const defaultSize = 445;
  const defaultInk =
    (baseInkWidth / 100) * defaultSize + Math.max(0, word.length - 1) * 0.01 * defaultSize;

  let fontSize = defaultSize;
  let letterSpacing = '0.01em';

  if (defaultInk > visibleDesignWidth) {
    letterSpacing = '-0.015em';
    const widthPerPx = baseInkWidth / 100 - Math.max(0, word.length - 1) * 0.015;
    fontSize = Math.min(445, maxInkWidth / Math.max(0.15, widthPerPx));
  }

  const baseline = 403.5 + (0.698 * fontSize) / 2;
  const top = baseline - 0.85 * fontSize;
  return { fontSize, letterSpacing, top };
}

export default function App({ logoSrc }: { logoSrc: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [wordLayouts, setWordLayouts] = useState<Record<string, WordLayout>>({});
  const [underline, setUnderline] = useState({ left: 0, width: 0, ready: false });

  const showcaseRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const layerRefs = useRef<Array<Record<LayerName, HTMLDivElement | null>>>(
    CEREMONY_SLIDES.map(() => ({
      word: null,
      shadow: null,
      centerpiece: null,
      fruit: null,
      corner: null,
    }))
  );
  const tabRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const uRef = useRef(1);
  // Compute --u, --n, --fy, mobile breakpoint, and giant word sizes
  const recomputeLayout = useCallback(() => {
    const vw = window.innerWidth;
    const vh = stageRef.current?.clientHeight ?? window.innerHeight;
    const mobile = vw < 720;
    const u = mobile
      ? Math.min(vw / 640, Math.max(120, vh - 200) / 620)
      : Math.min(vw / 1440, vh / 900);
    const fy = mobile ? 8 : 0;

    uRef.current = u;
    document.documentElement.style.setProperty('--u', `${u}px`);
    document.documentElement.style.setProperty('--fy', `${fy}px`);
    document.documentElement.style.setProperty(
      '--n',
      mobile ? '1px' : 'clamp(0.5px, min(100vw / 1440, 100vh / 900), 1.3px)'
    );

    setIsMobile(mobile);

    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement('canvas');
    }
    const ctx = measureCanvasRef.current.getContext('2d');
    const layouts: Record<string, WordLayout> = {};
    for (const slide of CEREMONY_SLIDES) {
      layouts[slide.id] = computeWordLayout(slide.name, ctx, mobile, vw, u);
    }
    setWordLayouts(layouts);
  }, []);

  const syncUnderline = useCallback((index: number) => {
    const tab = tabRefs.current[index];
    if (!tab) return;
    setUnderline({
      left: tab.offsetLeft,
      width: tab.offsetWidth,
      ready: true,
    });
  }, []);

  useLayoutEffect(() => {
    recomputeLayout();
    let active = true;
    document.fonts.ready.then(() => {
      if (active) recomputeLayout();
    });
    window.addEventListener('resize', recomputeLayout);
    return () => {
      active = false;
      window.removeEventListener('resize', recomputeLayout);
    };
  }, [recomputeLayout]);

  useLayoutEffect(() => {
    syncUnderline(currentIndex);
  }, [currentIndex, isMobile, wordLayouts, syncUnderline]);

  useLayoutEffect(() => {
    const showcase = showcaseRef.current;
    const sticky = stickyRef.current;
    if (!showcase || !sticky) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const slideCount = CEREMONY_SLIDES.length;
    let scrollFrame = 0;
    let animationFrame = 0;
    let settled = -1;
    let desired = 0;
    let active = -1;
    let transition: { from: number; to: number; elapsed: number; lastFrame: number } | undefined;

    const renderSlides = (from: number, to: number, progress: number) => {
      const wiping = from !== to;
      const direction = Math.sign(to - from);
      const cover = sampleCover(progress);
      const incomingProgress = easeOutQuad((progress - 0.5) / 0.42);
      const frameWidth = 1440 * uRef.current;
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        const visible = index === from || index === to;
        slide.style.display = visible ? 'block' : 'none';
        slide.style.zIndex = index === from ? '2' : '1';
        slide.style.clipPath = wiping && index === from
          ? direction > 0 ? `inset(0 ${cover * 100}% 0 0)` : `inset(0 0 0 ${cover * 100}%)`
          : '';

        if (!visible) return;
        for (const name of LAYER_NAMES) {
          const layer = layerRefs.current[index][name];
          if (!layer) continue;
          const factor = index === from
            ? -direction * 0.14 * cover
            : direction * (1 - incomingProgress) * PARALLAX_FACTORS[name];
          layer.style.transform = wiping ? `translateX(${factor * frameWidth}px)` : '';
        }
      });
      const nextActive = cover < 0.5 ? from : to;
      if (active !== nextActive) {
        active = nextActive;
        setCurrentIndex(active);
      }
    };

    const animate = (now: number) => {
      animationFrame = 0;
      if (!transition) {
        if (desired === settled) return;
        transition = { from: settled, to: settled + Math.sign(desired - settled), elapsed: 0, lastFrame: now };
      }

      const { from, to, lastFrame } = transition;
      const forward = Math.sign(desired - from) === Math.sign(to - from);
      const elapsed = transition.elapsed + Math.max(0, now - lastFrame) * (forward ? 1 : -1);
      transition.lastFrame = now;
      transition.elapsed = elapsed;

      if (elapsed >= TRANSITION_MS || (!forward && elapsed <= 0)) {
        settled = forward ? to : from;
        transition = undefined;
        renderSlides(settled, settled, 0);
      } else {
        renderSlides(from, to, elapsed / TRANSITION_MS);
      }

      if (transition || desired !== settled) animationFrame = requestAnimationFrame(animate);
    };

    // Scroll selects the ceremony. The reference wipe has its own timing so a fast input
    // cannot run the visual transition to completion in a single frame.
    const updateSlides = () => {
      scrollFrame = 0;
      const { top, bottom } = showcase.getBoundingClientRect();
      const position = -top / ceremonyStep(showcase, sticky);
      desired = Math.min(slideCount - 1, Math.max(0, Math.floor(position + 0.275)));

      if (settled < 0 || motion.matches || top >= window.innerHeight || bottom <= 0) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        if (transition || settled !== desired) renderSlides(desired, desired, 0);
        settled = desired;
        transition = undefined;
      } else if (!animationFrame && settled !== desired) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateSlides);
    };

    updateSlides();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    motion.addEventListener('change', onScroll);
    return () => {
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      motion.removeEventListener('change', onScroll);
    };
  }, []);

  const activeSlide = CEREMONY_SLIDES[currentIndex];

  const servicesSlider = (
    <section
      id="services"
      ref={showcaseRef}
      className={`services-showcase${isMobile ? ' is-mobile' : ''}`}
      data-nav="light"
      aria-label="Wedding ceremony showcase"
      style={{ '--service-count': CEREMONY_SLIDES.length } as React.CSSProperties}
    >
      <div ref={stickyRef} className="services-sticky">
        <div ref={stageRef} className="hero-stage">
          {CEREMONY_SLIDES.map((slide, idx) => {
            const wordLayout = wordLayouts[slide.id] ?? {
              fontSize: 445,
              letterSpacing: '0.005em',
              top: 181,
            };

            const [width, height] = SHOWCASE_ASSETS[slide.centerpieceKey];
            const cRatio = width / height;
            const box = slide.centerpieceBox;
            const fittedW = Math.min(box.maxW, box.maxH * cRatio);
            const fittedH = fittedW / cRatio;
            const cLeft = box.cx - fittedW / 2;
            const cTop = box.bottomY - fittedH;

            const sharpPieces = slide.pieces.filter((p) => p.layer === 'fruit');
            const cornerPieces = slide.pieces.filter((p) => p.layer === 'corner');

            return (
              <div
                key={slide.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="hero-slide"
                aria-hidden={idx !== currentIndex}
              >
                <div className="hero-frame">
                  {/* 1. Word layer */}
                  <div
                    ref={(el) => {
                      layerRefs.current[idx].word = el;
                    }}
                    className="hero-layer"
                  >
                    <div
                      className="hero-word"
                      style={{
                        fontSize: `calc(${wordLayout.fontSize} * var(--u))`,
                        letterSpacing: wordLayout.letterSpacing,
                        top: `calc(${wordLayout.top} * var(--u))`,
                      }}
                    >
                      {slide.name}
                    </div>
                  </div>

                  {/* 2. Floor shadows layer */}
                  <div
                    ref={(el) => {
                      layerRefs.current[idx].shadow = el;
                    }}
                    className="hero-layer"
                  >
                    {FLOOR_SHADOWS.map((sh) => (
                      <div
                        key={sh.id}
                        className="hero-shadow-ellipse"
                        style={{
                          left: `calc(${sh.cx - sh.w / 2} * var(--u))`,
                          top: `calc(${sh.cy - sh.h / 2} * var(--u))`,
                          width: `calc(${sh.w} * var(--u))`,
                          height: `calc(${sh.h} * var(--u))`,
                        }}
                      />
                    ))}
                  </div>

                  {/* 3. Centerpiece layer (static, never bobs) */}
                  <div
                    ref={(el) => {
                      layerRefs.current[idx].centerpiece = el;
                    }}
                    className="hero-layer"
                  >
                    <div
                      className="hero-centerpiece-wrap"
                      style={{
                        left: `calc(${cLeft} * var(--u))`,
                        top: `calc(${cTop} * var(--u))`,
                        width: `calc(${fittedW} * var(--u))`,
                        height: `calc(${fittedH} * var(--u))`,
                      }}
                    >
                      <img
                        src={`/src/assets/images/showcase/${slide.centerpieceKey}.webp`}
                        alt={`${slide.name} centerpiece`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="hero-centerpiece-img"
                      />
                    </div>
                  </div>

                  {/* 4. Sharp floating motifs layer */}
                  <div
                    ref={(el) => {
                      layerRefs.current[idx].fruit = el;
                    }}
                    className="hero-layer"
                  >
                    {sharpPieces.map((piece) => {
                      const [width, height] = SHOWCASE_ASSETS[piece.assetKey];
                      const h = piece.w * height / width;
                      return (
                        <div
                          key={piece.id}
                          className="hero-motif-outer"
                          style={{
                            left: `calc(${piece.x} * var(--u))`,
                            top: `calc(${piece.y} * var(--u))`,
                            width: `calc(${piece.w} * var(--u))`,
                            height: `calc(${h} * var(--u))`,
                            transform: piece.mirror ? 'scaleX(-1)' : undefined,
                          }}
                        >
                          <div
                            className="hero-motif-inner"
                            style={
                              {
                                '--rot': `${piece.rotation}deg`,
                                animationDuration: `${piece.bobDuration}s`,
                                animationDelay: `${piece.bobDelay}s`,
                              } as React.CSSProperties
                            }
                          >
                            <img
                                src={`/src/assets/images/showcase/${piece.assetKey}.webp`}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="hero-motif-img"
                              />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 5. Blurred corner motifs layer */}
                  <div
                    ref={(el) => {
                      layerRefs.current[idx].corner = el;
                    }}
                    className="hero-layer hero-layer--corner"
                  >
                    {cornerPieces.map((piece) => {
                      const [width, height] = SHOWCASE_ASSETS[piece.assetKey];
                      const h = piece.w * height / width;
                      return (
                        <div
                          key={piece.id}
                          className="hero-motif-outer"
                          style={{
                            left: `calc(${piece.x} * var(--u))`,
                            top: `calc(${piece.y} * var(--u))`,
                            width: `calc(${piece.w} * var(--u))`,
                            height: `calc(${h} * var(--u))`,
                            transform: piece.mirror ? 'scaleX(-1)' : undefined,
                          }}
                        >
                          <div
                            className="hero-motif-inner"
                            style={
                              {
                                '--rot': `${piece.rotation}deg`,
                                animationDuration: `${piece.bobDuration}s`,
                                animationDelay: `${piece.bobDelay}s`,
                              } as React.CSSProperties
                            }
                          >
                            <img
                                src={`/src/assets/images/showcase/${piece.assetKey}.webp`}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="hero-motif-img"
                              />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hero-ui">
          <header className="hero-header">
            <div className="hero-tabs" aria-label="Wedding ceremonies">
              {CEREMONY_SLIDES.map((slide, idx) => (
                <span
                  key={slide.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  className="hero-tab hero-ui-text"
                  aria-current={idx === currentIndex ? 'true' : undefined}
                >
                  {slide.name}
                </span>
              ))}
              <div
                className="hero-tab-underline"
                aria-hidden="true"
                style={{
                  width: `${underline.width}px`,
                  transform: `translateX(${underline.left}px)`,
                  opacity: underline.ready ? 1 : 0,
                }}
              />
            </div>
          </header>

          <a
            href={ceremonyServiceHref(activeSlide.id)}
            className="hero-cta hero-ui-text"
          >
            Explore {activeSlide.name}
          </a>
        </div>
      </div>
    </section>
  );

  return <ShreshtaLandingPage logoSrc={logoSrc} services={servicesSlider} />;
}
