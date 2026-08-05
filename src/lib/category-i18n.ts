import type { CountryCode } from "@/types";
import {
  CATEGORY_ALL_OPTION,
  COMPARISON_COLLECTION_FILTERS,
  SHOPPING_CATEGORIES,
  getCategoryById,
  getSubcategoryById,
} from "@/lib/categories";
import {
  defaultLocaleFromCountry,
  pickLocaleString,
  type SiteLocale,
} from "@/lib/i18n/locales";

/** @deprecated Prefer SiteLocale — kept as alias for existing imports. */
export type CategoryLocale = SiteLocale;
export type { SiteLocale };

const DEPARTMENT_LABELS: Record<string, Partial<Record<SiteLocale, string>> & { en: string }> = {
  "computers-tablets": {
    en: "Computers + Tablets",
    de: "Computer + Tablets",
    fr: "Ordinateurs + tablettes",
    ro: "Calculatoare + tablete",
  },
  "pc-components-storage": {
    en: "PC Components + Storage",
    de: "PC-Komponenten + Speicher",
    fr: "Composants PC + stockage",
    ro: "Componente PC + stocare",
  },
  "phones-wearables": {
    en: "Phones + Wearables",
    de: "Telefone + Wearables",
    fr: "Téléphones + wearables",
    ro: "Telefoane + wearables",
  },
  "tv-home-cinema": {
    en: "TV + Home Cinema",
    de: "TV + Heimkino",
    fr: "TV + home cinéma",
    ro: "TV + home cinema",
  },
  audio: {
    en: "Audio",
    de: "Audio",
    fr: "Audio",
    ro: "Audio",
  },
  "gaming-vr": {
    en: "Gaming + VR",
    de: "Gaming + VR",
    fr: "Gaming + VR",
    ro: "Gaming + VR",
  },
  "photo-video-drones-optics": {
    en: "Photo + Video + Drones",
    de: "Foto + Video + Drohnen",
    fr: "Photo + vidéo + drones",
    ro: "Foto + video + drone",
  },
  "network-smart-home-security": {
    en: "Network + Smart Home",
    de: "Netzwerk + Smart Home",
    fr: "Réseau + maison connectée",
    ro: "Rețea + smart home",
  },
  "office-printing": {
    en: "Office + Printing",
    de: "Büro + Drucken",
    fr: "Bureau + impression",
    ro: "Birou + imprimare",
  },
  "large-appliances": {
    en: "Large Appliances",
    de: "Haushaltsgrossgeräte",
    fr: "Gros électroménager",
    ro: "Electrocasnice mari",
  },
  "kitchen-coffee": {
    en: "Kitchen + Coffee",
    de: "Küche + Kaffee",
    fr: "Cuisine + café",
    ro: "Bucătărie + cafea",
  },
  "cleaning-laundry-climate": {
    en: "Cleaning + Home Climate",
    de: "Reinigung + Raumklima",
    fr: "Nettoyage + climat intérieur",
    ro: "Curățenie + climat casnic",
  },
  "personal-care-health-baby": {
    en: "Personal Care + Health",
    de: "Körperpflege + Gesundheit",
    fr: "Soins personnels + santé",
    ro: "Îngrijire personală + sănătate",
  },
  "mobility-sport-outdoor": {
    en: "E-Mobility + Sport",
    de: "E-Mobilität + Sport",
    fr: "E-mobilité + sport",
    ro: "E-mobilitate + sport",
  },
  "diy-garden-power": {
    en: "DIY + Garden",
    de: "Baumarkt + Garten",
    fr: "Bricolage + jardin",
    ro: "Bricolaj + grădină",
  },
  "toys-hobby-rc": {
    en: "Toys + Hobby + RC",
    de: "Spielzeug + Hobby + RC",
    fr: "Jouets + hobby + RC",
    ro: "Jucării + hobby + RC",
  },
  "software-digital": {
    en: "Software + Digital",
    de: "Software + Digital",
    fr: "Logiciels + digital",
    ro: "Software + digital",
  },
  "books-games-media": {
    en: "Books + Games + Media",
    de: "Bücher + Games + Medien",
    fr: "Livres + jeux + médias",
    ro: "Cărți + jocuri + media",
  },
};

