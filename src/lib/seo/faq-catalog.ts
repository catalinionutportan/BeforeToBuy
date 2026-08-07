import type { SiteLocale } from "@/lib/i18n/locales";

/** SEO FAQ catalog — dedicated Help page content + FAQPage JSON-LD (not in site footer). */
export type FaqItem = { q: string; a: string };
export type FaqSection = { id: string; title: string; items: FaqItem[] };

const FAQ_EN: FaqSection[] = [
  {
    id: "lowest-price",
    title: "Lowest price & comparison",
    items: [
      {
        q: "How does BeforeToBuy help me find the lowest price?",
        a: "We show comparable offers from multiple merchants side by side so you can spot the lowest listed price before you leave for checkout. Always confirm the final total on the merchant site.",
      },
      {
        q: "Is the cheapest offer always the best deal?",
        a: "Not always. Factor in shipping, VAT/customs, stock, warranty, and return terms. The lowest product price can become more expensive after delivery fees.",
      },
      {
        q: "Do you guarantee the lowest price online?",
        a: "No. We aggregate and compare listed offers available to our catalog. Merchants set final checkout prices, and other shops may have deals we have not listed yet.",
      },
      {
        q: "Why do prices differ between stores for the same product?",
        a: "Merchants set their own pricing, promotions, stock, and shipping. Currency, region, and VAT treatment can also change the total you pay.",
      },
      {
        q: "Can I sort or filter by price?",
        a: "Yes — use the catalog filters and sort controls on the homepage to prioritize lower listed prices, then open merchant offers to verify.",
      },
      {
        q: "Are flash sales and coupons included?",
        a: "Only when they appear in the merchant data we receive. Coupons applied at checkout on the merchant site may not be reflected in our listed price.",
      },
    ],
  },
  {
    id: "how-it-works",
    title: "How BeforeToBuy works",
    items: [
      {
        q: "What is BeforeToBuy.com?",
        a: "A free Beta/Demo price comparison helper operated by PortanX - Catalin Portan in Bern, Switzerland. We compare offers and redirect you to merchant websites — we do not sell products ourselves.",
      },
      {
        q: "Do you sell products or process payments?",
        a: "No. There is no checkout on BeforeToBuy. Payment, shipping, and returns are handled only by the merchant you choose.",
      },
      {
        q: "Is BeforeToBuy free for shoppers?",
        a: "Yes. Consumers use the service free of charge. Merchants or affiliate networks may pay us a referral commission from their marketing budget — not as an added fee on your price.",
      },
      {
        q: "What does Click & Collect mean here?",
        a: "Where store locations are available, we may show distance estimates so you can compare pickup options. Distances are estimates and do not guarantee stock at that branch.",
      },
      {
        q: "Which countries can I browse?",
        a: "The platform targets several markets (including Switzerland and Romania). Availability of live merchant feeds varies by country and partnership status.",
      },
      {
        q: "What should I expect during Beta/Demo?",
        a: "Some offers are production-feed, sample, or demo and are labeled accordingly. Confirm price, VAT, shipping, and availability on the merchant checkout page before buying.",
      },
    ],
  },
  {
    id: "feeds-labels",
    title: "Production feed, sample & demo",
    items: [
      {
        q: "What is a production-feed offer?",
        a: "An offer sourced from a configured merchant product data feed. It is closer to live catalog data but can still lag behind the merchant website.",
      },
      {
        q: "What is a sample offer?",
        a: "Illustrative test data used for demos and integration checks. It is not a live merchant price you should rely on for purchase decisions.",
      },
      {
        q: "What is a demo offer?",
        a: "Generated catalog examples for UX and partner demos. Always verify on the merchant site before buying.",
      },
      {
        q: "Why is a price different from the merchant website?",
        a: "Feeds update on a schedule, promotions change quickly, and sample/demo rows are illustrative. The merchant checkout is authoritative.",
      },
      {
        q: "Which Romania merchants have live affiliate feeds today?",
        a: "Rowenta and Scule365 via 2Performant product feeds when Affiliate consent is granted. Other merchants are added after acceptance and feed wiring.",
      },
      {
        q: "Why does Brack.ch sometimes look like sample data?",
        a: "By default Brack.ch may use AWIN sample data unless a production feed is explicitly configured. Confirm price and stock on Brack before purchase.",
      },
    ],
  },
  {
    id: "affiliate-cookies",
    title: "Affiliate links, cookies & privacy",
    items: [
      {
        q: "Does clicking an offer change the price I pay?",
        a: "No. Referral commissions come from the merchant or network marketing budget. We do not add a BeforeToBuy markup to your checkout total.",
      },
      {
        q: "When are affiliate links enabled?",
        a: "Outbound affiliate redirects require your Affiliate consent in Cookie Settings. Essential browsing works without that category.",
      },
      {
        q: "Where can I change cookie preferences?",
        a: "Open Cookie Settings from the site footer at any time to update Essential, Location, Affiliate, and Analytics choices.",
      },
      {
        q: "Do you use my GPS location?",
        a: "Precise GPS and approximate IP location run only with Location consent. Coordinates stay in the browser session for distance estimates; see our Privacy Policy for processors.",
      },
      {
        q: "Do I need an account?",
        a: "No account is required to browse and compare prices on BeforeToBuy.com.",
      },
      {
        q: "How do I request my personal data (DSAR)?",
        a: "Email admin@portanx.com or use the contact form with subject “Privacy & legal request (DSAR)”. We aim to respond within 30 days.",
      },
    ],
  },
  {
    id: "shopping-tips",
    title: "Smart shopping tips",
    items: [
      {
        q: "How should I compare total cost, not just product price?",
        a: "Add shipping, VAT/customs, and any pickup fees. A slightly higher product price with free shipping can still be cheaper overall.",
      },
      {
        q: "How do I avoid fake “too good to be true” prices?",
        a: "Prefer production-feed labels, check the merchant’s official domain after redirect, and confirm stock and seller reputation on their site.",
      },
      {
        q: "Should I buy immediately when I see a low price?",
        a: "Pause to verify availability, return window, warranty, and whether a coupon stacks at checkout. Low listed prices can sell out quickly.",
      },
      {
        q: "Can BeforeToBuy match a price if I find it cheaper elsewhere?",
        a: "No. We do not set or match merchant prices. Use the comparison to choose where to buy, then complete purchase with that merchant.",
      },
      {
        q: "Do you show used or refurbished items?",
        a: "Only if a merchant feed includes them and they appear in our catalog. Condition details must be confirmed on the merchant page.",
      },
      {
        q: "How often are prices updated?",
        a: "Update frequency depends on each merchant feed. During Beta, treat listed prices as indicative and re-check at checkout.",
      },
    ],
  },
  {
    id: "orders-support",
    title: "Orders, shipping & support",
    items: [
      {
        q: "Who handles shipping and delivery?",
        a: "The merchant you buy from — not BeforeToBuy. Delivery times shown here are indicative only.",
      },
      {
        q: "How do returns, refunds, and warranties work?",
        a: "Post-purchase rights are governed by the merchant and applicable consumer law. Contact the merchant for order issues.",
      },
      {
        q: "Who do I contact if a link is broken?",
        a: "Use the Contact page or email admin@portanx.com with the product URL and merchant name so we can investigate.",
      },
      {
        q: "Where is the legal entity behind BeforeToBuy?",
        a: "PortanX - Catalin Portan, Sole Proprietorship, registered in the Canton of Bern (UID CHE-373.501.736). Details are on Impressum and Platform notices.",
      },
      {
        q: "Where can I read all legal documents?",
        a: "Open the Legal hub from the footer for Impressum, Privacy, Cookies, Terms, Affiliate disclosure, Disclaimer, and more.",
      },
      {
        q: "How do I file a complaint about the platform?",
        a: "Follow the Complaints procedure page. Order problems with a product must go to the merchant who sold it.",
      },
    ],
  },
];

