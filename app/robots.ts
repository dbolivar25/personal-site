import { baseUrl } from 'app/sitemap'

export default function robots(): { rules: { userAgent: string }[], sitemap: string } {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
