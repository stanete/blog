import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "David Stanete",
  EMAIL: "davidstanete@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "David Stanete is a product minded engineering leader. Occasionally he makes free apps that do one thing well.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/stanete"
  },
];
