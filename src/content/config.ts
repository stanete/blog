import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional()
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional()
  }),
});

// One file per app. Its first language is the one at the top of its pages
// (`/koala/`); the others each have a folder (`/koala/es/`).
// An app's pictures are in `public/apps/<app>/`.
const apps = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    date: z.coerce.date(),
    screenshots: z.number(),
    // The public TestFlight link of the beta.
    testflight: z.string().url().optional(),
    languages: z.record(z.object({
      language: z.string(),
      tagline: z.string(),
      pitch: z.string(),
      free: z.string(),
      comingSoon: z.string(),
      privacy: z.string(),
      terms: z.string(),
      contact: z.string(),
      screenshot: z.string(),
      // The title of the card that says how to get the beta.
      beta: z.string(),
      iphone: z.object({
        steps: z.array(z.string()),
        join: z.string(),
        getTestFlight: z.string(),
        note: z.string(),
      }),
      android: z.object({
        steps: z.array(z.string()),
        send: z.string(),
        subject: z.string(),
        body: z.string(),
      }),
    })),
  }),
});

// The legal pages of the apps: `legal/<app>/<language>/<privacy|terms>.md`.
// Each app's repository writes its own, so the app and the site say the same.
const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    updated: z.string(),
  }),
});

export const collections = { blog, work, projects, apps, legal };
