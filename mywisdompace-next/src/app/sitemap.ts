import type { MetadataRoute } from 'next';
import { chapters } from '@/data/chapters';

const BASE_URL = 'https://wisdompace.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((c) => ({
    url:              `${BASE_URL}/chapter/${c.slug}`,
    lastModified:     new Date(),
    changeFrequency:  'monthly',
    priority:         0.8,
  }));

  return [
    {
      url:             BASE_URL,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/chapter/read-instructions`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.7,
    },
    ...chapterRoutes,
  ];
}
