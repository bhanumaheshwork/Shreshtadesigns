export type CeremonyId = 'engagement' | 'sangeet' | 'haldi' | 'wedding' | 'reception';

export interface MotifPieceSpec {
  id: string;
  assetKey: MotifAssetKey;
  label: string;
  x: number;
  y: number;
  w: number;
  rotation: number;
  mirror: boolean;
  layer: 'fruit' | 'corner';
  bobDuration: number;
  bobDelay: number;
}

export type CenterpieceAssetKey =
  | 'engagement_centerpiece'
  | 'sangeet_centerpiece'
  | 'haldi_centerpiece'
  | 'wedding_centerpiece'
  | 'reception_centerpiece';

export type MotifAssetKey =
  | 'motif_rings'
  | 'motif_ghungroo'
  | 'motif_tabla'
  | 'motif_disco_ball'
  | 'motif_vinyl'
  | 'motif_disco_coupe'
  | 'motif_reception_cake'
  | 'motif_champagne_bottle'
  | 'motif_champagne_flute'
  | 'motif_reception_chandelier'
  | 'motif_reception_minicake'
  | 'motif_reception_candelabra'
  | 'motif_marigold'
  | 'motif_rose'
  | 'motif_coupe'
  | 'motif_jasmine';

export interface CeremonyServicePackage {
  subtitle: string;
  duration: string;
  guestRange: string;
  startingPrice: string;
  highlights: string[];
}

export interface AlbumPlate {
  id: string;
  src: string;
  title: string;
  caption: string;
  locationNote: string;
  aspect: 'landscape' | 'portrait' | 'square';
}

export interface CeremonyAlbumData {
  chapter: string;
  paletteName: string;
  storyLead: string;
  plates: AlbumPlate[];
  moments: Array<{ time: string; title: string; detail: string }>;
}

export interface CeremonySlide {
  id: CeremonyId;
  name: string;
  backdrop: string;
  centerpieceKey: CenterpieceAssetKey;
  centerpieceBox: {
    cx: number;
    bottomY: number;
    maxW: number;
    maxH: number;
  };
  pieces: MotifPieceSpec[];
  service: CeremonyServicePackage;
  album: CeremonyAlbumData;
}

// Dimensions match the preprocessed slider cutouts used for layout.
export const SHOWCASE_ASSETS: Record<CenterpieceAssetKey | MotifAssetKey, readonly [number, number]> = {
  engagement_centerpiece: [436, 795],
  sangeet_centerpiece: [854, 861],
  haldi_centerpiece: [599, 556],
  wedding_centerpiece: [501, 597],
  reception_centerpiece: [580, 916],
  motif_rings: [538, 525],
  motif_ghungroo: [347, 748],
  motif_tabla: [556, 380],
  motif_disco_ball: [413, 591],
  motif_vinyl: [617, 615],
  motif_disco_coupe: [399, 556],
  motif_reception_cake: [474, 464],
  motif_champagne_bottle: [157, 547],
  motif_champagne_flute: [161, 559],
  motif_reception_chandelier: [449, 608],
  motif_reception_minicake: [450, 531],
  motif_reception_candelabra: [331, 565],
  motif_marigold: [547, 598],
  motif_rose: [569, 523],
  motif_coupe: [375, 537],
  motif_jasmine: [556, 440],
};

export const FLOOR_SHADOWS = [
  { id: 'left-fruit', cx: 345, cy: 650, w: 170, h: 24 },
  { id: 'centerpiece', cx: 720, cy: 708, w: 320, h: 30 },
  { id: 'right-fruit', cx: 1318, cy: 638, w: 160, h: 22 },
  { id: 'bottom-right-fruit', cx: 1045, cy: 760, w: 150, h: 22 },
] as const;

