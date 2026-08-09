import { getProductById } from "@/lib/product-lookup";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Check, X, ArrowLeft } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { defaultLocaleFromCountry } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";
import { ConsentAwareAffiliateLink } from "@/components/ConsentAwareAffiliateLink";

type PageProps = {
  searchParams: Promise<{ ids?: string }>;
};

export default async function CompareProductsPage({ searchParams }: PageProps) {
  const { ids } = await searchParams;
  
  if (!ids) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Niciun produs selectat</h1>
        <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">
          Înapoi la magazin
        </Link>
      </div>
    );
  }

  const productIds = ids.split(",");
  if (productIds.length < 2) notFound();

  const [product1, product2] = await Promise.all([
    getProductById(productIds[0]),
    getProductById(productIds[1])
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Comparație Produse</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            Închide
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          
          {/* Product 1 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm flex flex-col relative">
            {total1 > 0 && total1 < total2 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10 whitespace-nowrap">
                Cel Mai Ieftin
              </div>
            )}
            
            <div className="relative aspect-square w-full bg-slate-50 rounded-2xl mb-6 border border-slate-100 p-4">
              {product1.image && (
                shouldUseNativeProductImage(product1.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product1.image} alt={product1.title} className="w-full h-full object-contain" />
                ) : (
                  <Image src={product1.image} alt={product1.title} fill className="object-contain p-4" />
                )
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">{product1.brand}</p>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-6 leading-tight flex-1">{product1.title}</h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center mb-6">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Cea mai bună ofertă</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
                {country.currencySymbol}{total1.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">la {bestOffer1?.storeName}</p>
            </div>

            {bestOffer1 && (
              <ConsentAwareAffiliateLink
                href={bestOffer1.purchaseUrl}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                Cumpără Acum <ExternalLink className="w-4 h-4" />
              </ConsentAwareAffiliateLink>
            )}
          </div>

          {/* Product 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm flex flex-col relative">
            {total2 > 0 && total2 < total1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10 whitespace-nowrap">
                Cel Mai Ieftin
              </div>
            )}
            
            <div className="relative aspect-square w-full bg-slate-50 rounded-2xl mb-6 border border-slate-100 p-4">
              {product2.image && (
                shouldUseNativeProductImage(product2.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product2.image} alt={product2.title} className="w-full h-full object-contain" />
                ) : (
                  <Image src={product2.image} alt={product2.title} fill className="object-contain p-4" />
                )
              )}
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">{product2.brand}</p>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-6 leading-tight flex-1">{product2.title}</h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center mb-6">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Cea mai bună ofertă</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
                {country.currencySymbol}{total2.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">la {bestOffer2?.storeName}</p>
            </div>

            {bestOffer2 && (
              <ConsentAwareAffiliateLink
                href={bestOffer2.purchaseUrl}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-center hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                Cumpără Acum <ExternalLink className="w-4 h-4" />
              </ConsentAwareAffiliateLink>
            )}
          </div>

        </div>

        {/* Detailed Specs/Description Side by Side */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-6 sm:p-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Specificații / Descriere</h3>
              <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                {product1.description ? product1.description : <span className="text-slate-400 italic">Fără descriere disponibilă.</span>}
              </div>
            </div>
            <div className="p-6 sm:p-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Specificații / Descriere</h3>
              <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                {product2.description ? product2.description : <span className="text-slate-400 italic">Fără descriere disponibilă.</span>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
