import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { appMarkdown, appPath } from "@lib/llms";

// `/koala.md`, `/koala/es.md`: each page of the app as Markdown, for AI
// assistants. The page links to it with rel="alternate" type="text/markdown".
export async function getStaticPaths() {
  const apps = await getCollection("apps");
  return apps.flatMap((app) => {
    return Object.keys(app.data.languages).map((lang) => ({
      params: { page: appPath(app, lang).slice(1, -1) },
      props: { app, lang },
    }));
  });
}

export const GET: APIRoute<{ app: CollectionEntry<"apps">; lang: string }> = ({ props, site }) =>
  new Response(appMarkdown(props.app, props.lang, site!), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
