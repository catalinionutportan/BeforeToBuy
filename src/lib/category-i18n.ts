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
import { SUBCATEGORY_LABELS } from "@/lib/i18n/subcategory-labels";

/** @deprecated Prefer SiteLocale — kept as alias for existing imports. */
export type CategoryLocale = SiteLocale;
export type { SiteLocale };

const DEPARTMENT_LABELS: Record<string, Partial<Record<SiteLocale, string>> & { en: string }> = {
  electronics: {
    en: "Electronics",
    de: "Elektronik",
    fr: "Électronique",
    it: "Elettronica",
    ro: "Electronice",
  },
  "fashion-lifestyle": {
    en: "Fashion",
    de: "Mode",
    fr: "Mode",
    it: "Moda",
    ro: "Modă",
  },
  appliances: {
    en: "Appliances",
    de: "Haushaltsgeräte",
    fr: "Électroménager",
    it: "Elettrodomestici",
    ro: "Electrocasnice",
  },
  furniture: {
    en: "Furniture",
    de: "Möbel",
    fr: "Mobilier",
    it: "Mobili",
    ro: "Mobilier",
  },
  "home-textiles": {
    en: "Home Textiles",
    de: "Heimtextilien",
    fr: "Linge de maison",
    it: "Tessile casa",
    ro: "Textile casă",
  },
  "office-stationery": {
    en: "Office + Books",
    de: "Büro + Bücher",
    fr: "Bureau + livres",
    it: "Ufficio + libri",
    ro: "Birou + librărie",
  },
  "beverages-alcohol": {
    en: "Wine & Spirits",
    de: "Wein + Spirituosen",
    fr: "Vins & spiritueux",
    it: "Vini e distillati",
    ro: "Vinuri & spirtoase",
  },
  "diy-tools": {
    en: "DIY + Tools",
    de: "Baumarkt + Werkzeug",
    fr: "Bricolage",
    it: "Fai da te",
    ro: "Bricolaj",
  },
  garden: {
    en: "Garden",
    de: "Garten",
    fr: "Jardin",
    it: "Giardino",
    ro: "Grădină",
  },
  "mobility-sport-outdoor": {
    en: "Bikes + Scooters",
    de: "Velo + Scooter",
    fr: "Vélos + trottinettes",
    it: "Bici + scooter",
    ro: "Biciclete + scutere",
  },
  "auto-parts": {
    en: "Auto Parts",
    de: "Autoteile",
    fr: "Pièces auto",
    it: "Ricambi auto",
    ro: "Piese auto",
  },
  "toys-hobby-rc": {
    en: "Toys + Hobby + RC",
    de: "Spielzeug + Hobby + RC",
    fr: "Jouets + hobby + RC",
    it: "Giocattoli + hobby + RC",
    ro: "Jucării + hobby + RC",
  },
};

const GROUP_LABELS: Record<string, Partial<Record<SiteLocale, string>> & { en: string }> = {
  "electronics-phones-tablets": {
    en: "Phones & tablets",
    de: "Telefone & Tablets",
    fr: "Téléphones & tablettes",
    it: "Telefoni e tablet",
    ro: "Telefoane & tablete",
  },
  "electronics-computers": {
    en: "Computers & PC",
    de: "Computer & PC",
    fr: "Ordinateurs & PC",
    it: "Computer e PC",
    ro: "Calculatoare & PC",
  },
  "electronics-audio-tv": {
    en: "Audio, TV & wearables",
    de: "Audio, TV & Wearables",
    fr: "Audio, TV & wearables",
    it: "Audio, TV e wearables",
    ro: "Audio, TV & wearables",
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
    minTotal: string;
    maxTotal: string;
    anyPrice: string;
    inStock: string;
    freeDelivery: string;
    withEan: string;
  }
> = {
  en: {
    title: "Offer filters",
    hint: "Refine by brand and total price",
    allBrands: "All brands",
    minTotal: "Min total",
    maxTotal: "Max total",
    anyPrice: "Any",
    inStock: "In stock",
    freeDelivery: "Free delivery",
    withEan: "With EAN",
  },
  de: {
    title: "Angebotsfilter",
    hint: "Nach Marke und Gesamtpreis verfeinern",
    allBrands: "Alle Marken",
    minTotal: "Min. Gesamt",
    maxTotal: "Max. Gesamt",
    anyPrice: "Beliebig",
    inStock: "Auf Lager",
    freeDelivery: "Gratis Lieferung",
    withEan: "Mit EAN",
  },
  fr: {
    title: "Filtres d'offres",
    hint: "Affiner par marque et prix total",
    allBrands: "Toutes les marques",
    minTotal: "Total min.",
    maxTotal: "Total max.",
    anyPrice: "Tous",
    inStock: "En stock",
    freeDelivery: "Livraison gratuite",
    withEan: "Avec EAN",
  },
  ro: {
    title: "Filtre oferte",
    hint: "Rafinează după brand și preț total",
    allBrands: "Toate brandurile",
    minTotal: "Total min.",
    maxTotal: "Total max.",
    anyPrice: "Oricare",
    inStock: "În stoc",
    freeDelivery: "Livrare gratuită",
    withEan: "Cu EAN",
  },
  it: {
    title: "Filtri offerte",
    hint: "Affina per marca e prezzo totale",
    allBrands: "Tutte le marche",
    minTotal: "Totale min.",
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
  const localized = SUBCATEGORY_LABELS[subcategoryId];
  if (localized) {
    return pickLocaleString(localized, locale, localized.en);
  }
  const sub = getSubcategoryById(subcategoryId);
  if (!sub) return subcategoryId;
  if (locale === "de" && sub.labelDe) return sub.labelDe;
  return sub.label;
}

export function getLocalizedCategoryLabel(categoryId: string, locale: CategoryLocale): string {
  if (categoryId === CATEGORY_ALL_OPTION.id) {
    return CATEGORY_UI[locale].allCategories;
  }

  const hubLabels: Record<string, Partial<Record<CategoryLocale, string>>> = {
    "hub-electronics": { en: "Electronics", de: "Elektronik", fr: "Électronique", it: "Elettronica", ro: "Electronice" },
    "hub-home": { en: "Home + Appliances", de: "Haushalt", fr: "Maison + électroménager", it: "Casa + elettrodomestici", ro: "Casă + electrocasnice" },
    "hub-books": { en: "Office + Books", de: "Büro + Bücher", fr: "Bureau + livres", it: "Ufficio + libri", ro: "Birou + librărie" },
    "hub-fashion": { en: "Fashion", de: "Mode", fr: "Mode", it: "Moda", ro: "Modă" },
    "hub-garden": { en: "Garden", de: "Garten", fr: "Jardin", it: "Giardino", ro: "Grădină" },
    "hub-diy": { en: "DIY + Tools", de: "Baumarkt", fr: "Bricolage", it: "Fai da te", ro: "Bricolaj" },
    "hub-auto": { en: "Auto", de: "Auto", fr: "Auto", it: "Auto", ro: "Auto" },
  };
  const hub = hubLabels[categoryId];
  if (hub) return hub[locale] ?? hub.en ?? categoryId;

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