const GROUP_LABELS: Record<string, Partial<Record<SiteLocale, string>> & { en: string }> = {
  "computers-core": {
    en: "Computers & displays",
    de: "Computer & Displays",
    fr: "Ordinateurs & écrans",
    ro: "Calculatoare & display-uri",
  },
  "computers-peripherals": {
    en: "Peripherals & accessories",
    de: "Peripherie & Zubehör",
    fr: "Périphériques & accessoires",
    ro: "Periferice & accesorii",
  },
  "photo-cameras": {
    en: "Cameras",
    de: "Kameras",
    fr: "Appareils photo",
    ro: "Camere foto",
  },
  "photo-lenses-optics": {
    en: "Lenses & optics",
    de: "Objektive & Optik",
    fr: "Objectifs & optique",
    ro: "Obiective & optică",
  },
  "photo-accessories": {
    en: "Photo accessories",
    de: "Fotozubehör",
    fr: "Accessoires photo",
    ro: "Accesorii foto",
  },
  "photo-drones": {
    en: "Drones & RC",
    de: "Drohnen & RC",
    fr: "Drones & RC",
    ro: "Drone & RC",
  },
};

const COLLECTION_LABELS: Record<string, Partial<Record<SiteLocale, string>> & { en: string }> = {
  "compare-cross-border": {
    en: "Cross-border savings",
    de: "Grenzüberschreitend sparen",
    fr: "Économies transfrontalières",
    it: "Risparmi transfrontalieri",
    ro: "Economii transfrontaliere",
  },
  "compare-local-pickup": {
    en: "Pick up near you",
    de: "Abholung in der Nähe",
    fr: "Retrait près de chez vous",
    it: "Ritiro vicino a te",
    ro: "Ridicare în apropiere",
  },
  sale: {
    en: "Deals & price drops",
    de: "Deals & Preissenkungen",
    fr: "Promotions & baisses de prix",
    it: "Offerte e ribassi",
    ro: "Oferte & reduceri",
  },
  "compare-refurb": {
    en: "Refurbished & used",
    de: "Refurbished & Occasion",
    fr: "Reconditionné & occasion",
    it: "Ricondizionato e usato",
    ro: "Recondiționat & second-hand",
  },
};

export const CATEGORY_UI: Record<
  CategoryLocale,
  {
    allCategories: string;
    refineComparison: string;
    browsing: string;
    inDepartment: string;
    comparisonCollections: string;
    collectionsHint: string;
    emptyCategoryTitle: string;
    emptyCategoryBody: string;
    resetFilters: string;
    products: string;
  }
> = {
  en: {
    allCategories: "All Categories",
    refineComparison: "refine comparison",
    browsing: "Browsing",
    inDepartment: "in",
    comparisonCollections: "Comparison collections",
    collectionsHint:
      "Offer-based views — Cross-border unlocks foreign delivery (e.g. Amazon.de)",
    emptyCategoryTitle: "No offers in this category yet",
    emptyCategoryBody:
      "There are no comparable offers for this selection in {country} right now. Try another category or reset filters.",
    resetFilters: "Reset filters",
    products: "products",
  },
  de: {
    allCategories: "Alle Kategorien",
    refineComparison: "Vergleich verfeinern",
    browsing: "Anzeige",
    inDepartment: "in",
    comparisonCollections: "Vergleichssammlungen",
    collectionsHint:
      "Angebotsbasierte Ansichten — Grenzüberschreitend zeigt Auslandslieferung (z. B. Amazon.de)",
    emptyCategoryTitle: "Noch keine Angebote in dieser Kategorie",
    emptyCategoryBody:
      "Für diese Auswahl gibt es derzeit keine vergleichbaren Angebote in {country}. Wähle eine andere Kategorie oder setze die Filter zurück.",
    resetFilters: "Filter zurücksetzen",
    products: "Produkte",
  },
  fr: {
    allCategories: "Toutes les catégories",
    refineComparison: "affiner la comparaison",
    browsing: "Navigation",
    inDepartment: "dans",
    comparisonCollections: "Collections de comparaison",
    collectionsHint:
      "Vues basées sur les offres — Transfrontalier débloque la livraison étrangère (ex. Amazon.de)",
    emptyCategoryTitle: "Pas encore d'offres dans cette catégorie",
    emptyCategoryBody:
      "Aucune offre comparable pour cette sélection en {country} pour le moment. Essayez une autre catégorie ou réinitialisez les filtres.",
    resetFilters: "Réinitialiser les filtres",
    products: "produits",
  },
  ro: {
    allCategories: "Toate categoriile",
    refineComparison: "rafinează comparația",
    browsing: "Navigare",
    inDepartment: "în",
    comparisonCollections: "Colecții de comparație",
    collectionsHint:
      "Vizualizări bazate pe oferte — Transfrontalier deblochează livrarea din străinătate (ex. Amazon.de)",
    emptyCategoryTitle: "Încă nu există oferte în această categorie",
    emptyCategoryBody:
      "Nu există oferte comparabile pentru selecția curentă în {country} momentan. Încearcă altă categorie sau resetează filtrele.",
    resetFilters: "Resetează filtrele",
    products: "produse",
  },
  it: {
    allCategories: "Tutte le categorie",
    refineComparison: "affina il confronto",
    browsing: "Navigazione",
    inDepartment: "in",
    comparisonCollections: "Collezioni di confronto",
    collectionsHint:
      "Viste basate sulle offerte — Transfrontaliero sblocca la consegna estera (es. Amazon.de)",
    emptyCategoryTitle: "Nessuna offerta in questa categoria",
    emptyCategoryBody:
      "Non ci sono offerte confrontabili per questa selezione in {country} al momento. Prova un'altra categoria o reimposta i filtri.",
    resetFilters: "Reimposta filtri",
    products: "prodotti",
  },
};

