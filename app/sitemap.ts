import { getProjects } from "app/portfolio/utils";

export const baseUrl = "https://danielbolivar.vercel.app";

export default async function sitemap() {
  let projects = getProjects().map((project) => ({
    url: `${baseUrl}/portfolio/${project.slug}`,
    lastModified: project.metadata.publishedAt,
  }));

  let routes = ["", "/portfolio"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...projects];
}
