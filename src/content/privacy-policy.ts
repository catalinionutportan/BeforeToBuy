/**
 * Published Privacy Policy for BeforeToBuy.com (English source of truth).
 * Adapted from TermsFeed Agreement ID 6c41a669-9a2e-4aed-8246-9bccf2d49c87
 * and aligned to the live service (no user accounts, no on-site checkout,
 * no active third-party analytics as of lastUpdated).
 */
export const PRIVACY_POLICY_LAST_UPDATED = "August 12, 2026";

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    id: "intro",
    title: "Introduction",
    paragraphs: [
      "This Privacy Policy describes how PortanX - Catalin Portan (“Company”, “We”, “Us”, or “Our”) collects, uses, and discloses information when You use the website BeforeToBuy.com (the “Service”), accessible at https://www.beforetobuy.com.",
      "If there is any conflict between a translated version of this Privacy Policy and this English version, the English version prevails.",
    ],
  },
  {
    id: "who",
    title: "1. Who we are",
    paragraphs: [
      "Company: PortanX - Catalin Portan",
      "Address: Flurstrasse 24, CH-3014 Bern, Switzerland",
      "Email: admin@portanx.com",
      "Phone: +41 78 310 33 17",
      "Contact page: https://www.beforetobuy.com/contact",
      "For the purposes of the EU GDPR (where it applies), the Company is the Data Controller. Swiss data protection law (nDSG) also applies to Our processing as a Swiss controller.",
    ],
  },
  {
    id: "service",
    title: "2. What BeforeToBuy.com is (and is not)",
    paragraphs: [
      "BeforeToBuy.com is a free product-presentation and price-information service. We display product offers from partner merchants and may redirect You to the merchant’s website.",
      "Purchases, delivery, returns, and refunds are handled only by the merchant You choose after leaving Our Service.",
    ],
    bullets: [
      "We do not sell products on this website",
      "We do not operate checkout or process payments on this website",
      "We do not require user accounts or login",
      "We do not send newsletters or marketing email campaigns",
      "We do not currently operate third-party analytics tools (such as Google Analytics) on this website",
    ],
  },
  {
    id: "collect",
    title: "3. Personal data we collect",
    paragraphs: [
      "3.1 Data You provide voluntarily (contact form). If You use https://www.beforetobuy.com/contact, We may collect: name; email address; message content; inquiry topic (for example: general, affiliate, merchant, privacy). We use this data only to respond to Your request. We do not use the contact form for marketing lists.",
      "3.2 Data collected automatically (Usage Data). When You visit the Service, Our hosting and infrastructure may process technical data such as IP address; browser type and version; device/browser technical information; pages visited, date/time, and approximate request metadata; referrer URL. This is typical server/hosting logging needed to operate and secure the Service.",
      "3.3 Preference and consent data. We store limited preferences such as selected shopping market / country; UI language; cookie / consent choices (Essential, Affiliate, Analytics categories in Our banner). These may be stored in cookies and/or local browser storage.",
      "3.4 What we do not collect as a product feature. We do not collect phone numbers, postal addresses, payment card data, social-media login profiles, or account passwords, because the Service has no user accounts and no on-site payments.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies and similar technologies",
    paragraphs: [
      "We use a cookie notice/banner on the Service. You can change non-essential choices through Our cookie preferences / banner controls. See also Our Cookie Policy at https://www.beforetobuy.com/cookies.",
    ],
    bullets: [
      "Essential — required for basic operation (for example security, consent record, market/language preferences). Always active.",
      "Affiliate — optional. If You grant Affiliate consent, outbound clicks to affiliate networks / merchants may allow those third parties to set their own cookies on their domains after You leave BeforeToBuy.com.",
      "Analytics — optional category in Our banner for a possible future analytics tool. Currently We do not run an active third-party analytics product on the Service. If that changes, We will update this Privacy Policy before activating it.",
    ],
  },
  {
    id: "affiliate",
    title: "5. Affiliate networks and merchant redirects",
    paragraphs: [
      "If You open a merchant offer and have granted Affiliate consent, You may be redirected through affiliate tracking links operated by networks such as AWIN and 2Performant, and then to the merchant’s own website.",
      "Those networks and merchants are independent controllers of data processed on their own domains. Their privacy policies apply after You leave Our Service. We do not control cookies set by those third parties on their sites.",
    ],
  },
  {
    id: "providers",
    title: "6. Service providers (infrastructure)",
    paragraphs: [
      "We use service providers to host and operate the Service, including Vercel (website hosting / delivery) and Supabase (database hosting for the product catalogue — product and offer data; not user accounts).",
      "Depending on configuration, contact messages may be delivered by email to admin@portanx.com (including via an email delivery provider if configured later). Today, contact handling may also use a mailto fallback in the browser.",
      "These providers process data according to their own terms and only as needed to provide the Service.",
    ],
  },
  {
    id: "use",
    title: "7. How we use personal data",
    paragraphs: [
      "We use personal data to operate and secure the Service; remember Your market/language/consent preferences; show catalogue information and handle redirects; respond to contact / privacy requests; and comply with law and defend legal claims.",
      "We do not use personal data for on-site advertising networks, remarketing pixels, or newsletters.",
    ],
  },
  {
    id: "legal-bases",
    title: "8. Legal bases (GDPR, where applicable)",
    paragraphs: [
      "Depending on the processing, We may rely on: Consent — for non-essential cookies / Affiliate consent where required; Legitimate interests — operating, securing, and improving a free information/redirect service, responding to inquiries, fraud/security; Legal obligation — where We must retain or disclose data under law; Steps prior to a contract / handling Your request — when You contact Us.",
    ],
  },
  {
    id: "retention",
    title: "9. Retention",
    paragraphs: [
      "Contact messages: kept as long as needed to handle the request and for a reasonable follow-up / legal period (typically up to 12–24 months unless a longer period is required).",
      "Consent records: up to the lifetime of the consent cookie/storage period used by the Service (currently designed around up to 180 days, unless renewed).",
      "Server / hosting logs: according to the hosting provider’s practices and Our security needs (typically limited periods).",
      "Catalogue data in Supabase is product/offer data, not user accounts.",
    ],
  },
  {
    id: "transfers",
    title: "10. International transfers",
    paragraphs: [
      "The Company is based in Switzerland. Some providers (for example hosting) may process data in the EU and/or other countries, including the United States. Where required, appropriate transfer mechanisms used by those providers (such as Standard Contractual Clauses) may apply. You may contact Us for more information.",
    ],
  },
  {
    id: "rights",
    title: "11. Your rights",
    paragraphs: [
      "Depending on Your location (including Switzerland, EEA/UK, and California where applicable), You may have rights to access, rectify, delete, restrict, object, portability, and withdraw consent.",
      "To exercise rights, contact admin@portanx.com or https://www.beforetobuy.com/contact. We generally aim to respond within 30 days where applicable.",
      "You may also contact the Swiss Federal Data Protection and Information Commissioner (FDPIC / EDOB). EEA users may contact their local supervisory authority; UK users may contact the ICO.",
    ],
  },
  {
    id: "ccpa",
    title: "12. California notice (CCPA/CPRA / CalOPPA) — summary",
    paragraphs: [
      "If You are a California resident, this section supplements the information above.",
      "We may collect limited identifiers and internet activity information (for example IP address / technical usage data) and, if You use the contact form, Your name and email.",
      "We do not sell personal information for money. We do not run Google Analytics or advertising/remarketing pixels on this Service at this time. Affiliate redirects (with Your Affiliate consent) may involve third-party networks after You leave Our site; those parties have their own policies.",
      "To submit a California privacy request, contact admin@portanx.com or https://www.beforetobuy.com/contact or +41 78 310 33 17 or by mail at Flurstrasse 24, CH-3014 Bern, Switzerland.",
      "Our Service does not currently respond to browser “Do Not Track” signals.",
    ],
  },
  {
    id: "children",
    title: "13. Children’s privacy",
    paragraphs: [
      "The Service is not directed to children, and We do not knowingly collect personal information from anyone under 16. If You believe a child provided personal information to Us, contact Us and We will delete it where appropriate.",
    ],
  },
  {
    id: "links",
    title: "14. Links to other websites",
    paragraphs: [
      "Our Service links to merchant and network websites We do not operate. Their privacy policies apply on those sites.",
    ],
  },
  {
    id: "changes",
    title: "15. Changes",
    paragraphs: [
      "We may update this Privacy Policy by posting the new version on this page and updating the “Last updated” date.",
    ],
  },
  {
    id: "contact",
    title: "16. Contact",
    paragraphs: [
      "Email: admin@portanx.com",
      "Web: https://www.beforetobuy.com/contact",
      "Phone: +41 78 310 33 17",
      "Mail: Flurstrasse 24, CH-3014 Bern, Switzerland",
    ],
  },
  {
    id: "source",
    title: "Source note",
    paragraphs: [
      "Adapted from a TermsFeed-generated Privacy Policy (Agreement ID 6c41a669-9a2e-4aed-8246-9bccf2d49c87 / Invoice ARCTF65674) and aligned to the actual BeforeToBuy.com service as of the last updated date above.",
    ],
  },
];