/** Labels for the homepage Offer filters row (matches category locale). */
export const OFFER_FILTER_UI: Record<
  CategoryLocale,
  {
    title: string;
    hint: string;
    allBrands: string;
    maxTotal: string;
    anyPrice: string;
    inStock: string;
    freeDelivery: string;
    withEan: string;
  }
> = {
  en: {
    title: "Offer filters",
    hint: "Refine by total price, brand, stock, delivery & product ID",
    allBrands: "All brands",
    maxTotal: "Max total",
    anyPrice: "Any",
    inStock: "In stock",
    freeDelivery: "Free delivery",
    withEan: "With EAN",
  },
  de: {
    title: "Angebotsfilter",
    hint: "Nach Gesamtpreis, Marke, Lager, Lieferung & EAN verfeinern",
    allBrands: "Alle Marken",
    maxTotal: "Max. Gesamt",
    anyPrice: "Beliebig",
    inStock: "Auf Lager",
    freeDelivery: "Gratis Lieferung",
    withEan: "Mit EAN",
  },
  fr: {
    title: "Filtres d'offres",
    hint: "Affiner par prix total, marque, stock, livraison & EAN",
    allBrands: "Toutes les marques",
    maxTotal: "Total max.",
    anyPrice: "Tous",
    inStock: "En stock",
    freeDelivery: "Livraison gratuite",
    withEan: "Avec EAN",
  },
  ro: {
    title: "Filtre oferte",
    hint: "Rafinează după preț total, brand, stoc, livrare & EAN",
    allBrands: "Toate brandurile",
    maxTotal: "Total max.",
    anyPrice: "Oricare",
    inStock: "În stoc",
    freeDelivery: "Livrare gratuită",
    withEan: "Cu EAN",
  },
  it: {
    title: "Filtri offerte",
    hint: "Affina per prezzo totale, marca, stock, consegna e EAN",
    allBrands: "Tutte le marche",
    maxTotal: "Totale max.",
    anyPrice: "Qualsiasi",
    inStock: "Disponibile",
    freeDelivery: "Spedizione gratuita",
    withEan: "Con EAN",
  },
};

export function localeFromCountry(countryCode: CountryCode): SiteLocale {
  return defaultLocaleFromCountry(countryCode);
}

export function getDepartmentLabel(departmentId: string, locale: SiteLocale): string {
  return pickLocaleString(
    DEPARTMENT_LABELS[departmentId],
    locale,
    getCategoryById(departmentId)?.label ?? departmentId
  );
}

export function getGroupLabel(groupId: string, locale: SiteLocale): string {
  return pickLocaleString(GROUP_LABELS[groupId], locale, groupId);
}

export function getCollectionLabel(filterId: string, locale: SiteLocale): string {
  return pickLocaleString(
    COLLECTION_LABELS[filterId],
    locale,
    COMPARISON_COLLECTION_FILTERS.find((item) => item.id === filterId)?.label ?? filterId
  );
}

export function getSubcategoryLabel(subcategoryId: string, locale: SiteLocale): string {
  const sub = getSubcategoryById(subcategoryId);
  if (!sub) return subcategoryId;
  if (locale === "de" && sub.labelDe) return sub.labelDe;
  return sub.label;
}

export function getLocalizedCategoryLabel(categoryId: string, locale: CategoryLocale): string {
  if (categoryId === CATEGORY_ALL_OPTION.id) {
    return CATEGORY_UI[locale].allCategories;
  }

  const department = getCategoryById(categoryId);
  if (department) return getDepartmentLabel(department.id, locale);

  const sub = getSubcategoryById(categoryId);
  if (sub) return getSubcategoryLabel(sub.id, locale);

  if (COMPARISON_COLLECTION_FILTERS.some((item) => item.id === categoryId)) {
    return getCollectionLabel(categoryId, locale);
  }

  for (const cat of SHOPPING_CATEGORIES) {
    if (cat.id === categoryId) return getDepartmentLabel(cat.id, locale);
  }

  return categoryId;
}

export function formatCategoryUi(
  template: string,
  values: Record<string, string>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}
