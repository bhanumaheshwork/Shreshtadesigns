import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CEREMONY_SLIDES } from '../data/ceremonies';
import {
  CONSULTATION_NOTE,
  PROCESS_STAGES,
  STORY_LINE,
  STORY_PHOTO_ALT,
  STORY_PHOTO_URL,
  STORY_PORTRAIT_LINES,
} from '../data/studioContent';
import { ceremonyServiceHref, type StudioLink } from '../data/siteNavigation';
import { ConsultationForm } from './ConsultationForm';
import { SiteNavigation } from './SiteNavigation';
import './CeremonyPage.css';
import './StudioPage.css';

gsap.registerPlugin(ScrollTrigger);

interface StudioPhoto {
  src: string;
  alt: string;
}

const images = '/src/assets/images/';

const experienceDetails = [
  {
    title: 'Ceremony architecture',
    text: 'Carved stone and timber mandaps frame the rituals. The setting takes shape around the venue, the procession, and the people who will gather there.',
    photo: {
      src: images + 'temple_wedding_mandap_1795089784740.webp',
      alt: 'Carved temple mandap adorned with jasmine and crimson rose garlands',
    },
  },
  {
    title: 'Florals and materials',
    text: 'Hand-strung mogra and genda, raw linen, and hammered brass bring texture to the places guests see and touch up close.',
    photo: {
      src: images + 'approach-mandap-detail.webp',
      alt: 'Jasmine garlands and linen drapes beside a carved timber mandap pillar',
    },
  },
  {
    title: 'Lighting and performance',
    text: 'From the warmth of a lantern-lit aisle to the stage cues of a sangeet, lighting and sound follow the pace of each celebration.',
    photo: {
      src: images + 'album_sangeet_hero_1795088227933.webp',
      alt: 'A couple dancing on a candlelit sangeet stage surrounded by family and dhol musicians',
    },
  },
];

function StudioIntro({ title, photo, children }: {
  title: string;
  photo?: StudioPhoto;
  children: ReactNode;
}) {
  return (
    <div className={`studio-page__intro${photo ? ' studio-page__intro--split' : ''}`}>
      <div className="studio-page__intro-copy">
        <h1 id="studio-page-title">{title}</h1>
        {children}
      </div>
      {photo && <img src={photo.src} alt={photo.alt} fetchPriority="high" />}
    </div>
  );
}

function OurStory({ title }: { title: string }) {
  return (
    <StudioIntro title={title} photo={{ src: STORY_PHOTO_URL, alt: STORY_PHOTO_ALT }}>
      <p className="studio-page__quote">{STORY_LINE}</p>
      {STORY_PORTRAIT_LINES.map((line) => <p key={line}>{line}</p>)}
      <a className="studio-page__text-link" href="/our-approach/">
        Discover our approach <ArrowRight size={16} aria-hidden="true" />
      </a>
    </StudioIntro>
  );
}

