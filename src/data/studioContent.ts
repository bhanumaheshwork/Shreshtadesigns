import { BRAND_NAME } from './brand';

export const PROCESS_STAGES = [
  {
    title: 'Concept',
    story: 'We begin with your story. The rituals you grew up with, the people you want beside you, and the feeling you imagine for the day become our starting point.',
    image: 'process-01-concept.webp',
    alt: 'A couple shares their wedding ideas with a designer over an open notebook',
  },
  {
    title: 'Design',
    story: 'A flower, a fabric, a particular shade of stone. We bring these choices together in sketches and layouts that show how your celebration will look and feel.',
    image: 'process-02-design.webp',
    alt: 'A mandap sketch beside fabric swatches, jasmine and a carved stone sample',
  },
  {
    title: 'Planning',
    story: 'We map the guest arrivals, ceremony times, vendor schedules and budget. Every team knows where to be, from the first delivery to the final departure.',
    image: 'process-03-planning.webp',
    alt: 'Wedding planners review the venue floor plan and ceremony schedule',
  },
  {
    title: 'Production',
    story: 'The drawings take shape on site. Fabricators build the stage, florists dress the mandap, and the lighting and sound teams rehearse each cue.',
    image: 'process-04-production.webp',
    alt: 'Florists hang jasmine garlands on the carved timber mandap',
  },
  {
    title: 'Execution',
    story: 'As the first guests arrive, we guide the procession, cue the musicians and keep each ceremony on time. You can stay with the moment as it happens.',
    image: 'process-05-execution.webp',
    alt: 'A wedding coordinator cues the bridal procession toward the mandap',
  },
  {
    title: 'Memories',
    story: 'Long after the flowers come down, you remember exchanging garlands and hearing your family cheer. Those are the moments we plan around.',
    image: 'process-06-memories.webp',
    alt: 'The bride and groom laugh as they exchange jasmine and rose garlands',
  },
];

export const STORY_PHOTO_URL = '/src/assets/images/our-story-wedding-portrait.webp';
export const STORY_PHOTO_ALT = 'A bride and groom wearing jasmine and rose garlands beneath a carved timber mandap';
export const STORY_PORTRAIT_LINES = [
  'Every great celebration holds a still centre: the breath before the procession enters, the light catching carved stone, the hush just as two garlands meet.',
  `${BRAND_NAME} choreographs architectural mandaps, living botanicals, and spatial lighting so the room frames every emotion without noise.`,
];
export const STORY_LINE = 'Half of every ceremony is its stillness.';
export const CONSULTATION_NOTE = 'Tell our Hyderabad studio about your date, venue, or destination. We plan weddings and private celebrations across Engagement, Sangeet, Haldi, Wedding, and Reception—from mandap design and florals to full on-site management.';

export const PLANNING_FAQS = [
  {
    question: 'Who provides luxury wedding planning and design services in Hyderabad?',
    answer: `${BRAND_NAME} is a Hyderabad-based wedding planning and event design studio specializing in carved mandap architecture, floral decoration, stage lighting, and end-to-end celebration management.`,
  },
  {
    question: 'Which wedding ceremonies and functions do you plan?',
    answer: 'We plan and design full wedding weekends and individual private events, including Engagement soirées, Mehendi and Haldi mornings, Sangeet performances, Wedding baraat and pheras, and evening Receptions.',
  },
  {
    question: 'What does wedding planning and decoration include?',
    answer: 'We discuss your rituals, guests, and venue, then develop custom design boards, mandap and stage layouts, floral styling, lighting and sound cues, production schedules, and on-site coordination.',
  },
  {
    question: 'Do you plan destination weddings outside Hyderabad?',
    answer: 'Yes. While our design studio is based in Hyderabad, Telangana, we plan and produce luxury destination weddings across India, managing venue layouts, fabrication, and on-site hospitality.',
  },
  {
    question: 'What affects wedding decor and planning costs, and how can we enquire?',
    answer: 'Your quote depends on the venue, guest count, number of ceremonies, and production scope such as custom mandaps, florals, and lighting. Submit the enquiry form, email info@shreshtadesigns.com, or message us on WhatsApp to book a consultation.',
  },
] as const;
