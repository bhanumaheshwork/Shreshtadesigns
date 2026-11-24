import { useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_NAME } from '../data/brand';
import { CEREMONY_SLIDES, type CeremonySlide } from '../data/ceremonies';
import { ceremonyAlbumHref, ceremonyServiceHref } from '../data/siteNavigation';
import { PLANNING_FAQS } from '../data/studioContent';
import './CeremonyPage.css';

function CeremonySection({ slide, priority }: { slide: CeremonySlide; priority: boolean }) {
  const { id, name, album, service } = slide;
  const [hero, detail] = album.plates;

  return (
    <section className="services-page__chapter" id={`service-${id}`} aria-labelledby={`service-${id}-title`}>
      <div className="ceremony-page__intro">
        <div>
          <h2 id={`service-${id}-title`} className="services-page__title">{name}</h2>
          <p className="ceremony-page__subtitle">{service.subtitle}</p>
          <p className="ceremony-page__lead">{album.storyLead}</p>
          <a
            className="ceremony-page__album-link"
            href={ceremonyAlbumHref(id)}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              // Preserve the chapter when Back returns to this page.
              history.replaceState(history.state, '', ceremonyServiceHref(id));
            }}
          >
            View {name} Album
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <figure className="ceremony-page__photo">
          <img
            src={hero.src}
            alt={hero.caption}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </figure>
      </div>

      <div className="ceremony-page__details">
        <figure className="ceremony-page__photo ceremony-page__photo--detail">
          <img src={detail.src} alt={detail.title} loading="lazy" decoding="async" />
        </figure>
        <div>
          <h3>What we design</h3>
          <ul className="ceremony-page__highlights">
            {service.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
      </div>

      <div className="ceremony-page__timeline">
        <h3>A sample celebration timeline</h3>
        <ol>
          {album.moments.map((moment) => (
            <li key={moment.time}>
              <p>{moment.time}</p>
              <h4>{moment.title}</h4>
              <p>{moment.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ServicesPage({
  logoSrc,
  hash = '',
  transitionKey = 0,
  restoreScrollTop,
}: {
  logoSrc: string;
  hash?: string;
  transitionKey?: number;
  restoreScrollTop?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let frame = 0;
    const restoreChapter = () => {
      cancelAnimationFrame(frame);
      const activeHash = hash || location.hash;
      const targetId = activeHash.slice(1);
      if (targetId) {
        const chapter = document.getElementById(targetId);
        if (chapter?.classList.contains('services-page__chapter')) {
          chapter.scrollIntoView({ block: 'start', behavior: 'instant' });
          return;
        }
      }
      if (restoreScrollTop !== undefined) {
        containerRef.current?.scrollTo({ top: restoreScrollTop, behavior: 'instant' });
        return;
      }
      frame = requestAnimationFrame(() => {
        const chapter = targetId ? document.getElementById(targetId) : null;
        if (chapter?.classList.contains('services-page__chapter')) {
          chapter.scrollIntoView({ block: 'start', behavior: 'instant' });
        } else {
          containerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
        }
      });
    };
    restoreChapter();
    window.addEventListener('pageshow', restoreChapter);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pageshow', restoreChapter);
    };
  }, [hash, restoreScrollTop]);

  return (
    <div
      ref={containerRef}
      className="ceremony-page services-page"
      role="region"
      aria-labelledby="services-page-title"
      tabIndex={-1}
    >
      <header className="ceremony-page__header">
        <div className="ceremony-page__nav services-page__nav">
          <a href="/" className="ceremony-page__logo" aria-label={`${BRAND_NAME} home`}>
            <img src={logoSrc} alt="" />
          </a>
          <a className="ceremony-album__enquire" href="/enquire/">
            Enquire
          </a>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className={`ceremony-page__content${transitionKey ? ' route-transition-in' : ''}`}
      >
        <h1 className="sr-only" id="services-page-title">Luxury wedding planning, mandap design and event management services in Hyderabad</h1>
        {CEREMONY_SLIDES.map((slide) => (
          <CeremonySection key={slide.id} slide={slide} priority={slide.id === CEREMONY_SLIDES[0].id} />
        ))}
        <section className="services-page__chapter" aria-labelledby="planning-questions">
          <div className="ceremony-page__details">
            <div>
              <h2 id="planning-questions">Planning your wedding</h2>
              <p className="ceremony-page__lead">Our Hyderabad studio brings wedding planning, mandap architecture, floral decor and on-site event management together across Hyderabad and destination venues in India.</p>
              <a className="ceremony-page__album-link" href="/enquire/">Request a wedding consultation</a>
            </div>
            <div>
              {PLANNING_FAQS.map(({ question, answer }) => (
                <div key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
