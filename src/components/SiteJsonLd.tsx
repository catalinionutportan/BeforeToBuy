import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/JsonLd";

/** Sitewide Organization + WebSite schema for Google rich results / sitelinks search. */
export function SiteJsonLd() {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />
    </>
  );
}
