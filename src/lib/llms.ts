import type { CollectionEntry } from "astro:content";
import { SITE } from "@consts";

type App = CollectionEntry<"apps">;

// An app's page, told plainly for AI assistants: the same words as the page, in
// Markdown, with no layout or script to get through. Written from the app's file,
// so it never says something the page doesn't.

/** Where a page of the app is: its first language at `/koala/`, the others in a folder. */
export function appPath(app: App, lang: string) {
  const [first] = Object.keys(app.data.languages);
  return `/${app.id}/${lang === first ? "" : `${lang}/`}`;
}

/** Where that page is as Markdown: its address with `.md` (`/koala.md`, `/koala/es.md`). */
export function markdownPath(app: App, lang: string) {
  return `${appPath(app, lang).slice(0, -1)}.md`;
}

/** The app's page in one language, as Markdown (`/koala.md`, `/koala/es.md`). */
export function appMarkdown(app: App, lang: string, site: URL) {
  const { name, testflight, languages } = app.data;
  const texts = languages[lang];
  const page = new URL(appPath(app, lang), site).href;
  return [
    `# ${name}: ${texts.tagline}`,
    "",
    `> ${texts.description ?? texts.pitch}`,
    "",
    texts.pitch,
    "",
    texts.free,
    "",
    ...(texts.faq ?? []).flatMap(({ q, a }) => [`## ${q}`, "", a, ""]),
    `## ${texts.beta}`,
    "",
    ...(testflight ? [`- iPhone: ${texts.iphone.text} ${testflight}`] : []),
    `- Android: ${texts.android.text} ${SITE.EMAIL}`,
    "",
    "## Links",
    "",
    `- [${name}](${page})`,
    `- [${texts.privacy}](${page}privacy/)`,
    `- [${texts.terms}](${page}terms/)`,
    `- [${texts.contact}](mailto:${SITE.EMAIL})`,
    ...Object.entries(languages)
      .filter(([code]) => code !== lang)
      .map(([code, other]) => `- [${name} · ${other.language}](${new URL(markdownPath(app, code), site).href})`),
    "",
  ].join("\n");
}

/** `/koala/llms.txt` (https://llmstxt.org): the page in its first language, and where the rest is. */
export function appLlms(app: App, site: URL) {
  const [first] = Object.keys(app.data.languages);
  return [
    appMarkdown(app, first, site).trimEnd(),
    `- [Every language in one file](${new URL(`/${app.id}/llms-full.txt`, site).href})`,
    "",
  ].join("\n");
}

/** `/koala/llms-full.txt`: the page in every language, one after the other. */
export function appLlmsFull(app: App, site: URL) {
  return Object.keys(app.data.languages)
    .map((lang) => appMarkdown(app, lang, site))
    .join("\n---\n\n");
}
