import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/seo/sitemap-entries";

/** Hourly revalidation — heavy feed merge should not run on every crawler hit. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
