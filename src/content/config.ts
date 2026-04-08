import { defineCollection, z, reference } from 'astro:content';

// Shared image field: path to a public/ image, with optional dark-mode alternate.
const image = z.object({
  src: z.string(),
  srcDark: z.string().optional(),
  alt: z.string().default(''),
});

const rate = z.object({
  name: z.string(),
  duration: z.string().optional(),
  price: z.string(),
  per: z.string().optional(),
  href: z.string().default('#contact'),
  btnLabel: z.string().default('Записатися'),
  featured: z.boolean().default(false),
  note: z.string().optional(),
});

const faqItem = z.object({
  question: z.string(),
  answer: z.string(),
});

const navLink = z.object({
  label: z.string(),
  href: z.string(),
});

// ---------- settings (singleton JSON) ----------
const settings = defineCollection({
  type: 'data',
  schema: z.object({
    siteName: z.string(),
    tagline: z.string().optional(),
    email: z.string(),
    socials: z.object({
      facebook: z.string().optional(),
      telegram: z.string().optional(),
      instagram: z.string().optional(),
    }),
    nav: z.array(navLink),
    footerCopy: z.string(),
  }),
});

// ---------- teachers ----------
const teachers = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    photo: image,
    quote: z.string().optional(),
    info: z.string(),
    languages: z.array(z.enum(['english', 'polish', 'ukrainian', 'russian'])).default([]),
    order: z.number().default(0),
  }),
});

// ---------- learning formats (group / pair / individual) ----------
const formats = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    subtitle: z.string(),
    priceFrom: z.string(),
    heroImage: image,
    heroOverlay: z.enum(['pink', 'teal', 'dark']).default('pink'),
    cardIcon: image.optional(),
    cardDescription: z.string().optional(),
    href: z.string(),
    ratesNote: z.string().optional(),
    rates: z.array(rate),
    faq: z.array(faqItem).default([]),
    order: z.number().default(0),
  }),
});

// ---------- top-level pages (home, english_school, polish) ----------
const pages = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    hero: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        image: image.optional(),
        overlay: z.enum(['pink', 'teal', 'dark']).default('pink'),
        ctaLabel: z.string().optional(),
        ctaHref: z.string().optional(),
      })
      .optional(),
    about: z
      .object({
        label: z.string().optional(),
        title: z.string(),
        paragraphs: z.array(z.string()).default([]),
        bullets: z.array(z.string()).default([]),
        image: image.optional(),
      })
      .optional(),
    features: z
      .object({
        title: z.string(),
        items: z.array(z.object({ icon: z.string(), title: z.string() })),
      })
      .optional(),
    methodsTitle: z.string().optional(),
    methods: z.array(reference('formats')).default([]),
    ratesTitle: z.string().optional(),
    rates: z.array(rate).default([]),
    teachersTitle: z.string().optional(),
    teachers: z.array(reference('teachers')).default([]),
    faqTitle: z.string().optional(),
    faq: z.array(faqItem).default([]),
    contact: z
      .object({
        title: z.string(),
        text: z.string(),
        formTitle: z.string(),
      })
      .optional(),
    quickMenu: z
      .object({
        title: z.string(),
        buttons: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
            color: z.enum(['pink', 'teal']),
            external: z.boolean().default(false),
          })
        ),
      })
      .optional(),
  }),
});

export const collections = { settings, teachers, formats, pages };
