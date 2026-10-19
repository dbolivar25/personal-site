export const baseUrl = "https://danielbolivar.dev";

export default async function sitemap(): Promise<
  { url: string; lastModified: string | Date }[]
> {
  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split("T")[0],
    },
  ];
}
