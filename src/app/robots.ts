import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/products/deep-dive-into-go/success', '/products/deep-dive-into-go/cancelled'],
      },
    ],
    sitemap: 'https://deepdiveintogo.in/sitemap.xml',
  };
}