export const CEREMONY_SLIDES: CeremonySlide[] = [
  {
    id: 'engagement',
    name: 'Engagement',
    backdrop: '#98644B',
    centerpieceKey: 'engagement_centerpiece',
    centerpieceBox: {
      cx: 720,
      bottomY: 718,
      maxW: 500,
      maxH: 585,
    },
    pieces: [
      {
        id: 'engagement-1',
        assetKey: 'motif_rings',
        label: 'Interlocking diamond engagement rings',
        x: 356,
        y: 160,
        w: 128,
        rotation: -10,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.9,
        bobDelay: -1.3,
      },
      {
        id: 'engagement-2',
        assetKey: 'motif_jasmine',
        label: 'White mogra floral cluster',
        x: 978,
        y: 215,
        w: 132,
        rotation: 8,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.4,
        bobDelay: -2.6,
      },
      {
        id: 'engagement-3',
        assetKey: 'motif_rose',
        label: 'Velvet garden rose',
        x: 290,
        y: 468,
        w: 132,
        rotation: -8,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.6,
        bobDelay: -0.9,
      },
      {
        id: 'engagement-4',
        assetKey: 'motif_rings',
        label: 'Diamond rings in velvet box',
        x: 1240,
        y: 446,
        w: 134,
        rotation: 12,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.5,
        bobDelay: -3.1,
      },
      {
        id: 'engagement-5',
        assetKey: 'motif_rings',
        label: 'Ring exchange centerpiece accent',
        x: 966,
        y: 582,
        w: 124,
        rotation: -14,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.0,
        bobDelay: -1.9,
      },
      {
        id: 'engagement-c1',
        assetKey: 'motif_rings',
        label: 'Blurred rings corner motif',
        x: -14,
        y: 575,
        w: 245,
        rotation: -8,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.8,
        bobDelay: -2.2,
      },
      {
        id: 'engagement-c2',
        assetKey: 'motif_rose',
        label: 'Blurred rose corner motif',
        x: 1280,
        y: 35,
        w: 205,
        rotation: 14,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.3,
        bobDelay: -0.7,
      },
    ],
    service: {
      subtitle: 'Ring Ceremony Styling, Portraits & Soirée',
      duration: 'Evening Soirée (4 Hours)',
      guestRange: '100 – 300 Guests',
      startingPrice: '$3,900',
      highlights: [
        'Bespoke floral ring-exchange pavilion & velvet heirloom ring platter styling',
        'Editorial couple portraiture, candid family coverage & instant film keepsakes',
        'Curated champagne & botanical mocktail welcome bar with live acoustic strings',
        'Custom invitation suite, welcome signage & intimate candlelit seating lounge',
      ],
    },
    album: {
      chapter: '01. Engagement Album',
      paletteName: 'Ivory · Emerald Velvet · Candlelight Gold',
      storyLead:
        'An intimate twilight celebration in a limestone courtyard—framed around heirloom rings, candid laughter, and luminous floral arches.',
      plates: [
        {
          id: 'eng-p1',
          src: '/src/assets/images/album_engagement_hero_1795088227985.webp',
          title: 'Twilight Courtyard Ring Exchange',
          caption:
            'Beneath a canopy of warm fairy lights and white jasmine arches, the couple exchanges rings surrounded by family.',
          locationNote: 'Main Courtyard · Dusk',
          aspect: 'landscape',
        },
        {
          id: 'eng-p2',
          src: '/src/assets/images/album_engagement_detail_1795088227111.webp',
          title: 'Solitaire & Henna Filigree',
          caption:
            'A quiet portrait of interlaced hands, intricate mehendi, and crystal champagne coupes by candlelight.',
          locationNote: 'Aperitif Terrace · 7:45 PM',
          aspect: 'landscape',
        },
        {
          id: 'eng-p3',
          src: '/src/assets/images/engagement_couple_centerpiece_1795079876984.jpg',
          title: 'Emerald & Champagne Editorial',
          caption:
            'Full-length bridal and groom styling pairing deep velvet zardozi with tailored champagne silk.',
          locationNote: 'Portrait Studio · Pre-Ceremony',
          aspect: 'portrait',
        },
        {
          id: 'eng-p4',
          src: '/src/assets/images/engagement_motif_rings_1795079876310.jpg',
          title: 'Heirloom Rose-Gold & Platinum Bands',
          caption:
            'Interlocking diamond rings presented in a bespoke ivory-velvet keepsake box.',
          locationNote: 'Ring Pavilion · Detail',
          aspect: 'square',
        },
      ],
      moments: [
        {
          time: '01. Arrival',
          title: 'Acoustic Welcome & Polaroid Guestbook',
          detail: 'String duo reception with chilled botanical spritzes and handwritten keepsake cards.',
        },
        {
          time: '02. Exchange',
          title: 'Ceremonial Ring Presentation',
          detail: 'Floral-framed spotlight moment with family blessings and champagne pour.',
        },
        {
          time: '03. Portraits',
          title: 'Editorial Couple & Family Frames',
          detail: 'Dedicated studio-lit portrait corner capturing relaxed editorial moments.',
        },
      ],
    },
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    backdrop: '#794520',
    centerpieceKey: 'sangeet_centerpiece',
    centerpieceBox: {
      cx: 720,
      bottomY: 720,
      maxW: 565,
      maxH: 585,
    },
    pieces: [
      {
        id: 'sangeet-1',
        assetKey: 'motif_disco_ball',
        label: 'Silver mirror disco ball',
        x: 332,
        y: 118,
        w: 150,
        rotation: 0,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.1,
        bobDelay: -1.1,
      },
      {
        id: 'sangeet-2',
        assetKey: 'motif_vinyl',
        label: 'Glossy black vinyl LP record',
        x: 985,
        y: 182,
        w: 138,
        rotation: 8,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.4,
        bobDelay: -2.4,
      },
      {
        id: 'sangeet-3',
        assetKey: 'motif_disco_coupe',
        label: 'Sparkling rosé cocktail coupe with disco ball pick',
        x: 266,
        y: 448,
        w: 132,
        rotation: -14,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.7,
        bobDelay: -0.7,
      },
      {
        id: 'sangeet-4',
        assetKey: 'motif_disco_ball',
        label: 'Hanging silver mirror disco ball',
        x: 1236,
        y: 392,
        w: 152,
        rotation: 0,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.6,
        bobDelay: -3.2,
      },
      {
        id: 'sangeet-5',
        assetKey: 'motif_disco_coupe',
        label: 'Cocktail coupe with mini disco ball stirrer',
        x: 986,
        y: 552,
        w: 128,
        rotation: 16,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.0,
        bobDelay: -1.8,
      },
      {
        id: 'sangeet-c1',
        assetKey: 'motif_vinyl',
        label: 'Blurred vinyl record corner motif',
        x: -36,
        y: 530,
        w: 265,
        rotation: -12,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.8,
        bobDelay: -2.9,
      },
      {
        id: 'sangeet-c2',
        assetKey: 'motif_disco_ball',
        label: 'Blurred silver disco ball corner motif',
        x: 1265,
        y: -18,
        w: 235,
        rotation: 0,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.4,
        bobDelay: -0.5,
      },
    ],
    service: {
      subtitle: 'Stage Scenography, Sound & Choreography',
      duration: 'Evening Celebration (5 Hours)',
      guestRange: '150 – 450 Guests',
      startingPrice: '$4,800',
      highlights: [
        'Custom architectural dance floor & mirror-work stage installation',
        'Concert-grade line-array acoustics, kinetic lighting & live dhol ensemble',
        'Family choreography rehearsals & dedicated backstage artist hospitality',
        'Artisanal cocktail lounge & midnight chaat pavilion styling',
      ],
    },
    album: {
      chapter: '02. Sangeet Album',
      paletteName: 'Obsidian · Warm Amber · Antique Brass',
      storyLead:
        'An electric night of live dhol percussion, mirrored stage architecture, and joyful family choreography.',
      plates: [
        {
          id: 'san-p1',
          src: '/src/assets/images/album_sangeet_hero_1795088227933.webp',
          title: 'Mirror-Work Stage & Live Dhol',
          caption:
            'The couple takes centerstage surrounded by cheering guests and twin dhol players under warm amber beams.',
          locationNote: 'Grand Ballroom · 9:15 PM',
          aspect: 'landscape',
        },
        {
          id: 'san-p2',
          src: '/src/assets/images/album_sangeet_detail_1795088227358.webp',
          title: 'Classical Percussion & Ghungroos',
          caption:
            'Live dholak and tabla musicians setting the tempo as dancers step onto the lit timber floor.',
          locationNote: 'Stage Wings · 8:30 PM',
          aspect: 'landscape',
        },
        {
          id: 'san-p3',
          src: '/src/assets/images/sangeet_music_dance_centerpiece_1795079589094.jpg',
          title: 'Plum Silk & Dholak Duet',
          caption:
            'Swirling zardozi lehenga paired with a hand-carved ceremonial dholak.',
          locationNote: 'Couple Spotlight',
          aspect: 'portrait',
        },
        {
          id: 'san-p4',
          src: '/src/assets/images/sangeet_motif_tabla_1795079589165.jpg',
          title: 'Hand-Tuned Brass Tabla Pair',
          caption:
            'Artisanal percussion finished with silk cords and miniature brass charms.',
          locationNote: 'Acoustic Ensemble',
          aspect: 'square',
        },
      ],
      moments: [
        {
          time: '01. Soundcheck',
          title: 'Stage Lighting & Artist Cueing',
          detail: 'Full audio-visual rehearsal with wireless mics, monitors, and stage marks.',
        },
        {
          time: '02. Performances',
          title: 'Family Choreography & Live Dhol',
          detail: 'Seamless transitions between solo, group, and couple dance numbers.',
        },
        {
          time: '03. Open Floor',
          title: 'DJ Set & Midnight Street Lounge',
          detail: 'High-tempo dance floor powered by craft cocktails and late-night bites.',
        },
      ],
    },
  },
  {
    id: 'haldi',
    name: 'Haldi',
    backdrop: '#AC702F',
    centerpieceKey: 'haldi_centerpiece',
    centerpieceBox: {
      cx: 720,
      bottomY: 716,
      maxW: 455,
      maxH: 520,
    },
    pieces: [
      {
        id: 'haldi-1',
        assetKey: 'motif_marigold',
        label: 'Saffron marigold bloom',
        x: 376,
        y: 162,
        w: 126,
        rotation: -12,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.6,
        bobDelay: -1.4,
      },
      {
        id: 'haldi-2',
        assetKey: 'motif_jasmine',
        label: 'White mogra jasmine cluster',
        x: 960,
        y: 226,
        w: 138,
        rotation: 6,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.4,
        bobDelay: -2.8,
      },
      {
        id: 'haldi-3',
        assetKey: 'motif_marigold',
        label: 'Genda phool blossom',
        x: 298,
        y: 472,
        w: 142,
        rotation: 14,
        mirror: true,
        layer: 'fruit',
        bobDuration: 3.9,
        bobDelay: -0.4,
      },
      {
        id: 'haldi-4',
        assetKey: 'motif_jasmine',
        label: 'Fresh jasmine spray',
        x: 1235,
        y: 452,
        w: 138,
        rotation: -18,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.7,
        bobDelay: -3.5,
      },
      {
        id: 'haldi-5',
        assetKey: 'motif_marigold',
        label: 'Marigold flower accent',
        x: 956,
        y: 590,
        w: 132,
        rotation: -10,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.4,
        bobDelay: -2.1,
      },
      {
        id: 'haldi-c1',
        assetKey: 'motif_marigold',
        label: 'Blurred marigold corner motif',
        x: -12,
        y: 580,
        w: 250,
        rotation: 0,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.9,
        bobDelay: -1.6,
      },
      {
        id: 'haldi-c2',
        assetKey: 'motif_jasmine',
        label: 'Blurred jasmine corner motif',
        x: 1278,
        y: 32,
        w: 205,
        rotation: 15,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.2,
        bobDelay: -3.1,
      },
    ],
    service: {
      subtitle: 'Botanical Courtyard & Ritual Styling',
      duration: 'Morning Ceremony (4 Hours)',
      guestRange: '80 – 250 Guests',
      startingPrice: '$3,400',
      highlights: [
        'Cascading marigold canopies, hammered brass urlis & floral phoolon-ki-chadar',
        'Organic sandalwood, rosewater & wild turmeric ritual bowls for guests',
        'Acoustic folk musicians, thandai bar & shaded linen courtyard lounges',
        'Yellow-ochre floral shower choreography & candid editorial coverage',
      ],
    },
    album: {
      chapter: '03. Haldi Album',
      paletteName: 'Saffron Marigold · Raw Linen · Hammered Brass',
      storyLead:
        'Sun-drenched morning courtyard rituals framed by cascading genda phool curtains, organic turmeric, and joyful petal showers.',
      plates: [
        {
          id: 'hal-p1',
          src: '/src/assets/images/album_haldi_hero_1795088227114.webp',
          title: 'Marigold Canopy Petal Shower',
          caption:
            'Family elders shower the couple with fresh marigold petals beneath woven floral curtains in morning sunlight.',
          locationNote: 'Sunlit Courtyard · 10:30 AM',
          aspect: 'landscape',
        },
        {
          id: 'hal-p2',
          src: '/src/assets/images/album_haldi_detail_1795088227294.webp',
          title: 'Turmeric & Rosewater Ritual Table',
          caption:
            'Hammered antique brass bowls filled with wild turmeric paste, rosewater, mango leaves, and morning diyas.',
          locationNote: 'Ritual Prep · 9:15 AM',
          aspect: 'landscape',
        },
        {
          id: 'hal-p3',
          src: '/src/assets/images/haldi_urli_centerpiece_1795078411586.jpg',
          title: 'Hammered Brass Urli & Floating Diyas',
          caption:
            'Sculptural pedestal bowl brimming with saffron marigolds, rose petals, and warm oil lamps.',
          locationNote: 'Courtyard Centerpiece',
          aspect: 'portrait',
        },
        {
          id: 'hal-p4',
          src: '/src/assets/images/motif_marigold_1795078410788.jpg',
          title: 'Hand-Selected Genda Phool',
          caption:
            'Vibrant saffron blooms strung fresh at dawn for garlands and canopy drapes.',
          locationNote: 'Botanical Detail',
          aspect: 'square',
        },
      ],
      moments: [
        {
          time: '01. Morning Setup',
          title: 'Turmeric & Rosewater Station',
          detail: 'Hand-mixed organic haldi bowls, mango leaves, and woven cotton towels.',
        },
        {
          time: '02. Blessings',
          title: 'Family Ritual & Floral Shower',
          detail: 'Coordinated marigold petal baskets distributed to guests for the finale.',
        },
        {
          time: '03. Brunch',
          title: 'Shaded Courtyard Thandai & Lunch',
          detail: 'Relaxed outdoor seating under linen canopies with chilled spiced refreshments.',
        },
      ],
    },
  },
  {
    id: 'wedding',
    name: 'Wedding',
    backdrop: '#A5654A',
    centerpieceKey: 'wedding_centerpiece',
    centerpieceBox: {
      cx: 720,
      bottomY: 716,
      maxW: 415,
      maxH: 575,
    },
    pieces: [
      {
        id: 'wedding-1',
        assetKey: 'motif_rose',
        label: 'Crimson velvet rose',
        x: 374,
        y: 150,
        w: 128,
        rotation: 0,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.0,
        bobDelay: -0.9,
      },
      {
        id: 'wedding-2',
        assetKey: 'motif_jasmine',
        label: 'Mogra jasmine & mango leaves',
        x: 958,
        y: 224,
        w: 132,
        rotation: 16,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.5,
        bobDelay: -2.2,
      },
      {
        id: 'wedding-3',
        assetKey: 'motif_marigold',
        label: 'Ceremonial marigold bloom',
        x: 292,
        y: 462,
        w: 138,
        rotation: -12,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.7,
        bobDelay: -3.4,
      },
      {
        id: 'wedding-4',
        assetKey: 'motif_rose',
        label: 'Bridal garden rose',
        x: 1242,
        y: 440,
        w: 136,
        rotation: 15,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.8,
        bobDelay: -1.3,
      },
      {
        id: 'wedding-5',
        assetKey: 'motif_jasmine',
        label: 'Sacred jasmine garland bud',
        x: 960,
        y: 572,
        w: 138,
        rotation: -14,
        mirror: true,
        layer: 'fruit',
        bobDuration: 3.5,
        bobDelay: -2.6,
      },
      {
        id: 'wedding-c1',
        assetKey: 'motif_rose',
        label: 'Blurred crimson rose corner motif',
        x: -14,
        y: 562,
        w: 248,
        rotation: 0,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.6,
        bobDelay: -0.8,
      },
      {
        id: 'wedding-c2',
        assetKey: 'motif_marigold',
        label: 'Blurred marigold corner motif',
        x: 1282,
        y: 34,
        w: 202,
        rotation: 20,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.3,
        bobDelay: -3.0,
      },
    ],
    service: {
      subtitle: 'Mandap Architecture, Baraat & Pheras',
      duration: 'Full-Day Production (10 Hours)',
      guestRange: '200 – 700 Guests',
      startingPrice: '$9,500',
      highlights: [
        'Bespoke four-pillar carved mandap dressed in thousands of fresh roses & mogra',
        'Royal baraat procession logistics with brass band, vintage carriage & hospitality',
        'Handcrafted varmala garlands, sacred havan setup & multilingual ritual booklets',
        'End-to-end timeline direction, VIP concierge & dual-camera cinema unit',
      ],
    },
    album: {
      chapter: '04. Wedding Album',
      paletteName: 'Crimson Rose · Sandstone · Antique Gold',
      storyLead:
        'Sacred vows beneath an architectural sunset mandap—capturing the varmala exchange, sacred fire, and timeless heritage architecture.',
      plates: [
        {
          id: 'wed-p1',
          src: '/src/assets/images/album_wedding_hero_1795088227497.webp',
          title: 'Sunset Palace Mandap & Pheras',
          caption:
            'Hand-carved sandstone arches frame the rose-draped mandap as the couple walks seven circles around the sacred fire.',
          locationNote: 'Palace Amphitheater · Sunset',
          aspect: 'landscape',
        },
        {
          id: 'wed-p2',
          src: '/src/assets/images/album_wedding_detail_1795088227965.webp',
          title: 'The Varmala Exchange at Dusk',
          caption:
            'Braided crimson rose and white mogra garlands exchanged beneath glowing crystal chandeliers and brass diyas.',
          locationNote: 'Varmala Stage · 6:40 PM',
          aspect: 'landscape',
        },
        {
          id: 'wed-p3',
          src: '/src/assets/images/wedding_kalash_centerpiece_1795078410778.jpg',
          title: 'Filigree Gold Kalash & Mango Leaves',
          caption:
            'Traditional ceremonial kalash dressed with fresh mango foliage and cascading velvet roses.',
          locationNote: 'Mandap Altar',
          aspect: 'portrait',
        },
        {
          id: 'wed-p4',
          src: '/src/assets/images/motif_rose_1795078411603.jpg',
          title: 'Velvet Crimson Garden Roses',
          caption:
            'Rich long-stem roses hand-selected for the bridal varmala and mandap canopy.',
          locationNote: 'Floral Curation',
          aspect: 'square',
        },
      ],
      moments: [
        {
          time: '01. Baraat',
          title: 'Procession & Milni Reception',
          detail: 'Coordinated brass band arrival, cold towel service, and family garland exchange.',
        },
        {
          time: '02. Varmala',
          title: 'Bridal Entry & Garland Exchange',
          detail: 'Floral canopy procession leading to the elevated varmala platform.',
        },
        {
          time: '03. Pheras',
          title: 'Sacred Fire & Multilingual Guide',
          detail: 'Calm, reverent mandap pacing with printed ceremony cards for every guest.',
        },
      ],
    },
  },
  {
    id: 'reception',
    name: 'Reception',
    backdrop: '#6C4D3C',
    centerpieceKey: 'reception_centerpiece',
    centerpieceBox: {
      cx: 720,
      bottomY: 722,
      maxW: 455,
      maxH: 615,
    },
    pieces: [
      {
        id: 'reception-1',
        assetKey: 'motif_reception_chandelier',
        label: 'Cascading antique-gold crystal chandelier',
        x: 325,
        y: 108,
        w: 156,
        rotation: 0,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.2,
        bobDelay: -1.7,
      },
      {
        id: 'reception-2',
        assetKey: 'motif_reception_minicake',
        label: 'Modern two-tier gold-leaf and white orchid wedding cake',
        x: 965,
        y: 184,
        w: 148,
        rotation: 6,
        mirror: false,
        layer: 'fruit',
        bobDuration: 3.8,
        bobDelay: -2.9,
      },
      {
        id: 'reception-3',
        assetKey: 'motif_reception_candelabra',
        label: 'Brushed-gold three-arm reception candelabra',
        x: 276,
        y: 424,
        w: 118,
        rotation: -10,
        mirror: false,
        layer: 'fruit',
        bobDuration: 4.5,
        bobDelay: -0.6,
      },
      {
        id: 'reception-4',
        assetKey: 'motif_reception_chandelier',
        label: 'Crystal chandelier gala lighting accent',
        x: 1222,
        y: 382,
        w: 158,
        rotation: 0,
        mirror: true,
        layer: 'fruit',
        bobDuration: 3.9,
        bobDelay: -3.3,
      },
      {
        id: 'reception-5',
        assetKey: 'motif_reception_minicake',
        label: 'Sculptural floral reception cake accent',
        x: 966,
        y: 552,
        w: 142,
        rotation: -10,
        mirror: true,
        layer: 'fruit',
        bobDuration: 4.7,
        bobDelay: -1.2,
      },
      {
        id: 'reception-c1',
        assetKey: 'motif_reception_candelabra',
        label: 'Blurred gold candelabra corner motif',
        x: -16,
        y: 495,
        w: 205,
        rotation: 10,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.4,
        bobDelay: -2.4,
      },
      {
        id: 'reception-c2',
        assetKey: 'motif_reception_chandelier',
        label: 'Blurred crystal chandelier corner motif',
        x: 1255,
        y: -15,
        w: 235,
        rotation: 0,
        mirror: false,
        layer: 'corner',
        bobDuration: 4.9,
        bobDelay: -0.3,
      },
    ],
    service: {
      subtitle: 'Gala Dining, Champagne Tower & Afterparty',
      duration: 'Evening Gala (6 Hours)',
      guestRange: '180 – 600 Guests',
      startingPrice: '$6,900',
      highlights: [
        'Candlelit banquet tablescapes, crystal glassware & suspended floral chandeliers',
        'Five-tier champagne tower service & curated sommelier tasting pairings',
        'Live jazz quartet into late-night DJ & custom monogrammed dance floor',
        'Valet orchestration, plated multi-course pacing & guest send-off favours',
      ],
    },
    album: {
      chapter: '05. Reception Album',
      paletteName: 'Midnight Charcoal · Ivory Rose · Crystal Gold',
      storyLead:
        'A black-tie glasshouse gala lit by crystal chandeliers, cascading champagne towers, and long candlelit banquet tables.',
      plates: [
        {
          id: 'rec-p1',
          src: '/src/assets/images/albums/reception/reception-ballroom.webp',
          title: 'Chandelier-Lit Reception Ballroom',
          caption:
            'Chandeliers light the banquet tables and an ivory reception stage framed by wine-coloured flowers.',
          locationNote: 'Reception Ballroom',
          aspect: 'landscape',
        },
        {
          id: 'rec-p2',
          src: '/src/assets/images/albums/reception/head-table.webp',
          title: 'Candlelit Reception Head Table',
          caption:
            'Ivory roses, ribbed glass candleholders, and wine-coloured napkins dress the reception head table.',
          locationNote: 'Reception Head Table',
          aspect: 'landscape',
        },
        {
          id: 'rec-p3',
          src: '/src/assets/images/reception_champagne_centerpiece_1795078411720.jpg',
          title: 'Five-Tier Crystal Coupe Sculpture',
          caption:
            'Mirrored tray centerpiece dressed with gold-leaf foliage and garden roses.',
          locationNote: 'Gala Focal Display',
          aspect: 'portrait',
        },
        {
          id: 'rec-p4',
          src: '/src/assets/images/motif_coupe_1795078411041.jpg',
          title: 'Faceted Crystal Glassware',
          caption:
            'Cut-crystal coupes chilled for the vintage toast service.',
          locationNote: 'Tableware Detail',
          aspect: 'square',
        },
      ],
      moments: [
        {
          time: '01. Cocktail Hour',
          title: 'Jazz Quartet & Aperitif Terrace',
          detail: 'Seated welcome drinks while the main ballroom prepares for the grand reveal.',
        },
        {
          time: '02. Grand Toast',
          title: 'Champagne Tower & Speeches',
          detail: 'Sparkling pour followed by warm toasts and plated multi-course dinner.',
        },
        {
          time: '03. Afterparty',
          title: 'First Dance & Late-Night Vinyl Set',
          detail: 'Monogrammed dance floor celebration with espresso martinis and dessert bar.',
        },
      ],
    },
  },
];
