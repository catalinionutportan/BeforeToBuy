import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { JsonLd } from "@/components/JsonLd";
import { ProductPageOffers } from "@/components/ProductPageOffers";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { createPageMetadata } from "@/lib/metadata";
import { getProductById, listProductIdsForSitemap } from "@/lib/product-lookup";
import { sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { buildProductJsonLd } from "@/lib/seo/json-ld";
import { productPagePath } from "@/lib/seo/site-url";

type PageProps = {
  params: Promise<{ id: string }>;
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

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const ui = HOME_UI.en;
  const country = COUNTRIES[DEFAULT_COUNTRY];
  const sortedOffers = sortOffersByTotalPrice(product.offers);
  const jsonLd = buildProductJsonLd(product, {
    countryCode: DEFAULT_COUNTRY,
    locale: DEFAULT_LOCALE,
    offers: sortedOffers,
  });

  return (
    <PageShell maxWidthClass="max-w-5xl">
      <JsonLd data={jsonLd} />
      <div className="space-y-8">
        <nav className="text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700 font-semibold">
            BeforeToBuy.com
          </Link>
          <span className="mx-1.5">/</span>
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

        <ProductPageOffers
          offers={sortedOffers}
          currencySymbol={country.currencySymbol}
          countryName={country.name}
          locale={DEFAULT_LOCALE}
        />
      </div>
    </PageShell>
  );
}
