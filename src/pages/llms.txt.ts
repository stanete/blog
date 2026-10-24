import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@consts";

// `/llms.txt` (https://llmstxt.org): where AI assistants find the apps.
export const GET: APIRoute = async ({ site }) => {
  const apps = await getCollection("apps");
  const body = [
    `# ${SITE.NAME}`,
    "",
    "> Free apps that do one thing well.",
    "",
    "## Apps",
    "",
    ...apps.map((app) => {
      const [first] = Object.keys(app.data.languages);
      const texts = app.data.languages[first];
      const url = new URL(`/${app.id}/llms.txt`, site).href;
      return `- [${app.data.name}: ${texts.tagline}](${url}): ${texts.description ?? texts.pitch}`;
    }),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
