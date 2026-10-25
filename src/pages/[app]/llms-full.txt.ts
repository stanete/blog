import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import { appLlmsFull } from "@lib/llms";

// `/koala/llms-full.txt`: the app's page in every language, for AI assistants.
export async function getStaticPaths() {
  const apps = await getCollection("apps");
  return apps.map((app) => ({ params: { app: app.id }, props: { app } }));
}

export const GET: APIRoute<{ app: CollectionEntry<"apps"> }> = ({ props, site }) =>
  new Response(appLlmsFull(props.app, site!), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
