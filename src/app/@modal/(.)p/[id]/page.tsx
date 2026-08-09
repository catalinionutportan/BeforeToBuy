import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { defaultLocaleFromCountry } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { getProductById, inferCountryFromProductId } from "@/lib/product-lookup";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";
import { Modal } from "@/components/Modal";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ProductModal({ params, searchParams }: PageProps) {
  const { id } = await params;
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

  return (
    <Modal>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
            {product.image ? (
              <div className="absolute inset-6">
                {shouldUseNativeProductImage(product.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain object-center"
                    referrerPolicy="no-referrer"
                    decoding="async"
                  />
                ) : (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {product.brand}
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-h-40 overflow-y-auto pr-2">{product.description}</p>
            {product.gtin ? (
              <p className="text-[11px] text-slate-500 font-semibold">
                {ui.gtinLabel} {product.gtin.replace(/^0+/, "") || product.gtin}
              </p>
            ) : null}
          </div>
        </div>

        <section className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {ui.compareProductPrices}
          </h2>
          <ul className="space-y-3">
            {sortedOffers.map((offer) => {
              const total = offer.totalPrice ?? computeTotalPrice(offer);
              return (
                <li
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
    </Modal>
  );
}
