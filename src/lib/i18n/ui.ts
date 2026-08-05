import type { SiteLocale } from "@/lib/i18n/locales";

export const HOME_UI: Record<
  SiteLocale,
  {
    tagline: string;
    allDomains: string;
    searchPlaceholder: string;
    searchPlaceholderDomain: string;
    detectGps: string;
    clear: string;
    filterDomain: string;
    allStores: string;
    fullStoresDirectory: string;
    comparingDeals: string;
    itemsFound: string;
    howCommissions: string;
    noProductsTitle: string;
    noProductsBody: string;
    language: string;
    countryMarket: string;
  }
> = {
  en: {
    tagline: "GPS-Driven Local & Online Price Match",
    allDomains: "All Domains",
    searchPlaceholder: "Search products, electronics, stores in {country}...",
    searchPlaceholderDomain: "Search products on {domain}...",
    detectGps: "Detect GPS",
    clear: "Clear",
    filterDomain: "Filter Domain",
    allStores: "All Stores",
    fullStoresDirectory: "Full Stores Directory",
    comparingDeals: "Comparing Deals in {country}",
    itemsFound: "{count} items found",
    howCommissions: "How Commissions Work (100% Free)",
    noProductsTitle: "No products found",
    noProductsBody: "No offers matching the current filters in {country}. Try resetting filters.",
    language: "Language",
    countryMarket: "Country / market",
  },
  de: {
    tagline: "GPS-Preisvergleich lokal & online",
    allDomains: "Alle Domains",
    searchPlaceholder: "Produkte, Elektronik, Shops in {country} suchen...",
    searchPlaceholderDomain: "Produkte auf {domain} suchen...",
    detectGps: "GPS erkennen",
    clear: "Löschen",
    filterDomain: "Domain filtern",
    allStores: "Alle Shops",
    fullStoresDirectory: "Vollständiges Shop-Verzeichnis",
    comparingDeals: "Angebote vergleichen in {country}",
    itemsFound: "{count} Treffer",
    howCommissions: "So funktionieren Provisionen (100% gratis)",
    noProductsTitle: "Keine Produkte gefunden",
    noProductsBody:
      "Keine Angebote für die aktuellen Filter in {country}. Filter zurücksetzen und erneut versuchen.",
    language: "Sprache",
    countryMarket: "Land / Markt",
  },
  fr: {
    tagline: "Comparaison de prix GPS locale & en ligne",
    allDomains: "Tous les domaines",
    searchPlaceholder: "Rechercher produits, électronique, magasins en {country}...",
    searchPlaceholderDomain: "Rechercher des produits sur {domain}...",
    detectGps: "Détecter le GPS",
    clear: "Effacer",
    filterDomain: "Filtrer le domaine",
    allStores: "Tous les magasins",
    fullStoresDirectory: "Annuaire complet des magasins",
    comparingDeals: "Comparer les offres en {country}",
    itemsFound: "{count} résultats",
    howCommissions: "Comment marchent les commissions (100% gratuit)",
    noProductsTitle: "Aucun produit trouvé",
    noProductsBody:
      "Aucune offre pour les filtres actuels en {country}. Réinitialisez les filtres.",
    language: "Langue",
    countryMarket: "Pays / marché",
  },
  it: {
    tagline: "Confronto prezzi GPS locale e online",
    allDomains: "Tutti i domini",
    searchPlaceholder: "Cerca prodotti, elettronica, negozi in {country}...",
    searchPlaceholderDomain: "Cerca prodotti su {domain}...",
    detectGps: "Rileva GPS",
    clear: "Cancella",
    filterDomain: "Filtra dominio",
    allStores: "Tutti i negozi",
    fullStoresDirectory: "Elenco completo negozi",
    comparingDeals: "Confronto offerte in {country}",
    itemsFound: "{count} risultati",
    howCommissions: "Come funzionano le commissioni (100% gratis)",
    noProductsTitle: "Nessun prodotto trovato",
    noProductsBody:
      "Nessuna offerta per i filtri attuali in {country}. Reimposta i filtri.",
    language: "Lingua",
    countryMarket: "Paese / mercato",
  },
  ro: {
    tagline: "Comparație prețuri GPS local & online",
    allDomains: "Toate domeniile",
    searchPlaceholder: "Caută produse, electronice, magazine în {country}...",
    searchPlaceholderDomain: "Caută produse pe {domain}...",
    detectGps: "Detectează GPS",
    clear: "Șterge",
    filterDomain: "Filtrează domeniu",
    allStores: "Toate magazinele",
    fullStoresDirectory: "Director complet magazine",
    comparingDeals: "Compară oferte în {country}",
    itemsFound: "{count} rezultate",
    howCommissions: "Cum funcționează comisioanele (100% gratuit)",
    noProductsTitle: "Niciun produs găsit",
    noProductsBody:
      "Nicio ofertă pentru filtrele curente în {country}. Resetează filtrele.",
    language: "Limbă",
    countryMarket: "Țară / piață",
  },
};

export function formatUi(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}