const FAQ_RO: FaqSection[] = [
  {
    id: "lowest-price",
    title: "Prețul cel mai mic & comparație",
    items: [
      {
        q: "Cum mă ajută BeforeToBuy să găsesc prețul cel mai mic?",
        a: "Afișăm oferte comparabile de la mai mulți comercianți una lângă alta, ca să vezi prețul listat cel mai mic înainte să pleci la checkout. Confirmă întotdeauna totalul final pe site-ul comerciantului.",
      },
      {
        q: "Oferta cea mai ieftină este mereu cea mai bună?",
        a: "Nu întotdeauna. Ia în calcul transportul, TVA/vama, stocul, garanția și retururile. Un preț de produs mic poate deveni mai scump după taxe de livrare.",
      },
      {
        q: "Garantați cel mai mic preț online?",
        a: "Nu. Agregăm și comparăm ofertele din catalogul nostru. Comercianții stabilesc prețul final, iar alte magazine pot avea oferte pe care încă nu le listăm.",
      },
      {
        q: "De ce diferă prețurile între magazine pentru același produs?",
        a: "Fiecare comerciant își setează prețurile, promoțiile, stocul și transportul. Moneda, regiunea și TVA pot schimba totalul plătit.",
      },
      {
        q: "Pot sorta sau filtra după preț?",
        a: "Da — folosește filtrele și sortarea din catalogul de pe homepage pentru a prioritiza prețurile listate mai mici, apoi verifică pe site-ul comerciantului.",
      },
      {
        q: "Sunt incluse flash sales și cupoanele?",
        a: "Doar dacă apar în datele comerciantului pe care le primim. Cupoanele aplicate la checkout pe site-ul comerciantului pot să nu fie reflectate în prețul nostru listat.",
      },
    ],
  },
  {
    id: "how-it-works",
    title: "Cum funcționează BeforeToBuy",
    items: [
      {
        q: "Ce este BeforeToBuy.com?",
        a: "Un ajutor gratuit Beta/Demo de comparare a prețurilor, operat de PortanX - Catalin Portan în Berna, Elveția. Comparăm oferte și te redirecționăm către magazine — nu vindem noi produse.",
      },
      {
        q: "Vindeți produse sau procesați plăți?",
        a: "Nu. Nu există checkout pe BeforeToBuy. Plata, livrarea și retururile sunt doar ale comerciantului ales.",
      },
      {
        q: "BeforeToBuy este gratuit pentru cumpărători?",
        a: "Da. Consumatorii folosesc serviciul gratuit. Comercianții sau rețelele de afiliere ne pot plăti un comision din bugetul de marketing — nu ca adaos pe prețul tău.",
      },
      {
        q: "Ce înseamnă Click & Collect aici?",
        a: "Unde există locații de magazin, putem afișa estimări de distanță pentru ridicare. Distanțele sunt estimări și nu garantează stocul în acea filială.",
      },
      {
        q: "Ce țări pot naviga?",
        a: "Platforma țintește mai multe piețe (inclusiv Elveția și România). Disponibilitatea feed-urilor live variază după țară și parteneriate.",
      },
      {
        q: "La ce să mă aștept în Beta/Demo?",
        a: "Unele oferte sunt feed de producție, eșantion sau demo și sunt etichetate. Confirmă prețul, TVA, transportul și stocul pe checkout-ul comerciantului înainte de cumpărare.",
      },
    ],
  },
  {
    id: "feeds-labels",
    title: "Feed de producție, eșantion & demo",
    items: [
      {
        q: "Ce este o ofertă din feed de producție?",
        a: "O ofertă dintr-un feed de date configurat de comerciant. Este mai aproape de catalogul live, dar poate rămâne în urmă față de site-ul comerciantului.",
      },
      {
        q: "Ce este o ofertă eșantion?",
        a: "Date de test ilustrative pentru demo și integrare. Nu este un preț live pe care să te bazezi la cumpărare.",
      },
      {
        q: "Ce este o ofertă demo?",
        a: "Exemple de catalog generate pentru UX și demo-uri. Verifică întotdeauna pe site-ul comerciantului înainte să cumperi.",
      },
      {
        q: "De ce diferă prețul față de site-ul comerciantului?",
        a: "Feed-urile se actualizează periodic, promoțiile se schimbă rapid, iar rândurile eșantion/demo sunt ilustrative. Checkout-ul comerciantului este autoritar.",
      },
      {
        q: "Ce comercianți din România au feed afiliat live azi?",
        a: "Rowenta și Scule365 via 2Performant, când ai consimțământ Afiliat. Alți comercianți se adaugă după acceptare și conectarea feed-ului.",
      },
      {
        q: "De ce Brack.ch pare uneori date eșantion?",
        a: "Implicit, Brack.ch poate folosi date eșantion AWIN până la configurarea unui feed de producție. Confirmă prețul și stocul pe Brack înainte de cumpărare.",
      },
    ],
  },
  {
    id: "affiliate-cookies",
    title: "Afiliere, cookie-uri & confidențialitate",
    items: [
      {
        q: "Dacă dau click pe o ofertă, se schimbă prețul pe care îl plătesc?",
        a: "Nu. Comisioanele de recomandare vin din bugetul de marketing al comerciantului sau rețelei. Nu adăugăm un adaos BeforeToBuy la totalul tău.",
      },
      {
        q: "Când sunt activate linkurile afiliate?",
        a: "Redirecționările afiliate necesită consimțământul Afiliat din Setările cookie. Navigarea esențială funcționează și fără această categorie.",
      },
      {
        q: "Unde schimb preferințele cookie?",
        a: "Deschide Setările cookie din subsol oricând pentru Essential, Locație, Afiliat și Analytics.",
      },
      {
        q: "Folosiți locația mea GPS?",
        a: "GPS precis și IP aproximativ rulează doar cu consimțământ Locație. Coordonatele rămân în sesiunea browserului pentru distanțe; vezi Politica de confidențialitate.",
      },
      {
        q: "Am nevoie de un cont?",
        a: "Nu este necesar un cont pentru a naviga și compara prețurile pe BeforeToBuy.com.",
      },
      {
        q: "Cum solicit datele personale (DSAR)?",
        a: "Trimite e-mail la admin@portanx.com sau folosește formularul de contact cu subiectul „Solicitare confidențialitate și legală (DSAR)”. Răspundem în ~30 de zile.",
      },
    ],
  },
  {
    id: "shopping-tips",
    title: "Sfaturi de cumpărături",
    items: [
      {
        q: "Cum compar costul total, nu doar prețul produsului?",
        a: "Adaugă transportul, TVA/vama și taxele de ridicare. Un preț de produs puțin mai mare cu transport gratuit poate fi mai ieftin per total.",
      },
      {
        q: "Cum evit prețurile „prea bune ca să fie adevărate”?",
        a: "Preferă etichetele feed de producție, verifică domeniul oficial după redirect și confirmă stocul și reputația vânzătorului pe site-ul lor.",
      },
      {
        q: "Ar trebui să cumpăr imediat când văd un preț mic?",
        a: "Verifică mai întâi disponibilitatea, termenul de retur, garanția și dacă un cupon se aplică la checkout. Prețurile mici se pot epuiza rapid.",
      },
      {
        q: "Faceți price match dacă găsesc mai ieftin în altă parte?",
        a: "Nu. Noi nu setăm și nu egalăm prețurile comercianților. Folosește comparația ca să alegi unde cumperi.",
      },
      {
        q: "Afișați produse second-hand sau recondiționate?",
        a: "Doar dacă feed-ul comerciantului le include și apar în catalog. Confirmă starea pe pagina comerciantului.",
      },
      {
        q: "Cât de des se actualizează prețurile?",
        a: "Depinde de fiecare feed. În Beta, tratează prețurile listate ca indicative și re-verifică la checkout.",
      },
    ],
  },
  {
    id: "orders-support",
    title: "Comenzi, livrare & suport",
    items: [
      {
        q: "Cine se ocupă de transport și livrare?",
        a: "Comerciantul de la care cumperi — nu BeforeToBuy. Timpii afișați aici sunt doar indicativi.",
      },
      {
        q: "Cum funcționează retururile, rambursările și garanția?",
        a: "Drepturile post-cumpărare țin de comerciant și de legea consumatorului aplicabilă. Contactează comerciantul pentru probleme de comandă.",
      },
      {
        q: "Pe cine contactez dacă un link e stricat?",
        a: "Folosește pagina Contact sau admin@portanx.com cu URL-ul produsului și numele comerciantului.",
      },
      {
        q: "Care este entitatea legală din spatele BeforeToBuy?",
        a: "PortanX - Catalin Portan, întreprindere individuală, înregistrată în Cantonul Berna (UID CHE-373.501.736). Detalii pe Impresum și Notificări platformă.",
      },
      {
        q: "Unde citesc toate documentele legale?",
        a: "Deschide centrul legal din subsol pentru Impresum, Confidențialitate, Cookies, Termeni, Afiliere, Disclaimer și altele.",
      },
      {
        q: "Cum depun o plângere despre platformă?",
        a: "Urmează pagina Procedură reclamații. Problemele de comandă cu un produs merg la comerciantul care l-a vândut.",
      },
    ],
  },
];

export function getFaqCatalog(locale: SiteLocale): FaqSection[] {
  return locale === "ro" ? FAQ_RO : FAQ_EN;
}

export function flattenFaqItems(sections: FaqSection[]): FaqItem[] {
  return sections.flatMap((section) => section.items);
}
