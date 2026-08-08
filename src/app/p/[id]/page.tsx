import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { defaultLocaleFromCountry } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { createPageMetadata } from "@/lib/metadata";
import { getProductById, inferCountryFromProductId, listProductIdsForSitemap } from "@/lib/product-lookup";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { buildProductJsonLd } from "@/lib/seo/json-ld";
import { productPagePath, safeReturnPath } from "@/lib/seo/site-url";
import { getMarketHubIdForLeaf } from "@/lib/market-hubs";
import { ALL_CATEGORIES_ID, getParentCategoryId } from "@/lib/categories";
import { shouldBypassImageOptimization } from "@/lib/utils/product-image";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateStaticParams() {
  const ids = await listProductIdsForSitemap(100);
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  const ui = HOME_UI.en;

  if (!product) {
    return createPageMetadata({
      title: "Product not found | BeforeToBuy.com",
      description: "The requested product could not be found.",
      path: productPagePath(id),
      index: false,
    });
  }

  return createPageMetadata({
    title: `${product.title} | ${ui.priceComparison}`,
    description:
      product.description ||
      `Compare ${product.title} prices and offers on BeforeToBuy.com.`,
    path: productPagePath(product.id),
  });
}

function browseBackHref(productCategory: string, from?: string): string {
  const hub = getMarketHubIdForLeaf(productCategory);
  const parent = getParentCategoryId(productCategory);
  const fallbackCategory = hub || parent || productCategory || ALL_CATEGORIES_ID;
  const fallback =
    fallbackCategory && fallbackCategory !== ALL_CATEGORIES_ID
      ? `/?category=${encodeURIComponent(fallbackCategory)}`
      : "/";
  return safeReturnPath(from, fallback);
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();

  const countryCode =
    product.targetCountries[0] ||
    inferCountryFromProductId(product.id) ||
    DEFAULT_COUNTRY;
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  const locale = defaultLocaleFromCountry(countryCode);
  const ui = HOME_UI[locale];
  const sortedOffers = sortOffersByTotalPrice(product.offers);
  const backHref = browseBackHref(product.category, from);
  const jsonLd = buildProductJsonLd(product, {
    countryCode,
    locale,
    offers: sortedOffers,
  });

  return (
    <PageShell maxWidthClass="max-w-7xl">
      <JsonLd data={jsonLd} />
      <div className="space-y-8">
        <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
          <Link href={backHref} className="hover:text-emerald-700 font-semibold">
            ← {ui.compareBeforeYouBuy}
          </Link>
          <span className="mx-0.5 text-slate-300">/</span>
          <span className="text-slate-700">{product.brand}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
                unoptimized={shouldBypassImageOptimization(product.image)}
              />
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {product.brand}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            {product.gtin ? (
              <p className="text-[11px] text-slate-500 font-semibold">
                {ui.gtinLabel} {product.gtin.replace(/^0+/, "") || product.gtin}
              </p>
            ) : null}
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
              {ui.whatToExpectPoint2} {ui.priceDisclaimer}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            {ui.compareProductPrices} — {country.name}
          </h2>
          <ul className="space-y-3">
            {sortedOffers.map((offer) => {
              const total = offer.totalPrice ?? computeTotalPrice(offer);
              return (
                <li
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{offer.storeName}</p>
                    <p className="text-[11px] text-slate-500">
                      {offer.source === "production-live"
                        ? ui.liveOfferLabel
                        : offer.source === "sample"
                          ? ui.sampleOfferLabel
                          : ui.demoOfferLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-black text-slate-900">
                      {country.currencySymbol}
                      {total.toLocaleString()}
                    </p>
                    <ConsentAwareAffiliateLink
                      href={offer.purchaseUrl}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                      ariaLabel={
                        offer.source === "production-live"
                          ? `${ui.viewOfferButton} ${offer.storeName}`
                          : `${ui.searchStoreButton} ${offer.storeName}`
                      }
                    >
                      <span>
                        {offer.source === "production-live"
                          ? ui.viewOfferButton
                          : ui.searchStoreButton}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </ConsentAwareAffiliateLink>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
