import { getProductById } from "@/lib/product-lookup";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { defaultLocaleFromCountry } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { CloseCompareControls } from "@/components/CloseCompareControls";
import { CompareProductColumn } from "@/components/CompareProductColumn";

type PageProps = {
  searchParams: Promise<{ ids?: string }>;
};

export default async function CompareProductsPage({ searchParams }: PageProps) {
  const { ids } = await searchParams;

  if (!ids) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Niciun produs selectat</h1>
        <Link
          href="/"
          scroll={false}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
        >
          Înapoi la magazin
        </Link>
      </div>
    );
  }

  const productIds = ids.split(",").map((id) => id.trim()).filter(Boolean);
  if (productIds.length < 2) notFound();

  const [product1, product2] = await Promise.all([
    getProductById(productIds[0]),
    getProductById(productIds[1]),
  ]);

  if (!product1 || !product2) notFound();

  const countryCode = product1.targetCountries[0] || DEFAULT_COUNTRY;
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  const locale = defaultLocaleFromCountry(countryCode);
  const ui = HOME_UI[locale];

  const sortedOffers1 = sortOffersByTotalPrice(product1.offers);
  const sortedOffers2 = sortOffersByTotalPrice(product2.offers);

  const bestOffer1 = sortedOffers1[0];
  const bestOffer2 = sortedOffers2[0];

  const total1 = bestOffer1 ? (bestOffer1.totalPrice ?? computeTotalPrice(bestOffer1)) : 0;
  const total2 = bestOffer2 ? (bestOffer2.totalPrice ?? computeTotalPrice(bestOffer2)) : 0;

  const columnLabels = {
    cheapestLabel: "Cel Mai Ieftin",
    bestOfferLabel: "Cea mai bună ofertă",
    buyNowLabel: "Cumpără Acum",
    specsLabel: "Specificații / Descriere",
    noDescriptionLabel: "Fără descriere disponibilă.",
    expandImageLabel: "Vezi poza",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-4">
          <CloseCompareControls />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Despre această comparație
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {ui.marketHeroSubline} Această pagină te ajută să pui în oglindă specificațiile și cele
            mai bune oferte pentru produsele selectate, pentru a lua decizia corectă.{" "}
            {ui.priceDisclaimer}
          </p>
        </div>

        {/* Symmetric 2-column compare — equal gaps, equal card structure */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 items-stretch">
          <CompareProductColumn
            product={product1}
            currencySymbol={country.currencySymbol}
            total={total1}
            storeName={bestOffer1?.storeName}
            purchaseUrl={bestOffer1?.purchaseUrl}
            isCheapest={total1 > 0 && total1 < total2}
            {...columnLabels}
          />
          <CompareProductColumn
            product={product2}
            currencySymbol={country.currencySymbol}
            total={total2}
            storeName={bestOffer2?.storeName}
            purchaseUrl={bestOffer2?.purchaseUrl}
            isCheapest={total2 > 0 && total2 < total1}
            {...columnLabels}
          />
        </div>
      </div>
    </div>
  );
}
