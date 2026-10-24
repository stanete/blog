import type { CollectionEntry } from "astro:content";
import { SITE } from "@consts";

// An app told plainly for AI assistants (https://llmstxt.org): what it is, the
// answers from its page, and where everything is. Written from the app's file,
// in its first language, so it never says something the page doesn't.
export function appLlms(app: CollectionEntry<"apps">, site: URL) {
  const { name, testflight, languages } = app.data;
  const codes = Object.keys(languages);
  const [first] = codes;
  const texts = languages[first];
  const page = (code: string) => new URL(`/${app.id}/${code === first ? "" : `${code}/`}`, site).href;
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
    "## Links",
    "",
    ...codes.map((code) => `- [${name} in ${languages[code].language}](${page(code)})`),
    `- [${texts.privacy}](${page(first)}privacy/)`,
    `- [${texts.terms}](${page(first)}terms/)`,
    ...(testflight ? [`- [iPhone beta on TestFlight](${testflight})`] : []),
    `- [${texts.contact}](mailto:${SITE.EMAIL})`,
    "",
  ].join("\n");
}