function Experiences({ title }: { title: string }) {
  return (
    <>
      <StudioIntro title={title} photo={{
        src: images + 'album_wedding_hero_1795088227497.webp',
        alt: 'A rose-draped sandstone mandap surrounded by guests at sunset',
      }}>
        <p className="studio-page__lead">
          From intimate courtyard ceremonies to grand palace weddings, we bring together
          architecture, florals, lighting, and sound around the way you want to celebrate.
        </p>
        <dl className="studio-page__facts">
          <div><dt>Ceremonies</dt><dd>Five distinct formats</dd></div>
          <div><dt>Studio</dt><dd>Hyderabad, Telangana</dd></div>
        </dl>
      </StudioIntro>
      <section className="studio-page__section" aria-labelledby="experience-design">
        <h2 id="experience-design">Designing the experience</h2>
        <div className="studio-page__grid">
          {experienceDetails.map(({ title, text, photo }) => (
            <article key={title} className="studio-page__card">
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Celebrations({ title }: { title: string }) {
  return (
    <>
      <StudioIntro title={title}>
        <p className="studio-page__lead">
          Five ceremonies, from the first ring exchange to the last dance.
          Explore the design and album for each celebration.
        </p>
      </StudioIntro>
      <div className="studio-page__grid studio-page__grid--celebrations">
        {CEREMONY_SLIDES.map(({ id, name, album }) => (
          <a className="studio-page__card studio-page__card-link" href={ceremonyServiceHref(id)} key={id}>
            <img src={album.plates[0].src} alt="" loading="lazy" decoding="async" />
            <h2>{name}<ArrowUpRight size={20} aria-hidden="true" /></h2>
            <p>{album.storyLead}</p>
          </a>
        ))}
      </div>
    </>
  );
}

function OurApproach({ title }: { title: string }) {
  return (
    <>
      <StudioIntro title={title} photo={{
        src: images + 'approach-mandap-detail.webp',
        alt: 'Carved mandap pillar framed by jasmine, ivory linen, and a brass urli',
      }}>
        <p className="studio-page__lead">
          We start with the rituals you want to honour, the people you want beside you,
          and how you want the celebration to feel. Those choices guide us from the first
          sketch to the final send-off.
        </p>
        <a className="studio-page__text-link" href="/enquire/">
          Start a conversation <ArrowRight size={16} aria-hidden="true" />
        </a>
      </StudioIntro>
      <section className="studio-page__section" aria-labelledby="approach-process">
        <h2 id="approach-process">From concept to unforgettable moments</h2>
        <ol className="studio-page__grid">
          {PROCESS_STAGES.map((stage) => (
            <li key={stage.title} className="studio-page__card">
              <img src={images + stage.image} alt={stage.alt} loading="lazy" decoding="async" />
              <h3>{stage.title}</h3>
              <p>{stage.story}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Enquire({ title }: { title: string }) {
  return (
    <div className="studio-page__enquiry">
      <div>
        <StudioIntro title={title}>
          <p className="studio-page__quote">Begin a private consultation.</p>
          <p>{CONSULTATION_NOTE}</p>
          <p><a href="mailto:info@shreshtadesigns.com">info@shreshtadesigns.com</a></p>
        </StudioIntro>
        <img src={images + PROCESS_STAGES[0].image} alt={PROCESS_STAGES[0].alt} decoding="async" />
      </div>
      <div className="studio-page__enquiry-panel">
        <h2>Tell us about your celebration</h2>
        <ConsultationForm className="studio-page__form" />
      </div>
    </div>
  );
}

const pages = {
  'our-story': OurStory,
  experiences: Experiences,
  celebrations: Celebrations,
  'our-approach': OurApproach,
  enquire: Enquire,
};

export function StudioPage({
  page,
  logoSrc,
  transitionKey = 0,
}: {
  page: StudioLink;
  logoSrc: string;
  transitionKey?: number;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const Content = pages[page.id];

  useEffect(() => {
    const scroller = pageRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: 0, behavior: 'instant' });
    scroller.focus({ preventScroll: true });

    const media = gsap.matchMedia(scroller);
    media.add('(max-width: 719px) and (prefers-reduced-motion: no-preference)', () => {
      scroller.querySelectorAll('.studio-page__card img').forEach((photo) => {
        gsap.fromTo(photo, { clipPath: 'inset(0% 5% 16% 5%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power2.out',
          scrollTrigger: {
            scroller,
            trigger: photo,
            start: 'top 96%',
            end: 'top 45%',
            scrub: true,
          },
        });
      });
    });

    return () => media.revert();
  }, [page.id]);

  return (
    <div
      className={`ceremony-page studio-page studio-page--${page.id}`}
      ref={pageRef}
      tabIndex={-1}
      role="region"
      aria-labelledby="studio-page-title"
    >
      <SiteNavigation logoSrc={logoSrc} activePage={page} />
      <main
        key={page.id}
        id="main-content"
        tabIndex={-1}
        className={`ceremony-page__content${transitionKey ? ' route-transition-in' : ''}`}
      >
        <Content title={page.label} />
      </main>
    </div>
  );
}
