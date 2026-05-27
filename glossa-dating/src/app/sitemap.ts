import { MetadataRoute } from "next";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sincd.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${APP_URL}/auth/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${APP_URL}/auth/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
