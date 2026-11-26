import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { BRAND_EMAIL, BRAND_NAME, BRAND_PHONE_E164 } from '../data/brand';
import { CEREMONY_SLIDES } from '../data/ceremonies';
import {
  CONSULTATION_NOTE,
  PROCESS_STAGES,
  STORY_LINE,
  STORY_PHOTO_ALT,
  STORY_PHOTO_URL,
  STORY_PORTRAIT_LINES,
} from '../data/studioContent';
import { ceremonyServiceHref, type StudioPageLink } from '../data/siteNavigation';
import { ConsultationForm } from './ConsultationForm';
import { PlanningFaqAccordion } from './PlanningFaqAccordion';
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
    <>
      <StudioIntro title={title} photo={{ src: STORY_PHOTO_URL, alt: STORY_PHOTO_ALT }}>
        <p className="studio-page__quote">{STORY_LINE}</p>
        {STORY_PORTRAIT_LINES.map((line) => <p key={line}>{line}</p>)}
        <dl className="studio-page__facts">
          <div><dt>Studio</dt><dd>Hyderabad, Telangana</dd></div>
          <div><dt>Coverage</dt><dd>Hyderabad &amp; India</dd></div>
        </dl>
        <a className="studio-page__text-link" href="/our-approach/">
          Discover our wedding planning approach <ArrowRight size={16} aria-hidden="true" />
        </a>
      </StudioIntro>
      <section className="studio-page__section" aria-labelledby="about-questions">
        <div className="ceremony-page__details" style={{ paddingTop: 0, paddingBottom: 0, borderBottom: 0 }}>
          <div>
            <h2 id="about-questions">Frequently asked questions</h2>
            <p className="ceremony-page__lead">
              Answers about our Hyderabad wedding planning studio, ceremonies, destination coverage, and consultations.
            </p>
            <a className="studio-page__text-link" href="/enquire/">
              Request a wedding consultation <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <PlanningFaqAccordion />
        </div>
      </section>
    </>
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
          From intimate courtyard Mehendi and Haldi mornings to grand palace weddings in Hyderabad and across India, we bring together
          mandap architecture, floral decor, lighting, and sound around the way you want to celebrate.
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
          Five wedding ceremonies—from the first ring exchange to the last dance—designed and managed in Hyderabad and destination venues across India.
          Explore the decor and album for each celebration.
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
          and how you want the celebration to feel. From our Hyderabad studio to destination venues across India, those choices guide us from the first
          sketch to the final send-off.
        </p>
        <a className="studio-page__text-link" href="/enquire/">
          Start a wedding consultation <ArrowRight size={16} aria-hidden="true" />
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

function Terms({ title }: { title: string }) {
  return (
    <>
      <StudioIntro title={title}>
        <p className="studio-page__lead">
          Terms governing the use of the {BRAND_NAME} website and wedding consultation enquiries.
        </p>
      </StudioIntro>
      <section className="studio-page__section" aria-labelledby="terms-scope">
        <h2 id="terms-scope">Website &amp; Consultation Terms</h2>
        <div className="studio-page__grid">
          <article className="studio-page__card">
            <h3>Informational Showcase</h3>
            <p>
              Ceremony descriptions, design boards, sample timelines, and gallery albums represent
              design inspiration and planning capabilities offered by {BRAND_NAME} in Hyderabad and
              across India.
            </p>
          </article>
          <article className="studio-page__card">
            <h3>Consultations &amp; Quotations</h3>
            <p>
              Submitting a consultation enquiry does not create a binding booking. Event dates,
              custom mandap architecture, floral designs, and pricing are confirmed separately by
              written agreement.
            </p>
          </article>
          <article className="studio-page__card">
            <h3>Contact</h3>
            <p>
              For questions regarding these terms or an active celebration proposal, email{' '}
              <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a> or message us on WhatsApp at{' '}
              {BRAND_PHONE_E164}.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

function Privacy({ title }: { title: string }) {
  return (
    <>
      <StudioIntro title={title}>
        <p className="studio-page__lead">
          How {BRAND_NAME} handles the details you share when requesting a wedding planning
          consultation.
        </p>
      </StudioIntro>
      <section className="studio-page__section" aria-labelledby="privacy-details">
        <h2 id="privacy-details">Enquiry Data &amp; Privacy</h2>
        <div className="studio-page__grid">
          <article className="studio-page__card">
            <h3>Information You Submit</h3>
            <p>
              When you submit the consultation form, we receive your name, partner&rsquo;s name,
              email address, contact number, wedding date, expected guest count, venue ideas, and
              celebration notes.
            </p>
          </article>
          <article className="studio-page__card">
            <h3>How We Use It</h3>
            <p>
              We use these details solely to respond to your enquiry, prepare design and
              production discussions, and coordinate your consultation. We do not sell your
              contact information.
            </p>
          </article>
          <article className="studio-page__card">
            <h3>Updates &amp; Removal</h3>
            <p>
              To update or request deletion of enquiry details you have sent to our Hyderabad
              studio, write to <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

const pages = {
  'our-story': OurStory,
  experiences: Experiences,
  celebrations: Celebrations,
  'our-approach': OurApproach,
  enquire: Enquire,
  terms: Terms,
  privacy: Privacy,
};

export function StudioPage({
  page,
  logoSrc,
  transitionKey = 0,
  restoreScrollTop,
}: {
  page: StudioPageLink;
  logoSrc: string;
  transitionKey?: number;
  restoreScrollTop?: number;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const Content = pages[page.id];

  useLayoutEffect(() => {
    const scroller = pageRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: restoreScrollTop ?? 0, behavior: 'instant' });
    scroller.focus({ preventScroll: true });
  }, [page.id, restoreScrollTop]);

  useEffect(() => {
    const scroller = pageRef.current;
    if (!scroller) return;

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
