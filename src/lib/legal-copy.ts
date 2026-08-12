import type { SiteLocale } from "@/lib/i18n/locales";
import {
  buildLocalizedDataProcessors,
  type ProcessorItem,
} from "@/lib/data-processors";

type LegalCopy = {
  common: {
    switzerland: string;
    liveLabel: string;
    plannedLabel: string;
    policyBadge: string;
    backToLegalHub: string;
    policyFallbackTitle: string;
    policyFallbackDescription: string;
  };
  legalHub: {
    heroBody: string;
    firmDataTitle: string;
    registrySummaryTitle: string;
    registryPublishingOfficeLabel: string;
    registryContactOfficeLabel: string;
    cookieSettingsTitle: string;
    cookieSettingsBody: string;
  };
  help: {
    summary: string;
  };
  privacy: {
    processingTitle: string;
    processingBody: string;
    transfersTitle: string;
    transfersBody: string;
    complaintBody: string;
  };
  terms: {
    userDutiesTitle: string;
    userDutiesItems: [string, string, string, string];
    liabilityTitle: string;
    liabilityBody: string;
    liabilityBody2: string;
    intellectualPropertyTitle: string;
    intellectualPropertyBody: string;
    governingLawTitle: string;
    governingLawBody: string;
    changesContactTitle: string;
    changesContactBody: string;
  };
  cookies: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    title: string;
    intro: string;
    whatWeUseTitle: string;
    whatWeUseBody: string;
    categoriesTitle: string;
    tableCategory: string;
    tablePurpose: string;
    tableStorage: string;
    tableRequired: string;
    essentialCategory: string;
    essentialPurpose: string;
    essentialStorage: string;
    essentialRequired: string;
    affiliateCategory: string;
    affiliatePurpose: string;
    affiliateStorage: string;
    affiliateRequired: string;
    analyticsCategory: string;
    analyticsPurpose: string;
    analyticsStorage: string;
    analyticsRequired: string;
    processorsTitle: string;
    processorItems: [string, string, string, string, string];
    manageChoicesTitle: string;
    manageChoicesBody: string;
    manageChoicesBody2: string;
  };
  affiliate: {
    metaTitle: string;
    metaDescription: string;
    stageZeroTitle: string;
  };
  accessibility: {
    metaTitle: string;
    metaDescription: string;
  };
  impressum: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    intro: string;
    businessPurposeTitle: string;
    registerPublicationTitle: string;
    registerCategoryLabel: string;
    subcategoryLabel: string;
    publicationDateLabel: string;
    messageNumberLabel: string;
    dailyRegisterLabel: string;
    contactOfficeLabel: string;
    publishingOfficeLabel: string;
    disclaimerTitle: string;
    contentLiabilityTitle: string;
    contentLiabilityBody: string;
    linkLiabilityTitle: string;
    linkLiabilityBody: string;
    copyrightTitle: string;
    copyrightBody: string;
  };
  transparency: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    title: string;
    intro: string;
    operatorNoticeTitle: string;
    operatorNoticeBody: string;
    companyCardTitle: string;
    companyCardBody: string;
    companyCardLink: string;
    affiliateCardTitle: string;
    affiliateCardBody: string;
    affiliateCardLink: string;
    priceCardTitle: string;
    priceCardBody: string;
    priceCardLink: string;
    legalHubLabel: string;
    impressumLabel: string;
    privacyLabel: string;
    merchantDirectoryLabel: string;
  };
  disclaimer: {
    metaTitle: string;
    metaDescription: string;
    badge: string;
    title: string;
    intro: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    section3Title: string;
    section3Body: string;
    section4Title: string;
    section4Body: string;
    section5Title: string;
    section5Body: string;
    section6Title: string;
    section6Body: string;
  };
};

type LegalIndexSection = {
  id: string;
  title: string;
  items: {
    href: string;
    label: string;
    description: string;
  }[];
};

type ProcessingPurpose = {
  purpose: string;
  basis: string;
};

type RetentionItem = {
  data: string;
  retention: string;
  legalBasis: string;
};

const LEGAL_COPY: Record<SiteLocale, LegalCopy> = {
  en: {
    common: {
      switzerland: "Switzerland",
      liveLabel: "live",
      plannedLabel: "planned",
      policyBadge: "Policy",
      backToLegalHub: "Back to Legal & Company",
      policyFallbackTitle: "Policy | BeforeToBuy.com",
      policyFallbackDescription: "BeforeToBuy.com policy document.",
    },
    legalHub: {
      heroBody:
        "Operated by {legalName} (UID {uid}). Every mandatory public document and policy link for audits, partners, and users is listed below.",
      firmDataTitle: "Company data, UID, HR and SHAB",
      registrySummaryTitle: "Official register publication summary",
      registryPublishingOfficeLabel: "Publishing office",
      registryContactOfficeLabel: "Registry office",
      cookieSettingsTitle: "Cookie settings",
      cookieSettingsBody:
        "Open the consent dialog to change Essential, Affiliate, and Analytics preferences.",
    },
    help: {
      summary:
        "{count} questions covering lowest-price comparison, feeds, affiliate honesty, and shopping tips, structured for search discovery.",
    },
    privacy: {
      processingTitle: "Processing purposes and legal bases",
      processingBody:
        "Swiss nDSG applies to our processing as a Swiss controller. Where the EU GDPR applies to visitors in the EU/EEA, you may also exercise GDPR rights. This notice is a transparency document, not a legal certification.",
      transfersTitle: "International transfers",
      transfersBody:
        "Hosting and infrastructure providers (especially Vercel and Supabase) may process data in the EU and/or other countries, including the United States. Optional tools such as Datadog or Resend are used only if configured and, where required, only with consent. Standard contractual and transfer mechanisms used by those providers may apply; please consult each provider for details.",
      complaintBody:
        "You may also lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC / EDOB):",
    },
    terms: {
      userDutiesTitle: "4. User duties",
      userDutiesItems: [
        "Use the service only for lawful, personal price-comparison purposes.",
        "Do not scrape, overload, or misuse our APIs or catalog pages.",
        "Do not bypass consent, anti-abuse, or rate-limit mechanisms.",
        "Follow our Privacy Policy and Cookie Policy when using optional features.",
      ],
      liabilityTitle: "5. Liability and availability (free information service)",
      liabilityBody:
        "{platformName} is a free information and redirection service. We do not guarantee that catalogs, prices, or availability are complete, current, or error-free. To the extent permitted by Swiss law, we are not liable for indirect or consequential damages arising from use of the service or reliance on displayed information, except in cases of unlawful intent or gross negligence where liability cannot be excluded. Merchant content and checkout terms remain the merchant's responsibility. The service may change, pause, or show incomplete data without notice.",
      liabilityBody2:
        "Ranking: offers are sorted by indicative total by default and filters may change the order. Paid placement is not currently used; if introduced later it will be labeled. Details:",
      intellectualPropertyTitle: "6. Intellectual property and third-party marks",
      intellectualPropertyBody:
        "Content, brands, and software on {platformName} are protected by copyright. Product images and marks remain the property of their respective owners and are shown for identification only, without implying endorsement or partnership unless explicitly stated. Outbound links lead to third-party content.",
      governingLawTitle: "7. Governing law and venue",
      governingLawBody:
        "Swiss law applies exclusively. The exclusive venue is Bern, Switzerland. Mandatory consumer protection rules of your country of residence, especially in the EU/EEA, remain unaffected where applicable.",
      changesContactTitle: "8. Updates and contact",
      changesContactBody:
        "We may update these terms when needed. Complaints: {complaintsLabel}. Contact: {email}.",
    },
    cookies: {
      metaTitle: "Cookie Policy | BeforeToBuy.com",
      metaDescription:
        "How BeforeToBuy.com uses cookies, local storage, and similar technologies.",
      badge: "Cookie Policy",
      title: "Cookie and storage policy",
      intro:
        "Last updated: August 2026. This page explains how BeforeToBuy.com stores consent choices and when optional technologies run.",
      whatWeUseTitle: "1. What we use",
      whatWeUseBody:
        "BeforeToBuy.com is a price comparison service. We do not run advertising cookies on our domain. We use browser local storage to remember your choices and a signed HttpOnly essential cookie to record Affiliate consent server-side. Affiliate outbound links stay blocked until you grant Affiliate consent. Approved merchant and CDN product images may load as an essential catalogue function and can receive your IP address, user-agent, and technical request metadata.",
      categoriesTitle: "2. Categories",
      tableCategory: "Category",
      tablePurpose: "Purpose",
      tableStorage: "Storage",
      tableRequired: "Required",
      essentialCategory: "Essential",
      essentialPurpose: "Shopping market, interface language, and consent preferences.",
      essentialStorage:
        "Market and language preferences in localStorage/cookies for up to one year; consent preferences (b2b_consent_v4, b2b_consent, b2b_consent_hint) for up to 180 days.",
      essentialRequired: "Yes",
      affiliateCategory: "Affiliate (optional)",
      affiliatePurpose: "Enable outbound merchant links; partner stores may set their own cookies.",
      affiliateStorage: "Third-party on merchant domains after you leave our site.",
      affiliateRequired: "No, only with consent",
      analyticsCategory: "Analytics (optional)",
      analyticsPurpose:
        "Reserved for a possible future analytics tool. No third-party analytics product is currently active on BeforeToBuy.com.",
      analyticsStorage:
        "Consent preference only (localStorage / consent hint). No analytics SDK is loaded while analytics tools remain inactive.",
      analyticsRequired: "No, only with consent and off by default",
      processorsTitle: "3. Service providers and optional third parties",
      processorItems: [
        "Vercel — hosting, CDN, and server logs.",
        "Supabase — product catalogue database.",
        "Analytics tools — not currently active; the Analytics consent category is reserved for a future optional tool.",
        "Merchant partners and approved CDN image hosts — catalogue images and affiliate tracking on merchant domains after you leave our site (Affiliate consent required for outbound affiliate links).",
        "Resend — contact-form email delivery when configured (otherwise mailto fallback).",
      ],
      manageChoicesTitle: "4. Manage your choices",
      manageChoicesBody:
        "You can change or withdraw consent at any time using the cookie banner or the \"Cookie Settings\" link in the site footer. Withdrawing Affiliate consent blocks outbound affiliate links until you accept again.",
      manageChoicesBody2: "See also our",
    },
    affiliate: {
      metaTitle: "Affiliate Disclosure and Transparency Statement | BeforeToBuy.com",
      metaDescription:
        "Official affiliate disclosure statement for BeforeToBuy.com operated by PortanX - Catalin Portan.",
      stageZeroTitle: "Stage-zero notice (phase: {phase})",
    },
    accessibility: {
      metaTitle: "Accessibility Statement | BeforeToBuy.com",
      metaDescription:
        "Accessibility statement for BeforeToBuy.com covering goals, known limitations, and feedback channels.",
    },
    impressum: {
      metaTitle: "Impressum | BeforeToBuy.com",
      metaDescription:
        "Official legal impressum and company information for BeforeToBuy.com operated by PortanX - Catalin Portan.",
      badge: "Legal notice",
      intro: "Official provider information under Swiss law and Art. 3 para. 1 lit. s UWG.",
      businessPurposeTitle: "Business purpose",
      registerPublicationTitle: "Commercial register publication",
      registerCategoryLabel: "Category",
      subcategoryLabel: "Subcategory",
      publicationDateLabel: "Publication date",
      messageNumberLabel: "Message number",
      dailyRegisterLabel: "Daily register",
      contactOfficeLabel: "Registry office",
      publishingOfficeLabel: "Publishing office",
      disclaimerTitle: "Content and link disclaimer",
      contentLiabilityTitle: "Liability for content",
      contentLiabilityBody:
        "We prepare the content on our pages with great care. However, we do not guarantee accuracy, completeness, or currentness, especially for product prices and availability. Production-feed, sample, and demo prices are indicative; the merchant's checkout remains authoritative.",
      linkLiabilityTitle: "Liability for links",
      linkLiabilityBody:
        "Our site contains links to external third-party websites, including affiliate partners. We have no control over their content, so the respective provider or operator remains responsible for those pages.",
      copyrightTitle: "Copyright",
      copyrightBody:
        "Content and works created by the site operator are subject to Swiss copyright law.",
    },
    transparency: {
      metaTitle: "Platform notices and transparency | BeforeToBuy.com",
      metaDescription:
        "Operator notice, company registration, affiliate zero-markup, and price verification for BeforeToBuy.com.",
      badge: "Transparency",
      title: "Platform notices",
      intro:
        "Operator details and commercial notices for users and partner due diligence. The dedicated legal pages remain linked from the legal hub and footer.",
      operatorNoticeTitle: "Operator and platform notice",
      operatorNoticeBody:
        "BeforeToBuy.com is a product-presentation and redirect service without checkout on this site. It is operated from Switzerland by {legalName} (Commercial Register Canton of Bern, UID: {uid}). Live partner feeds cover selected merchants in multiple countries; the catalog may also include sample or demo offers, so confirm final terms on the merchant site.",
      companyCardTitle: "Company entity and registration",
      companyCardBody:
        "Operated by {legalName} ({legalForm}). Registered in {registryOffice} under Daily Register No. {dailyRegisterNumber} (SHAB publication {messageNumber}).",
      companyCardLink: "Full impressum",
      affiliateCardTitle: "Affiliate commission and zero markup",
      affiliateCardBody:
        "The service is free for consumers. A merchant or network may pay us a referral commission from their marketing budget, but we do not add a BeforeToBuy fee. Final checkout price is always set by the merchant.",
      affiliateCardLink: "Affiliate disclosure",
      priceCardTitle: "Price and availability verification",
      priceCardBody:
        "Some prices are sample or demo and may not reflect live merchant feeds. Always confirm final price, VAT, shipping, availability, and delivery terms on the official merchant checkout page.",
      priceCardLink: "Price disclaimer",
      legalHubLabel: "Legal hub",
      impressumLabel: "Impressum",
      privacyLabel: "Privacy",
      merchantDirectoryLabel: "Merchant directory",
    },
    disclaimer: {
      metaTitle: "Price and Service Disclaimer | BeforeToBuy.com",
      metaDescription:
        "Commercial disclaimer for BeforeToBuy.com covering price accuracy, source labels, affiliate model, and merchant responsibility.",
      badge: "Commercial disclaimer",
      title: "Price and service disclaimer",
      intro:
        "Important limitations of BeforeToBuy.com as a price-comparison service that redirects to merchants. Current site phase: {phase}.",
      section1Title: "1. Data sources and hybrid catalog",
      section1Body:
        "{platformName} combines live merchant feeds with clearly identified illustrative catalog data. Offers are labeled Production feed, Sample, or Demo so users can distinguish live entries from non-live ones.",
      section2Title: "2. No binding offer and no guarantee of price, stock, or availability",
      section2Body:
        "Information on this site is not a binding offer and not a price quote. We do not guarantee accuracy, completeness, or timeliness of prices, delivery times, stock status, or coupon codes. Merchant websites remain authoritative at the time of purchase.",
      section3Title: "3. We are not a party to merchant transactions",
      section3Body:
        "{platformName} is not a seller, broker, marketplace operator, or payment processor. Contracts for goods and services are formed exclusively between you and the merchant. Shipping, payment, returns, refunds, warranty, and consumer rights are handled by the merchant.",
      section4Title: "4. Affiliate referral model",
      section4Body:
        "We compare and redirect. If you accept the Affiliate category, a merchant or network may pay us a referral commission from their own marketing budget. We do not add a BeforeToBuy fee to your price.",
      section5Title: "5. Ranking of offers",
      section5Body:
        "By default, offers are sorted by an indicative total using the information currently available. Filters may change the order. Paid commercial placement is not currently used; if introduced later it will be clearly labeled.",
      section6Title: "6. External links and service availability",
      section6Body:
        "Outbound links lead to third-party merchant websites. We are not responsible for their content, pricing, privacy practices, or availability. As a free service, catalogs and features may change, pause, or stay incomplete without notice.",
    },
  },
  de: {
    common: {
      switzerland: "Schweiz",
      liveLabel: "live",
      plannedLabel: "geplant",
      policyBadge: "Richtlinie",
      backToLegalHub: "Zurück zur Rechtszentrale",
      policyFallbackTitle: "Richtlinie | BeforeToBuy.com",
      policyFallbackDescription: "Richtliniendokument von BeforeToBuy.com.",
    },
    legalHub: {
      heroBody:
        "Betrieben von {legalName} (UID {uid}). Alle verpflichtenden öffentlichen Dokumente und Richtlinienlinks für Audits, Partner und Nutzer sind unten gebündelt.",
      firmDataTitle: "Firmendaten, UID, HR und SHAB",
      registrySummaryTitle: "Zusammenfassung der amtlichen Registerpublikation",
      registryPublishingOfficeLabel: "Publizierende Stelle",
      registryContactOfficeLabel: "Registeramt",
      cookieSettingsTitle: "Cookie-Einstellungen",
      cookieSettingsBody:
        "Öffnen Sie den Einwilligungsdialog, um Präferenzen für Essenziell, Affiliate und Analytics zu ändern.",
    },
    help: {
      summary:
        "{count} Fragen zu Preisvergleich, Feeds, Affiliate-Transparenz und Shopping-Tipps, strukturiert für bessere Auffindbarkeit in Suchmaschinen.",
    },
    privacy: {
      processingTitle: "Verarbeitungszwecke und Rechtsgrundlagen",
      processingBody:
        "Für unsere Verarbeitung als Schweizer Verantwortlicher gilt das nDSG. Soweit die EU-DSGVO für Besucher in der EU/im EWR anwendbar ist, können Sie zusätzlich DSGVO-Rechte ausüben. Dieser Hinweis ist ein Transparenzdokument und keine Rechtszertifizierung.",
      transfersTitle: "Internationale Datenübermittlungen",
      transfersBody:
        "Hosting- und Infrastrukturanbieter (insbesondere Vercel und Supabase) können Daten in der EU und/oder anderen Staaten, einschliesslich der USA, verarbeiten. Optionale Tools wie Datadog oder Resend werden nur verwendet, wenn sie konfiguriert sind und — soweit erforderlich — nur mit Einwilligung. Es können die von den jeweiligen Anbietern vorgesehenen Standardvertrags- oder Transfermechanismen gelten.",
      complaintBody:
        "Sie können sich außerdem beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB / FDPIC) beschweren:",
    },
    terms: {
      userDutiesTitle: "4. Nutzerpflichten",
      userDutiesItems: [
        "Nutzung nur für legale, persönliche Preisvergleichszwecke.",
        "Kein Scraping, keine Überlastung und kein Missbrauch unserer APIs oder Katalogseiten.",
        "Keine Umgehung von Consent-, Anti-Missbrauchs- oder Rate-Limit-Mechanismen.",
        "Bei optionalen Funktionen unsere Datenschutzrichtlinie und Cookie-Richtlinie beachten.",
      ],
      liabilityTitle: "5. Haftung und Verfügbarkeit (kostenloser Informationsdienst)",
      liabilityBody:
        "{platformName} ist ein kostenloser Informations- und Weiterleitungsdienst. Wir gewährleisten nicht, dass Kataloge, Preise oder Verfügbarkeiten vollständig, aktuell oder fehlerfrei sind. Soweit nach Schweizer Recht zulässig, haften wir nicht für indirekte oder Folgeschäden aus der Nutzung des Dienstes oder dem Vertrauen auf angezeigte Informationen, außer bei Vorsatz oder grober Fahrlässigkeit, soweit eine Haftungsbeschränkung nicht zulässig ist. Händlerinhalt und Checkout-Bedingungen bleiben Verantwortung des Händlers. Der Dienst kann sich ändern, pausieren oder unvollständige Daten anzeigen.",
      liabilityBody2:
        "Ranking: Angebote werden standardmäßig nach einem indikativen Gesamtwert sortiert; Filter können die Reihenfolge ändern. Bezahlte Platzierung wird derzeit nicht verwendet; falls sie später eingeführt wird, wird sie gekennzeichnet. Details:",
      intellectualPropertyTitle: "6. Geistiges Eigentum und Drittmarken",
      intellectualPropertyBody:
        "Inhalte, Marken und Software auf {platformName} sind urheberrechtlich geschützt. Produktbilder und Marken bleiben Eigentum der jeweiligen Rechteinhaber und werden nur zur Identifikation angezeigt, ohne eine Empfehlung oder Partnerschaft zu behaupten, sofern dies nicht ausdrücklich angegeben ist. Ausgehende Links führen zu Drittinhalten.",
      governingLawTitle: "7. Anwendbares Recht und Gerichtsstand",
      governingLawBody:
        "Es gilt ausschließlich Schweizer Recht. Ausschließlicher Gerichtsstand ist Bern, Schweiz. Zwingende Verbraucherschutzvorschriften Ihres Wohnsitzlandes, insbesondere in der EU/im EWR, bleiben soweit anwendbar unberührt.",
      changesContactTitle: "8. Änderungen und Kontakt",
      changesContactBody:
        "Wir können diese Bedingungen bei Bedarf aktualisieren. Beschwerden: {complaintsLabel}. Kontakt: {email}.",
    },
    cookies: {
      metaTitle: "Cookie-Richtlinie | BeforeToBuy.com",
      metaDescription:
        "Wie BeforeToBuy.com Cookies, lokalen Speicher und ähnliche Technologien verwendet.",
      badge: "Cookie-Richtlinie",
      title: "Cookie- und Speicher-Richtlinie",
      intro:
        "Letzte Aktualisierung: August 2026. Diese Seite erklärt, wie BeforeToBuy.com Einwilligungen speichert und wann optionale Technologien aktiv werden.",
      whatWeUseTitle: "1. Was wir verwenden",
      whatWeUseBody:
        "BeforeToBuy.com ist ein Preisvergleichsdienst. Wir setzen auf unserer Domain keine Werbe-Cookies ein. Wir verwenden den Browser-Lokalspeicher, um Ihre Entscheidungen zu merken, sowie ein signiertes essenzielles HttpOnly-Cookie, um die Affiliate-Einwilligung serverseitig zu erfassen. Affiliate-Links bleiben gesperrt, bis Sie Affiliate-Einwilligung erteilen. Freigegebene Händler-/CDN-Produktbilder können als wesentliche Katalogfunktion geladen werden und dabei IP-Adresse, User-Agent und technische Metadaten erhalten.",
      categoriesTitle: "2. Kategorien",
      tableCategory: "Kategorie",
      tablePurpose: "Zweck",
      tableStorage: "Speicherung",
      tableRequired: "Erforderlich",
      essentialCategory: "Essenziell",
      essentialPurpose: "Einkaufsmarkt, Oberflächensprache und Einwilligungspräferenzen.",
      essentialStorage:
        "Markt- und Sprachpräferenzen in localStorage/Cookies bis zu einem Jahr; Einwilligungspräferenzen (b2b_consent_v4, b2b_consent, b2b_consent_hint) bis zu 180 Tage.",
      essentialRequired: "Ja",
      affiliateCategory: "Affiliate (optional)",
      affiliatePurpose: "Aktiviert ausgehende Händlerlinks; Partner-Shops können eigene Cookies setzen.",
      affiliateStorage: "Drittanbieter auf Händler-Domains, nachdem Sie unsere Seite verlassen.",
      affiliateRequired: "Nein, nur mit Einwilligung",
      analyticsCategory: "Analytics (optional)",
      analyticsPurpose:
        "Für ein mögliches künftiges Analytics-Tool reserviert. Derzeit ist kein Drittanbieter-Analytics auf BeforeToBuy.com aktiv.",
      analyticsStorage:
        "Nur Einwilligungspräferenz (localStorage / Consent-Hint). Kein Analytics-SDK, solange Analytics inaktiv bleibt.",
      analyticsRequired: "Nein, nur mit Einwilligung und standardmäßig deaktiviert",
      processorsTitle: "3. Dienstleister und optionale Drittanbieter",
      processorItems: [
        "Vercel — Hosting, CDN und Server-Logs.",
        "Supabase — Produktkatalog-Datenbank.",
        "Analytics-Tools — derzeit nicht aktiv; die Analytics-Einwilligung ist für ein künftiges optionales Tool reserviert.",
        "Händlerpartner und freigegebene CDN-Bildhosts — Katalogbilder und Affiliate-Tracking auf Händler-Domains nach Verlassen unserer Seite (Affiliate-Links nur mit Einwilligung).",
        "Resend — E-Mail-Zustellung für Kontaktformulare, wenn konfiguriert (sonst Mailto-Fallback).",
      ],
      manageChoicesTitle: "4. Ihre Auswahl verwalten",
      manageChoicesBody:
        "Sie können Ihre Einwilligung jederzeit über das Cookie-Banner oder den Link \"Cookie-Einstellungen\" in der Fußzeile ändern oder widerrufen. Ein Widerruf der Affiliate-Einwilligung blockiert ausgehende Affiliate-Links, bis Sie erneut zustimmen.",
      manageChoicesBody2: "Siehe auch unsere",
    },
    affiliate: {
      metaTitle: "Affiliate-Offenlegung und Transparenz | BeforeToBuy.com",
      metaDescription:
        "Offizielle Affiliate-Offenlegung für BeforeToBuy.com von PortanX - Catalin Portan.",
      stageZeroTitle: "Stage-Zero-Hinweis (Phase: {phase})",
    },
    accessibility: {
      metaTitle: "Erklärung zur Barrierefreiheit | BeforeToBuy.com",
      metaDescription:
        "Erklärung zur Barrierefreiheit für BeforeToBuy.com mit Zielen, bekannten Einschränkungen und Feedback-Kanälen.",
    },
    impressum: {
      metaTitle: "Impressum | BeforeToBuy.com",
      metaDescription:
        "Offizielles Impressum und Unternehmensinformationen für BeforeToBuy.com von PortanX - Catalin Portan.",
      badge: "Rechtliche Hinweise",
      intro: "Offizielle Anbieterangaben nach Schweizer Recht und Art. 3 Abs. 1 lit. s UWG.",
      businessPurposeTitle: "Unternehmenszweck",
      registerPublicationTitle: "Handelsregister-Publikation",
      registerCategoryLabel: "Rubrik",
      subcategoryLabel: "Unterrubrik",
      publicationDateLabel: "Publikationsdatum",
      messageNumberLabel: "Meldungsnummer",
      dailyRegisterLabel: "Tagesregister",
      contactOfficeLabel: "Kontaktstelle",
      publishingOfficeLabel: "Publizierende Stelle",
      disclaimerTitle: "Haftung und Links",
      contentLiabilityTitle: "Haftung für Inhalte",
      contentLiabilityBody:
        "Die Inhalte unserer Seiten erstellen wir mit großer Sorgfalt. Dennoch übernehmen wir keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität, insbesondere bei Produktpreisen und Verfügbarkeiten. Produktionsfeed-, Beispiel- und Demo-Preise sind indikativ; maßgeblich bleibt der Händler-Checkout.",
      linkLiabilityTitle: "Haftung für Links",
      linkLiabilityBody:
        "Unser Angebot enthält Links zu externen Webseiten Dritter, einschließlich Affiliate-Partnern. Auf deren Inhalte haben wir keinen Einfluss; verantwortlich ist stets der jeweilige Anbieter oder Betreiber.",
      copyrightTitle: "Urheberrecht",
      copyrightBody:
        "Die vom Seitenbetreiber erstellten Inhalte und Werke unterliegen dem Schweizer Urheberrecht.",
    },
    transparency: {
      metaTitle: "Plattformhinweise und Transparenz | BeforeToBuy.com",
      metaDescription:
        "Betreiberhinweis, Handelsregisterdaten, Affiliate-Nullaufschlag und Preisverifikation für BeforeToBuy.com.",
      badge: "Transparenz",
      title: "Plattformhinweise",
      intro:
        "Betreiberangaben und kommerzielle Hinweise für Nutzer und Partner-Due-Diligence. Die ausführlichen Rechtsdokumente bleiben im Footer und in der Rechtszentrale verlinkt.",
      operatorNoticeTitle: "Betreiber- und Plattformhinweis",
      operatorNoticeBody:
        "BeforeToBuy.com ist ein Produktpräsentations- und Weiterleitungsdienst ohne Checkout auf dieser Seite. Betrieben wird die Plattform aus der Schweiz von {legalName} (Handelsregister des Kantons Bern, UID: {uid}). Live-Partnerfeeds decken ausgewählte Händler in mehreren Ländern ab; der Katalog kann auch Sample- oder Demo-Angebote enthalten — maßgeblich bleiben die finalen Bedingungen auf der Händlerseite.",
      companyCardTitle: "Unternehmen und Registrierung",
      companyCardBody:
        "Betrieben von {legalName} ({legalForm}). Eingetragen beim {registryOffice} unter Tagesregister-Nr. {dailyRegisterNumber} (SHAB-Meldung {messageNumber}).",
      companyCardLink: "Vollständiges Impressum",
      affiliateCardTitle: "Affiliate-Provision und Nullaufschlag",
      affiliateCardBody:
        "Der Dienst ist für Verbraucher kostenlos. Ein Händler oder ein Netzwerk kann uns aus seinem Marketingbudget eine Vermittlungsprovision zahlen, wir schlagen aber keine BeforeToBuy-Gebühr auf. Der finale Checkout-Preis wird immer vom Händler festgelegt.",
      affiliateCardLink: "Affiliate-Offenlegung",
      priceCardTitle: "Preis- und Verfügbarkeitsprüfung",
      priceCardBody:
        "Einige Preise sind Sample- oder Demo-Daten und spiegeln Live-Händlerfeeds möglicherweise nicht wider. Bestätigen Sie Endpreis, Mehrwertsteuer, Versand, Verfügbarkeit und Lieferbedingungen immer auf der offiziellen Händler-Checkout-Seite.",
      priceCardLink: "Preis-Hinweis",
      legalHubLabel: "Rechtszentrale",
      impressumLabel: "Impressum",
      privacyLabel: "Datenschutz",
      merchantDirectoryLabel: "Händlerverzeichnis",
    },
    disclaimer: {
      metaTitle: "Preis- und Service-Hinweis | BeforeToBuy.com",
      metaDescription:
        "Kommerzieller Hinweis für BeforeToBuy.com zu Preisgenauigkeit, Quellenkennzeichnung, Affiliate-Modell und Händlerverantwortung.",
      badge: "Kommerzieller Hinweis",
      title: "Preis- und Service-Hinweis",
      intro:
        "Wichtige Einschränkungen von BeforeToBuy.com als Preisvergleichsdienst, der zu Händlern weiterleitet. Aktuelle Site-Phase: {phase}.",
      section1Title: "1. Datenquellen und Hybridkatalog",
      section1Body:
        "{platformName} kombiniert Live-Händlerfeeds mit klar gekennzeichneten illustrativen Katalogdaten. Angebote werden als Produktionsfeed, Beispiel oder Demo gekennzeichnet, damit Live-Einträge klar von nicht-live Daten unterschieden werden können.",
      section2Title: "2. Kein bindendes Angebot und keine Gewähr für Preis, Bestand oder Verfügbarkeit",
      section2Body:
        "Informationen auf dieser Seite sind kein bindendes Angebot und kein Preisangebot. Wir gewährleisten weder Richtigkeit noch Vollständigkeit oder Aktualität von Preisen, Lieferzeiten, Lagerstatus oder Gutscheincodes. Maßgeblich bleibt die Händler-Website zum Kaufzeitpunkt.",
      section3Title: "3. Keine Vertragspartei bei Händlergeschäften",
      section3Body:
        "{platformName} ist weder Verkäufer noch Vermittler, Marktplatzbetreiber oder Zahlungsdienstleister. Verträge über Waren und Dienstleistungen kommen ausschließlich zwischen Ihnen und dem Händler zustande. Versand, Zahlung, Rückgabe, Rückerstattung, Gewährleistung und Verbraucherrechte werden vom Händler geregelt.",
      section4Title: "4. Affiliate-Empfehlungsmodell",
      section4Body:
        "Wir vergleichen und leiten weiter. Wenn Sie die Affiliate-Kategorie akzeptieren, kann uns ein Händler oder Netzwerk aus seinem Marketingbudget eine Empfehlungsprovision zahlen. Wir schlagen keine BeforeToBuy-Gebühr auf Ihren Preis auf.",
      section5Title: "5. Ranking der Angebote",
      section5Body:
        "Standardmäßig werden Angebote nach einem indikativen Gesamtwert sortiert, basierend auf den aktuell verfügbaren Informationen. Filter können die Reihenfolge ändern. Bezahlte kommerzielle Platzierung wird derzeit nicht genutzt; falls sie später eingeführt wird, wird sie klar gekennzeichnet.",
      section6Title: "6. Externe Links und Serviceverfügbarkeit",
      section6Body:
        "Ausgehende Links führen zu Drittanbieter-Händlerseiten. Wir sind nicht verantwortlich für deren Inhalte, Preise, Datenschutzpraktiken oder Verfügbarkeit. Als kostenloser Dienst können sich Kataloge und Funktionen ohne Vorankündigung ändern, pausieren oder unvollständig bleiben.",
    },
  },
  fr: {
    common: {
      switzerland: "Suisse",
      liveLabel: "actif",
      plannedLabel: "prévu",
      policyBadge: "Politique",
      backToLegalHub: "Retour au hub juridique",
      policyFallbackTitle: "Politique | BeforeToBuy.com",
      policyFallbackDescription: "Document de politique de BeforeToBuy.com.",
    },
    legalHub: {
      heroBody:
        "Exploité par {legalName} (UID {uid}). Tous les documents publics obligatoires et liens de politique utiles aux audits, partenaires et utilisateurs sont listés ci-dessous.",
      firmDataTitle: "Données de l'entreprise, UID, HR et SHAB",
      registrySummaryTitle: "Résumé de la publication officielle au registre",
      registryPublishingOfficeLabel: "Office de publication",
      registryContactOfficeLabel: "Office du registre",
      cookieSettingsTitle: "Paramètres des cookies",
      cookieSettingsBody:
        "Ouvrez la fenêtre de consentement pour modifier vos préférences Essentiel, Affiliation et Analytics.",
    },
    help: {
      summary:
        "{count} questions sur la comparaison des meilleurs prix, les flux, la transparence de l'affiliation et les conseils d'achat, structurées pour la découverte dans les moteurs de recherche.",
    },
    privacy: {
      processingTitle: "Finalités du traitement et bases juridiques",
      processingBody:
        "La nLPD suisse s'applique à nos traitements en tant que responsable suisse. Lorsque le RGPD s'applique aux visiteurs de l'UE/EEE, vous pouvez également exercer les droits prévus par le RGPD. Ce texte est un document de transparence, pas une certification juridique.",
      transfersTitle: "Transferts internationaux",
      transfersBody:
        "Les prestataires d'hébergement et d'infrastructure (notamment Vercel et Supabase) peuvent traiter des données dans l'UE et/ou d'autres pays, y compris les États-Unis. Des outils optionnels tels que Datadog ou Resend ne sont utilisés que s'ils sont configurés et, le cas échéant, uniquement avec consentement. Les mécanismes contractuels ou de transfert prévus par ces prestataires peuvent s'appliquer.",
      complaintBody:
        "Vous pouvez également déposer une plainte auprès du Préposé fédéral à la protection des données et à la transparence (PFPDT / FDPIC) :",
    },
    terms: {
      userDutiesTitle: "4. Obligations de l'utilisateur",
      userDutiesItems: [
        "Utiliser le service uniquement à des fins légales et personnelles de comparaison de prix.",
        "Ne pas scraper, surcharger ou détourner nos API ou pages catalogue.",
        "Ne pas contourner les mécanismes de consentement, d'anti-abus ou de limitation de débit.",
        "Respecter notre politique de confidentialité et notre politique de cookies lors de l'utilisation de fonctions optionnelles.",
      ],
      liabilityTitle: "5. Responsabilité et disponibilité (service gratuit d'information)",
      liabilityBody:
        "{platformName} est un service gratuit d'information et de redirection. Nous ne garantissons pas que les catalogues, prix ou disponibilités soient complets, à jour ou exempts d'erreurs. Dans la mesure permise par le droit suisse, nous ne sommes pas responsables des dommages indirects ou consécutifs liés à l'utilisation du service ou à la confiance accordée aux informations affichées, sauf en cas d'intention illicite ou de négligence grave lorsque la responsabilité ne peut être exclue. Le contenu marchand et les conditions de checkout restent de la responsabilité du marchand. Le service peut évoluer, être suspendu ou afficher des données incomplètes sans préavis.",
      liabilityBody2:
        "Classement : les offres sont triées par défaut selon un total indicatif ; les filtres peuvent modifier l'ordre. Aucun placement payant n'est actuellement utilisé ; s'il est introduit plus tard, il sera signalé. Détails :",
      intellectualPropertyTitle: "6. Propriété intellectuelle et marques de tiers",
      intellectualPropertyBody:
        "Les contenus, marques et logiciels sur {platformName} sont protégés par le droit d'auteur. Les images produit et les marques restent la propriété de leurs ayants droit et ne sont affichées qu'à des fins d'identification, sans implication de soutien ou de partenariat sauf mention expresse. Les liens sortants mènent vers des contenus tiers.",
      governingLawTitle: "7. Droit applicable et juridiction",
      governingLawBody:
        "Le droit suisse s'applique exclusivement. Le for exclusif est à Berne, Suisse. Les règles impératives de protection des consommateurs de votre pays de résidence, en particulier dans l'UE/EEE, restent applicables lorsque cela est requis.",
      changesContactTitle: "8. Mises à jour et contact",
      changesContactBody:
        "Nous pouvons mettre à jour ces conditions si nécessaire. Réclamations : {complaintsLabel}. Contact : {email}.",
    },
    cookies: {
      metaTitle: "Politique de cookies | BeforeToBuy.com",
      metaDescription:
        "Comment BeforeToBuy.com utilise les cookies, le stockage local et des technologies similaires.",
      badge: "Politique de cookies",
      title: "Politique de cookies et de stockage",
      intro:
        "Dernière mise à jour : août 2026. Cette page explique comment BeforeToBuy.com mémorise vos choix de consentement et à quel moment les technologies optionnelles sont activées.",
      whatWeUseTitle: "1. Ce que nous utilisons",
      whatWeUseBody:
        "BeforeToBuy.com est un service de comparaison de prix. Nous n'utilisons pas de cookies publicitaires sur notre domaine. Nous utilisons le stockage local du navigateur pour retenir vos choix et un cookie essentiel HttpOnly signé pour enregistrer le consentement Affiliation côté serveur. Les liens affiliés restent bloqués jusqu'au consentement Affiliation. Les images produit approuvées des marchands/CDN peuvent se charger comme fonction essentielle du catalogue et recevoir l'adresse IP, l'user-agent et des métadonnées techniques.",
      categoriesTitle: "2. Catégories",
      tableCategory: "Catégorie",
      tablePurpose: "Finalité",
      tableStorage: "Stockage",
      tableRequired: "Obligatoire",
      essentialCategory: "Essentiel",
      essentialPurpose: "Marché d'achat, langue de l'interface et préférences de consentement.",
      essentialStorage:
        "Préférences de marché et de langue dans localStorage/cookies jusqu'à un an ; préférences de consentement (b2b_consent_v4, b2b_consent, b2b_consent_hint) jusqu'à 180 jours.",
      essentialRequired: "Oui",
      affiliateCategory: "Affiliation (optionnel)",
      affiliatePurpose: "Active les liens sortants vers les marchands ; les boutiques partenaires peuvent déposer leurs propres cookies.",
      affiliateStorage: "Tiers sur les domaines marchands après avoir quitté notre site.",
      affiliateRequired: "Non, uniquement avec consentement",
      analyticsCategory: "Analytics (optionnel)",
      analyticsPurpose:
        "Réservée à un éventuel outil analytics futur. Aucun produit analytics tiers n'est actuellement actif sur BeforeToBuy.com.",
      analyticsStorage:
        "Préférence de consentement uniquement (localStorage / indicateur). Aucun SDK analytics n'est chargé tant que les outils restent inactifs.",
      analyticsRequired: "Non, uniquement avec consentement et désactivé par défaut",
      processorsTitle: "3. Prestataires et tiers optionnels",
      processorItems: [
        "Vercel — hébergement, CDN et journaux serveur.",
        "Supabase — base de données du catalogue produit.",
        "Outils analytics — actuellement inactifs ; la catégorie Analytics est réservée à un outil optionnel futur.",
        "Partenaires marchands et hôtes d'images CDN approuvés — images catalogue et suivi d'affiliation sur les domaines marchands après avoir quitté notre site (liens affiliés uniquement avec consentement).",
        "Resend — envoi des e-mails du formulaire de contact lorsqu'il est configuré (sinon repli mailto).",
      ],
      manageChoicesTitle: "4. Gérer vos choix",
      manageChoicesBody:
        "Vous pouvez modifier ou retirer votre consentement à tout moment via la bannière cookies ou le lien \"Paramètres des cookies\" dans le pied de page. Le retrait du consentement Affiliation bloque les liens affiliés sortants jusqu'à une nouvelle acceptation.",
      manageChoicesBody2: "Voir aussi notre",
    },
    affiliate: {
      metaTitle: "Déclaration d'affiliation et de transparence | BeforeToBuy.com",
      metaDescription:
        "Déclaration officielle d'affiliation pour BeforeToBuy.com exploité par PortanX - Catalin Portan.",
      stageZeroTitle: "Avis phase zéro (phase : {phase})",
    },
    accessibility: {
      metaTitle: "Déclaration d'accessibilité | BeforeToBuy.com",
      metaDescription:
        "Déclaration d'accessibilité pour BeforeToBuy.com avec objectifs, limites connues et moyens de retour.",
    },
    impressum: {
      metaTitle: "Impressum | BeforeToBuy.com",
      metaDescription:
        "Impressum officiel et informations société pour BeforeToBuy.com exploité par PortanX - Catalin Portan.",
      badge: "Mentions légales",
      intro: "Informations officielles sur le fournisseur selon le droit suisse et l'art. 3 al. 1 let. s UWG.",
      businessPurposeTitle: "Objet de l'entreprise",
      registerPublicationTitle: "Publication au registre du commerce",
      registerCategoryLabel: "Rubrique",
      subcategoryLabel: "Sous-rubrique",
      publicationDateLabel: "Date de publication",
      messageNumberLabel: "Numéro de message",
      dailyRegisterLabel: "Registre journalier",
      contactOfficeLabel: "Office du registre",
      publishingOfficeLabel: "Office de publication",
      disclaimerTitle: "Responsabilité et liens",
      contentLiabilityTitle: "Responsabilité du contenu",
      contentLiabilityBody:
        "Nous préparons le contenu de nos pages avec soin. Nous ne garantissons toutefois ni l'exactitude, ni l'exhaustivité, ni l'actualité, notamment pour les prix et disponibilités des produits. Les prix de flux de production, d'échantillon et de démo sont indicatifs ; le checkout du marchand fait foi.",
      linkLiabilityTitle: "Responsabilité des liens",
      linkLiabilityBody:
        "Notre site contient des liens vers des sites tiers externes, y compris des partenaires d'affiliation. Nous n'avons aucun contrôle sur leur contenu ; le fournisseur ou l'exploitant concerné en reste responsable.",
      copyrightTitle: "Droit d'auteur",
      copyrightBody:
        "Les contenus et œuvres créés par l'exploitant du site sont soumis au droit d'auteur suisse.",
    },
    transparency: {
      metaTitle: "Avis de plateforme et transparence | BeforeToBuy.com",
      metaDescription:
        "Avis opérateur, immatriculation, affiliation sans surcoût et vérification des prix pour BeforeToBuy.com.",
      badge: "Transparence",
      title: "Avis de plateforme",
      intro:
        "Informations sur l'opérateur et notices commerciales pour les utilisateurs et la diligence des partenaires. Les documents juridiques détaillés restent accessibles depuis le hub juridique et le pied de page.",
      operatorNoticeTitle: "Avis sur l'opérateur et la plateforme",
      operatorNoticeBody:
        "BeforeToBuy.com est un service de présentation de produits et de redirection, sans checkout sur ce site. La plateforme est exploitée depuis la Suisse par {legalName} (registre du commerce du canton de Berne, UID : {uid}). Des flux partenaires live couvrent des marchands sélectionnés dans plusieurs pays ; le catalogue peut aussi inclure des offres sample ou démo — confirmez toujours les conditions finales chez le marchand.",
      companyCardTitle: "Entité et immatriculation",
      companyCardBody:
        "Exploité par {legalName} ({legalForm}). Enregistré auprès du {registryOffice} sous le numéro de registre journalier {dailyRegisterNumber} (publication SHAB {messageNumber}).",
      companyCardLink: "Impressum complet",
      affiliateCardTitle: "Commission d'affiliation et absence de surcoût",
      affiliateCardBody:
        "Le service est gratuit pour les consommateurs. Un marchand ou un réseau peut nous verser une commission d'apport issue de son budget marketing, mais nous n'ajoutons pas de frais BeforeToBuy. Le prix final au checkout est toujours fixé par le marchand.",
      affiliateCardLink: "Déclaration d'affiliation",
      priceCardTitle: "Vérification des prix et disponibilités",
      priceCardBody:
        "Certains prix sont des données d'échantillon ou de démo et peuvent ne pas refléter les flux marchands en direct. Vérifiez toujours le prix final, la TVA, les frais de livraison, la disponibilité et les conditions de livraison sur la page officielle de checkout du marchand.",
      priceCardLink: "Avertissement prix",
      legalHubLabel: "Hub juridique",
      impressumLabel: "Impressum",
      privacyLabel: "Confidentialité",
      merchantDirectoryLabel: "Annuaire marchands",
    },
    disclaimer: {
      metaTitle: "Avertissement prix et service | BeforeToBuy.com",
      metaDescription:
        "Avertissement commercial pour BeforeToBuy.com sur l'exactitude des prix, les libellés de source, le modèle d'affiliation et la responsabilité du marchand.",
      badge: "Avertissement commercial",
      title: "Avertissement prix et service",
      intro:
        "Limites importantes de BeforeToBuy.com en tant que service de comparaison de prix qui redirige vers les marchands. Phase actuelle du site : {phase}.",
      section1Title: "1. Sources de données et catalogue hybride",
      section1Body:
        "{platformName} combine des flux marchands live avec des données de catalogue illustratives clairement identifiées. Les offres sont étiquetées Production feed, Sample ou Demo afin de distinguer clairement les entrées live des données non live.",
      section2Title: "2. Aucune offre ferme et aucune garantie de prix, stock ou disponibilité",
      section2Body:
        "Les informations figurant sur ce site ne constituent ni une offre ferme ni un devis. Nous ne garantissons ni l'exactitude, ni l'exhaustivité, ni l'actualité des prix, délais de livraison, états de stock ou codes promo. Le site marchand reste la source faisant foi au moment de l'achat.",
      section3Title: "3. Nous ne sommes pas partie aux transactions marchandes",
      section3Body:
        "{platformName} n'est ni vendeur, ni courtier, ni opérateur de marketplace, ni prestataire de paiement. Les contrats relatifs aux biens et services sont conclus exclusivement entre vous et le marchand. L'expédition, le paiement, les retours, remboursements, garanties et droits consommateurs sont gérés par le marchand.",
      section4Title: "4. Modèle de recommandation affiliée",
      section4Body:
        "Nous comparons et redirigeons. Si vous acceptez la catégorie Affiliation, un marchand ou un réseau peut nous verser une commission d'apport depuis son budget marketing. Nous n'ajoutons pas de frais BeforeToBuy à votre prix.",
      section5Title: "5. Classement des offres",
      section5Body:
        "Par défaut, les offres sont triées selon un total indicatif basé sur les informations disponibles. Les filtres peuvent modifier l'ordre. Aucun placement commercial payant n'est actuellement utilisé ; s'il est introduit plus tard, il sera clairement signalé.",
      section6Title: "6. Liens externes et disponibilité du service",
      section6Body:
        "Les liens sortants mènent vers des sites marchands tiers. Nous ne sommes pas responsables de leur contenu, de leurs prix, de leurs pratiques de confidentialité ou de leur disponibilité. En tant que service gratuit, les catalogues et fonctionnalités peuvent évoluer, être suspendus ou rester incomplets sans préavis.",
    },
  },
  it: {
    common: {
      switzerland: "Svizzera",
      liveLabel: "live",
      plannedLabel: "pianificato",
      policyBadge: "Policy",
      backToLegalHub: "Torna all'hub legale",
      policyFallbackTitle: "Policy | BeforeToBuy.com",
      policyFallbackDescription: "Documento di policy di BeforeToBuy.com.",
    },
    legalHub: {
      heroBody:
        "Gestito da {legalName} (UID {uid}). Tutti i documenti pubblici obbligatori e i link alle policy per audit, partner e utenti sono elencati qui sotto.",
      firmDataTitle: "Dati aziendali, UID, HR e SHAB",
      registrySummaryTitle: "Riepilogo della pubblicazione ufficiale nel registro",
      registryPublishingOfficeLabel: "Ufficio pubblicante",
      registryContactOfficeLabel: "Ufficio del registro",
      cookieSettingsTitle: "Impostazioni cookie",
      cookieSettingsBody:
        "Apri il pannello di consenso per modificare le preferenze Essenziali, Affiliazione e Analytics.",
    },
    help: {
      summary:
        "{count} domande su confronto del prezzo più basso, feed, trasparenza affiliate e consigli di acquisto, strutturate per la scoperta nei motori di ricerca.",
    },
    privacy: {
      processingTitle: "Finalità del trattamento e basi giuridiche",
      processingBody:
        "La nLPD svizzera si applica ai nostri trattamenti come titolare svizzero. Quando il GDPR UE si applica ai visitatori nell'UE/SEE, puoi esercitare anche i diritti previsti dal GDPR. Questa informativa è un documento di trasparenza, non una certificazione legale.",
      transfersTitle: "Trasferimenti internazionali",
      transfersBody:
        "I fornitori di hosting e infrastruttura (in particolare Vercel e Supabase) possono trattare dati nell'UE e/o in altri Paesi, inclusi gli Stati Uniti. Strumenti opzionali come Datadog o Resend sono usati solo se configurati e, ove richiesto, solo con consenso. Possono applicarsi i meccanismi contrattuali o di trasferimento previsti da tali fornitori.",
      complaintBody:
        "Puoi anche presentare un reclamo all'Incaricato federale della protezione dei dati e della trasparenza (FDPIC / EDOB):",
    },
    terms: {
      userDutiesTitle: "4. Obblighi dell'utente",
      userDutiesItems: [
        "Usare il servizio solo per finalità lecite e personali di confronto prezzi.",
        "Non effettuare scraping, sovraccaricare o abusare delle nostre API o pagine catalogo.",
        "Non aggirare i meccanismi di consenso, anti-abuso o rate limit.",
        "Rispettare la nostra Informativa privacy e la Cookie Policy quando si usano funzioni opzionali.",
      ],
      liabilityTitle: "5. Responsabilità e disponibilità (servizio informativo gratuito)",
      liabilityBody:
        "{platformName} è un servizio gratuito di informazione e reindirizzamento. Non garantiamo che cataloghi, prezzi o disponibilità siano completi, aggiornati o privi di errori. Nei limiti consentiti dal diritto svizzero, non siamo responsabili per danni indiretti o consequenziali derivanti dall'uso del servizio o dall'affidamento sulle informazioni mostrate, salvo dolo o colpa grave quando la responsabilità non può essere esclusa. I contenuti del merchant e le condizioni di checkout restano responsabilità del merchant. Il servizio può cambiare, interrompersi o mostrare dati incompleti senza preavviso.",
      liabilityBody2:
        "Classifica: le offerte sono ordinate di default per totale indicativo; i filtri possono cambiare l'ordine. Il posizionamento a pagamento non è attualmente usato; se verrà introdotto in futuro sarà etichettato. Dettagli:",
      intellectualPropertyTitle: "6. Proprietà intellettuale e marchi di terzi",
      intellectualPropertyBody:
        "Contenuti, marchi e software su {platformName} sono protetti dal diritto d'autore. Immagini prodotto e marchi restano di proprietà dei rispettivi titolari e sono mostrati solo a fini identificativi, senza implicare endorsement o partnership salvo indicazione espressa. I link in uscita portano a contenuti di terzi.",
      governingLawTitle: "7. Legge applicabile e foro",
      governingLawBody:
        "Si applica esclusivamente il diritto svizzero. Il foro esclusivo è Berna, Svizzera. Restano salve, ove applicabili, le norme imperative di tutela del consumatore del tuo Paese di residenza, in particolare nell'UE/SEE.",
      changesContactTitle: "8. Aggiornamenti e contatti",
      changesContactBody:
        "Possiamo aggiornare questi termini quando necessario. Reclami: {complaintsLabel}. Contatto: {email}.",
    },
    cookies: {
      metaTitle: "Informativa sui cookie | BeforeToBuy.com",
      metaDescription:
        "Come BeforeToBuy.com utilizza cookie, storage locale e tecnologie simili.",
      badge: "Informativa sui cookie",
      title: "Politica su cookie e storage",
      intro:
        "Ultimo aggiornamento: agosto 2026. Questa pagina spiega come BeforeToBuy.com memorizza le scelte di consenso e quando entrano in funzione le tecnologie opzionali.",
      whatWeUseTitle: "1. Cosa utilizziamo",
      whatWeUseBody:
        "BeforeToBuy.com è un servizio di confronto prezzi. Non utilizziamo cookie pubblicitari sul nostro dominio. Usiamo lo storage locale del browser per ricordare le tue scelte e un cookie essenziale HttpOnly firmato per registrare il consenso Affiliazione lato server. I link affiliati restano bloccati fino al consenso Affiliazione. Le immagini prodotto approvate di merchant/CDN possono caricarsi come funzione essenziale del catalogo e ricevere IP, user-agent e metadati tecnici.",
      categoriesTitle: "2. Categorie",
      tableCategory: "Categoria",
      tablePurpose: "Finalità",
      tableStorage: "Conservazione",
      tableRequired: "Necessario",
      essentialCategory: "Essenziale",
      essentialPurpose: "Mercato di acquisto, lingua dell'interfaccia e preferenze di consenso.",
      essentialStorage:
        "Preferenze di mercato e lingua in localStorage/cookie fino a un anno; preferenze di consenso (b2b_consent_v4, b2b_consent, b2b_consent_hint) fino a 180 giorni.",
      essentialRequired: "Sì",
      affiliateCategory: "Affiliazione (opzionale)",
      affiliatePurpose: "Abilita i link in uscita verso i merchant; i partner possono impostare i propri cookie.",
      affiliateStorage: "Terze parti sui domini merchant dopo aver lasciato il nostro sito.",
      affiliateRequired: "No, solo con consenso",
      analyticsCategory: "Analytics (opzionale)",
      analyticsPurpose:
        "Riservata a un possibile strumento analytics futuro. Nessun prodotto analytics di terze parti è attualmente attivo su BeforeToBuy.com.",
      analyticsStorage:
        "Solo preferenza di consenso (localStorage / hint). Nessun SDK analytics viene caricato mentre gli strumenti restano inattivi.",
      analyticsRequired: "No, solo con consenso e disattivato di default",
      processorsTitle: "3. Fornitori di servizi e terze parti opzionali",
      processorItems: [
        "Vercel — hosting, CDN e log server.",
        "Supabase — database del catalogo prodotti.",
        "Strumenti analytics — attualmente non attivi; la categoria Analytics è riservata a un futuro strumento opzionale.",
        "Partner merchant e host immagini CDN approvati — immagini catalogo e tracking affiliato sui domini merchant dopo aver lasciato il sito (link affiliati solo con consenso).",
        "Resend — consegna email del modulo di contatto quando configurata (altrimenti fallback mailto).",
      ],
      manageChoicesTitle: "4. Gestisci le tue scelte",
      manageChoicesBody:
        "Puoi modificare o revocare il consenso in qualsiasi momento tramite il banner cookie o il link \"Impostazioni cookie\" nel footer. La revoca del consenso Affiliazione blocca i link affiliati in uscita finché non accetti di nuovo.",
      manageChoicesBody2: "Vedi anche la nostra",
    },
    affiliate: {
      metaTitle: "Dichiarazione di affiliazione e trasparenza | BeforeToBuy.com",
      metaDescription:
        "Dichiarazione ufficiale di affiliazione per BeforeToBuy.com gestito da PortanX - Catalin Portan.",
      stageZeroTitle: "Avviso stage-zero (fase: {phase})",
    },
    accessibility: {
      metaTitle: "Dichiarazione di accessibilità | BeforeToBuy.com",
      metaDescription:
        "Dichiarazione di accessibilità per BeforeToBuy.com con obiettivi, limiti noti e canali di feedback.",
    },
    impressum: {
      metaTitle: "Impressum | BeforeToBuy.com",
      metaDescription:
        "Impressum ufficiale e informazioni aziendali per BeforeToBuy.com gestito da PortanX - Catalin Portan.",
      badge: "Avviso legale",
      intro: "Informazioni ufficiali sul fornitore ai sensi del diritto svizzero e dell'art. 3 cpv. 1 lett. s UWG.",
      businessPurposeTitle: "Oggetto aziendale",
      registerPublicationTitle: "Pubblicazione del registro di commercio",
      registerCategoryLabel: "Categoria",
      subcategoryLabel: "Sottocategoria",
      publicationDateLabel: "Data di pubblicazione",
      messageNumberLabel: "Numero di messaggio",
      dailyRegisterLabel: "Registro giornaliero",
      contactOfficeLabel: "Ufficio del registro",
      publishingOfficeLabel: "Ufficio pubblicante",
      disclaimerTitle: "Responsabilità e link",
      contentLiabilityTitle: "Responsabilità per i contenuti",
      contentLiabilityBody:
        "Prepariamo i contenuti delle nostre pagine con grande cura. Tuttavia non garantiamo accuratezza, completezza o attualità, soprattutto per prezzi e disponibilità dei prodotti. I prezzi da production feed, sample e demo sono indicativi; fa fede il checkout del merchant.",
      linkLiabilityTitle: "Responsabilità per i link",
      linkLiabilityBody:
        "Il nostro sito contiene link a siti esterni di terzi, inclusi partner affiliati. Non abbiamo alcun controllo sui loro contenuti; il relativo fornitore o gestore resta responsabile.",
      copyrightTitle: "Diritto d'autore",
      copyrightBody:
        "I contenuti e le opere creati dal gestore del sito sono soggetti al diritto d'autore svizzero.",
    },
    transparency: {
      metaTitle: "Avvisi piattaforma e trasparenza | BeforeToBuy.com",
      metaDescription:
        "Avviso operatore, registrazione aziendale, affiliazione senza ricarico e verifica prezzi per BeforeToBuy.com.",
      badge: "Trasparenza",
      title: "Avvisi della piattaforma",
      intro:
        "Dettagli sull'operatore e avvisi commerciali per utenti e diligence dei partner. I documenti legali dedicati restano accessibili dall'hub legale e dal footer.",
      operatorNoticeTitle: "Avviso su operatore e piattaforma",
      operatorNoticeBody:
        "BeforeToBuy.com è un servizio di presentazione prodotti e reindirizzamento senza checkout su questo sito. La piattaforma è gestita dalla Svizzera da {legalName} (registro di commercio del Canton Berna, UID: {uid}). Feed partner live coprono merchant selezionati in più paesi; il catalogo può anche includere offerte sample o demo — conferma sempre le condizioni finali sul sito del merchant.",
      companyCardTitle: "Entità e registrazione",
      companyCardBody:
        "Gestito da {legalName} ({legalForm}). Registrato presso {registryOffice} con numero di registro giornaliero {dailyRegisterNumber} (pubblicazione SHAB {messageNumber}).",
      companyCardLink: "Impressum completo",
      affiliateCardTitle: "Commissioni affiliate e zero ricarico",
      affiliateCardBody:
        "Il servizio è gratuito per i consumatori. Un merchant o una rete può pagarci una commissione di segnalazione dal proprio budget marketing, ma non aggiungiamo una commissione BeforeToBuy. Il prezzo finale al checkout è sempre deciso dal merchant.",
      affiliateCardLink: "Dichiarazione di affiliazione",
      priceCardTitle: "Verifica di prezzo e disponibilità",
      priceCardBody:
        "Alcuni prezzi sono dati sample o demo e potrebbero non riflettere feed merchant live. Verifica sempre prezzo finale, IVA, spedizione, disponibilità e condizioni di consegna nella pagina ufficiale di checkout del merchant.",
      priceCardLink: "Avviso prezzi",
      legalHubLabel: "Hub legale",
      impressumLabel: "Impressum",
      privacyLabel: "Privacy",
      merchantDirectoryLabel: "Directory merchant",
    },
    disclaimer: {
      metaTitle: "Dichiarazione su prezzi e servizio | BeforeToBuy.com",
      metaDescription:
        "Dichiarazione commerciale per BeforeToBuy.com su accuratezza dei prezzi, etichette delle fonti, modello affiliate e responsabilità del merchant.",
      badge: "Dichiarazione commerciale",
      title: "Dichiarazione su prezzi e servizio",
      intro:
        "Limitazioni importanti di BeforeToBuy.com come servizio di confronto prezzi che reindirizza ai merchant. Fase attuale del sito: {phase}.",
      section1Title: "1. Fonti dei dati e catalogo ibrido",
      section1Body:
        "{platformName} combina feed merchant live con dati catalogo illustrativi chiaramente identificati. Le offerte sono etichettate Production feed, Sample o Demo per distinguere chiaramente le voci live da quelle non live.",
      section2Title: "2. Nessuna offerta vincolante e nessuna garanzia su prezzo, stock o disponibilità",
      section2Body:
        "Le informazioni su questo sito non costituiscono un'offerta vincolante né un preventivo. Non garantiamo accuratezza, completezza o aggiornamento di prezzi, tempi di consegna, stato stock o codici sconto. Fa fede il sito del merchant al momento dell'acquisto.",
      section3Title: "3. Non siamo parte delle transazioni del merchant",
      section3Body:
        "{platformName} non è venditore, broker, operatore marketplace né processore di pagamenti. I contratti per beni e servizi sono conclusi esclusivamente tra te e il merchant. Spedizione, pagamento, resi, rimborsi, garanzia e diritti del consumatore sono gestiti dal merchant.",
      section4Title: "4. Modello di referral affiliato",
      section4Body:
        "Noi confrontiamo e reindirizziamo. Se accetti la categoria Affiliazione, un merchant o una rete può pagarci una commissione di referral dal proprio budget marketing. Non aggiungiamo una commissione BeforeToBuy al tuo prezzo.",
      section5Title: "5. Ordinamento delle offerte",
      section5Body:
        "Per impostazione predefinita, le offerte sono ordinate in base a un totale indicativo costruito con le informazioni disponibili. I filtri possono cambiare l'ordine. Il posizionamento commerciale a pagamento non viene attualmente usato; se verrà introdotto in futuro sarà chiaramente etichettato.",
      section6Title: "6. Link esterni e disponibilità del servizio",
      section6Body:
        "I link in uscita portano a siti merchant di terzi. Non siamo responsabili dei loro contenuti, prezzi, pratiche privacy o disponibilità. Essendo un servizio gratuito, cataloghi e funzionalità possono cambiare, essere sospesi o restare incompleti senza preavviso.",
    },
  },
  ro: {
    common: {
      switzerland: "Elveția",
      liveLabel: "live",
      plannedLabel: "planificat",
      policyBadge: "Politică",
      backToLegalHub: "Înapoi la centrul legal",
      policyFallbackTitle: "Politică | BeforeToBuy.com",
      policyFallbackDescription: "Document de politică BeforeToBuy.com.",
    },
    legalHub: {
      heroBody:
        "Operat de {legalName} (UID {uid}). Toate documentele publice obligatorii și linkurile către politici pentru audit, parteneri și utilizatori sunt listate mai jos.",
      firmDataTitle: "Date companie, UID, HR și SHAB",
      registrySummaryTitle: "Rezumatul publicării oficiale din registru",
      registryPublishingOfficeLabel: "Oficiul publicator",
      registryContactOfficeLabel: "Oficiul registrului",
      cookieSettingsTitle: "Setări cookie",
      cookieSettingsBody:
        "Deschideți dialogul de consimțământ pentru a schimba preferințele Esențial, Afiliat și Analytics.",
    },
    help: {
      summary:
        "{count} întrebări despre comparația celui mai bun preț, feed-uri, transparența afiliată și sfaturi de cumpărături, structurate pentru descoperire în motoarele de căutare.",
    },
    privacy: {
      processingTitle: "Scopurile prelucrării și temeiurile legale",
      processingBody:
        "nDSG elvețian se aplică prelucrărilor noastre în calitate de operator elvețian. Acolo unde GDPR UE se aplică vizitatorilor din UE/SEE, puteți exercita și drepturile prevăzute de GDPR. Acest text este un document de transparență, nu o certificare juridică.",
      transfersTitle: "Transferuri internaționale",
      transfersBody:
        "Furnizorii de hosting și infrastructură (în special Vercel și Supabase) pot prelucra date în UE și/sau în alte țări, inclusiv Statele Unite. Instrumente opționale precum Datadog sau Resend sunt folosite doar dacă sunt configurate și, unde este necesar, doar cu consimțământ. Pot fi aplicate mecanismele contractuale sau de transfer prevăzute de acești furnizori.",
      complaintBody:
        "Puteți depune o plângere și la Autoritatea Federală Elvețiană pentru Protecția Datelor și Transparență (FDPIC / EDOB):",
    },
    terms: {
      userDutiesTitle: "4. Obligațiile utilizatorului",
      userDutiesItems: [
        "Folosiți serviciul doar în scopuri legale și personale de comparare a prețurilor.",
        "Nu faceți scraping, nu supraîncărcați și nu abuzați API-urile sau paginile noastre de catalog.",
        "Nu ocoliți mecanismele de consimțământ, anti-abuz sau rate limit.",
        "Respectați Politica de confidențialitate și Politica de cookie-uri când folosiți funcții opționale.",
      ],
      liabilityTitle: "5. Răspundere și disponibilitate (serviciu informativ gratuit)",
      liabilityBody:
        "{platformName} este un serviciu gratuit de informare și redirecționare. Nu garantăm că listele, prețurile sau disponibilitățile sunt complete, actuale sau fără erori. În măsura permisă de legea elvețiană, nu răspundem pentru daune indirecte sau consecutive rezultate din utilizarea serviciului ori din încrederea acordată informațiilor afișate, cu excepția cazurilor de intenție ilicită sau neglijență gravă acolo unde răspunderea nu poate fi exclusă. Conținutul comerciantului și termenii de checkout rămân responsabilitatea comerciantului. Serviciul se poate schimba, opri temporar sau poate afișa date incomplete fără notificare.",
      liabilityBody2:
        "Clasare: ofertele sunt sortate implicit după un total orientativ, iar filtrele pot schimba ordinea. Plasarea comercială plătită nu este folosită în prezent; dacă va fi introdusă ulterior, va fi etichetată. Detalii:",
      intellectualPropertyTitle: "6. Proprietate intelectuală și mărci terțe",
      intellectualPropertyBody:
        "Conținutul, mărcile și software-ul de pe {platformName} sunt protejate prin drepturi de autor. Imaginile produselor și mărcile rămân proprietatea titularilor lor și sunt afișate doar pentru identificare, fără a implica susținere sau parteneriat dacă acest lucru nu este menționat explicit. Linkurile externe duc către conținut terț.",
      governingLawTitle: "7. Legea aplicabilă și jurisdicția",
      governingLawBody:
        "Se aplică exclusiv legea elvețiană. Instanța competentă exclusivă este Berna, Elveția. Normele obligatorii de protecție a consumatorului din țara dvs. de reședință, în special în UE/SEE, rămân neafectate acolo unde sunt aplicabile.",
      changesContactTitle: "8. Actualizări și contact",
      changesContactBody:
        "Putem actualiza acești termeni atunci când este necesar. Plângeri: {complaintsLabel}. Contact: {email}.",
    },
    cookies: {
      metaTitle: "Politica de cookie-uri | BeforeToBuy.com",
      metaDescription:
        "Cum folosește BeforeToBuy.com cookie-uri, stocare locală și tehnologii similare.",
      badge: "Politica de cookie-uri",
      title: "Politica privind cookie-urile și stocarea",
      intro:
        "Ultima actualizare: august 2026. Această pagină explică modul în care BeforeToBuy.com memorează alegerile de consimțământ și când rulează tehnologiile opționale.",
      whatWeUseTitle: "1. Ce folosim",
      whatWeUseBody:
        "BeforeToBuy.com este un serviciu de comparare a prețurilor. Nu rulăm cookie-uri de publicitate pe domeniul nostru. Folosim stocarea locală a browserului pentru a vă reține alegerile și un cookie esențial HttpOnly semnat pentru a înregistra pe server consimțământul Afiliat. Linkurile afiliate rămân blocate până la acordarea consimțământului Afiliat. Imaginile aprobate ale comercianților/CDN-urilor se pot încărca ca funcție esențială a catalogului și pot primi IP, user-agent și metadate tehnice.",
      categoriesTitle: "2. Categorii",
      tableCategory: "Categorie",
      tablePurpose: "Scop",
      tableStorage: "Stocare",
      tableRequired: "Necesar",
      essentialCategory: "Esențial",
      essentialPurpose: "Piața de cumpărături, limba interfeței și preferințele de consimțământ.",
      essentialStorage:
        "Preferințele de piață și limbă în localStorage/cookie-uri până la un an; preferințele de consimțământ (b2b_consent_v4, b2b_consent, b2b_consent_hint) până la 180 de zile.",
      essentialRequired: "Da",
      affiliateCategory: "Afiliat (opțional)",
      affiliatePurpose: "Permite linkurile externe către comercianți; magazinele partenere își pot seta propriile cookie-uri.",
      affiliateStorage: "Terți pe domeniile comercianților după ce părăsiți site-ul nostru.",
      affiliateRequired: "Nu, doar cu consimțământ",
      analyticsCategory: "Analytics (opțional)",
      analyticsPurpose:
        "Rezervată pentru un posibil instrument analytics viitor. Momentan nu rulează niciun produs analytics terț pe BeforeToBuy.com.",
      analyticsStorage:
        "Doar preferința de consimțământ (localStorage / hint). Niciun SDK analytics nu este încărcat cât timp instrumentele rămân inactive.",
      analyticsRequired: "Nu, doar cu consimțământ și dezactivat implicit",
      processorsTitle: "3. Furnizori de servicii și terți opționali",
      processorItems: [
        "Vercel — hosting, CDN și log-uri server.",
        "Supabase — baza de date a catalogului de produse.",
        "Instrumente analytics — momentan inactive; categoria Analytics este rezervată pentru un instrument opțional viitor.",
        "Parteneri comercianți și host-uri CDN de imagini aprobate — imagini de catalog și tracking afiliat pe domeniile comercianților după ce părăsiți site-ul (linkuri afiliate doar cu consimțământ).",
        "Resend — livrarea emailurilor din formularul de contact când este configurată (altfel fallback mailto).",
      ],
      manageChoicesTitle: "4. Gestionarea alegerilor",
      manageChoicesBody:
        "Puteți modifica sau retrage consimțământul în orice moment folosind bannerul cookie sau linkul \"Setări cookie\" din subsol. Retragerea consimțământului Afiliat blochează linkurile afiliate externe până când acceptați din nou.",
      manageChoicesBody2: "Consultați și",
    },
    affiliate: {
      metaTitle: "Declarație de afiliere și transparență | BeforeToBuy.com",
      metaDescription:
        "Declarație oficială de afiliere pentru BeforeToBuy.com operat de PortanX - Catalin Portan.",
      stageZeroTitle: "Notificare stage-zero (fază: {phase})",
    },
    accessibility: {
      metaTitle: "Declarație de accesibilitate | BeforeToBuy.com",
      metaDescription:
        "Declarație de accesibilitate pentru BeforeToBuy.com cu obiective, limitări cunoscute și canale de feedback.",
    },
    impressum: {
      metaTitle: "Impressum | BeforeToBuy.com",
      metaDescription:
        "Impressum oficial și informații despre companie pentru BeforeToBuy.com operat de PortanX - Catalin Portan.",
      badge: "Notificare legală",
      intro: "Informații oficiale despre furnizor conform dreptului elvețian și art. 3 alin. 1 lit. s UWG.",
      businessPurposeTitle: "Obiectul de activitate",
      registerPublicationTitle: "Publicarea în registrul comerțului",
      registerCategoryLabel: "Categorie",
      subcategoryLabel: "Subcategorie",
      publicationDateLabel: "Data publicării",
      messageNumberLabel: "Număr mesaj",
      dailyRegisterLabel: "Registru zilnic",
      contactOfficeLabel: "Oficiul registrului",
      publishingOfficeLabel: "Oficiul publicator",
      disclaimerTitle: "Răspundere și linkuri",
      contentLiabilityTitle: "Răspundere pentru conținut",
      contentLiabilityBody:
        "Pregătim conținutul paginilor noastre cu mare grijă. Totuși, nu garantăm corectitudinea, completitudinea sau actualitatea, în special pentru prețuri și disponibilități ale produselor. Prețurile din production feed, sample și demo sunt orientative; checkout-ul comerciantului rămâne autoritar.",
      linkLiabilityTitle: "Răspundere pentru linkuri",
      linkLiabilityBody:
        "Site-ul nostru conține linkuri către site-uri externe ale unor terți, inclusiv parteneri afiliați. Nu avem control asupra conținutului lor; furnizorul sau operatorul respectiv rămâne responsabil.",
      copyrightTitle: "Drepturi de autor",
      copyrightBody:
        "Conținutul și operele create de operatorul site-ului sunt protejate de dreptul de autor elvețian.",
    },
    transparency: {
      metaTitle: "Notificări platformă și transparență | BeforeToBuy.com",
      metaDescription:
        "Notificare operator, înregistrare companie, afiliere fără adaos și verificare prețuri pentru BeforeToBuy.com.",
      badge: "Transparență",
      title: "Notificări ale platformei",
      intro:
        "Detalii despre operator și notificări comerciale pentru utilizatori și verificările partenerilor. Documentele legale dedicate rămân accesibile din centrul legal și din subsol.",
      operatorNoticeTitle: "Notificare despre operator și platformă",
      operatorNoticeBody:
        "BeforeToBuy.com este un serviciu de prezentare a produselor și redirecționare, fără checkout pe acest site. Platforma este operată din Elveția de {legalName} (Registrul Comerțului Cantonul Berna, UID: {uid}). Feed-uri partenere live acoperă comercianți selectați din mai multe țări; catalogul poate include și oferte sample sau demo — confirmați întotdeauna condițiile finale pe site-ul comerciantului.",
      companyCardTitle: "Entitatea și înregistrarea companiei",
      companyCardBody:
        "Operat de {legalName} ({legalForm}). Înregistrat la {registryOffice} sub numărul de registru zilnic {dailyRegisterNumber} (publicare SHAB {messageNumber}).",
      companyCardLink: "Impressum complet",
      affiliateCardTitle: "Comision afiliat și zero adaos",
      affiliateCardBody:
        "Serviciul este gratuit pentru consumatori. Un comerciant sau o rețea ne poate plăti un comision de recomandare din propriul buget de marketing, dar noi nu adăugăm nicio taxă BeforeToBuy. Prețul final de checkout este stabilit întotdeauna de comerciant.",
      affiliateCardLink: "Dezvăluire afiliere",
      priceCardTitle: "Verificarea prețului și disponibilității",
      priceCardBody:
        "Unele prețuri sunt date sample sau demo și este posibil să nu reflecte feed-uri live ale comercianților. Verificați întotdeauna prețul final, TVA-ul, transportul, disponibilitatea și termenii de livrare pe pagina oficială de checkout a comerciantului.",
      priceCardLink: "Declinare preț",
      legalHubLabel: "Centru legal",
      impressumLabel: "Impressum",
      privacyLabel: "Confidențialitate",
      merchantDirectoryLabel: "Director comercianți",
    },
    disclaimer: {
      metaTitle: "Declinarea responsabilității privind prețul și serviciul | BeforeToBuy.com",
      metaDescription:
        "Declinare comercială pentru BeforeToBuy.com despre corectitudinea prețurilor, etichetele surselor, modelul afiliat și responsabilitatea comerciantului.",
      badge: "Declinare comercială",
      title: "Declinarea responsabilității privind prețul și serviciul",
      intro:
        "Limitări importante ale BeforeToBuy.com ca serviciu de comparare a prețurilor care redirecționează către comercianți. Faza actuală a site-ului: {phase}.",
      section1Title: "1. Surse de date și catalog hibrid",
      section1Body:
        "{platformName} combină feed-uri live ale comercianților cu date ilustrative de catalog marcate clar. Ofertele sunt etichetate Production feed, Sample sau Demo pentru a distinge clar intrările live de datele non-live.",
      section2Title: "2. Fără ofertă obligatorie și fără garanție pentru preț, stoc sau disponibilitate",
      section2Body:
        "Informațiile de pe acest site nu reprezintă o ofertă obligatorie și nici o cotație de preț. Nu garantăm corectitudinea, completitudinea sau actualitatea prețurilor, termenelor de livrare, stării stocului sau codurilor promo. Site-ul comerciantului rămâne autoritar la momentul cumpărării.",
      section3Title: "3. Nu suntem parte la tranzacțiile comerciantului",
      section3Body:
        "{platformName} nu este vânzător, broker, operator de marketplace sau procesator de plăți. Contractele pentru bunuri și servicii se încheie exclusiv între dvs. și comerciant. Livrarea, plata, retururile, rambursările, garanția și drepturile consumatorului sunt gestionate de comerciant.",
      section4Title: "4. Model de recomandare afiliată",
      section4Body:
        "Noi comparăm și redirecționăm. Dacă acceptați categoria Afiliat, un comerciant sau o rețea ne poate plăti un comision de recomandare din propriul buget de marketing. Nu adăugăm nicio taxă BeforeToBuy la prețul dvs.",
      section5Title: "5. Clasarea ofertelor",
      section5Body:
        "Implicit, ofertele sunt ordonate după un total orientativ construit pe baza informațiilor disponibile. Filtrele pot schimba ordinea. Plasarea comercială plătită nu este folosită în prezent; dacă va fi introdusă ulterior, va fi etichetată clar.",
      section6Title: "6. Linkuri externe și disponibilitatea serviciului",
      section6Body:
        "Linkurile externe duc către site-uri de comercianți terți. Nu suntem responsabili pentru conținutul lor, prețurile, practicile de confidențialitate sau disponibilitatea lor. Fiind un serviciu gratuit, cataloagele și funcțiile se pot schimba, întrerupe sau pot rămâne incomplete fără notificare.",
    },
  },
};

const LEGAL_INDEX_SECTIONS: Record<SiteLocale, LegalIndexSection[]> = {
  en: [
    {
      id: "company",
      title: "Company and registration",
      items: [
        {
          href: "/impressum",
          label: "Impressum / Legal notice",
          description: "Operator identity, address, UID, HR, SHAB publication, and business purpose.",
        },
        {
          href: "/transparency",
          label: "Platform notices and transparency",
          description: "Operator notice, affiliate zero-markup, and price verification.",
        },
        {
          href: "/about",
          label: "About BeforeToBuy",
          description: "Product positioning as a PortanX platform for smarter price comparison.",
        },
        {
          href: "/contact",
          label: "Contact and legal contact",
          description: "Reach PortanX - Catalin Portan for legal, privacy, and partnership requests.",
        },
      ],
    },
    {
      id: "legal",
      title: "Legal and privacy",
      items: [
        {
          href: "/terms",
          label: "Terms and Conditions",
          description: "Rules for using BeforeToBuy.com as a comparison and redirect helper.",
        },
        {
          href: "/privacy",
          label: "Privacy Policy",
          description: "Personal data, processors, retention, and rights under Swiss nDSG and GDPR where applicable.",
        },
        {
          href: "/cookies",
          label: "Cookie Policy",
          description: "Essential, Affiliate, and Analytics consent categories.",
        },
        {
          href: "/accessibility",
          label: "Accessibility statement",
          description: "WCAG goals, known limitations, and how to report barriers.",
        },
        {
          href: "/complaints",
          label: "Complaints procedure",
          description: "How to raise concerns about the platform rather than merchant order issues.",
        },
      ],
    },
    {
      id: "commercial",
      title: "Commercial and affiliate",
      items: [
        {
          href: "/affiliate-disclosure",
          label: "Affiliate disclosure",
          description: "How referral commissions work, free for consumers and without BeforeToBuy markup.",
        },
        {
          href: "/disclaimer",
          label: "Price and service disclaimer",
          description: "Sample and demo limits, sample versus production feeds, and merchant checkout authority.",
        },
        {
          href: "/policies/comparison",
          label: "Price comparison policy",
          description: "How we present and rank comparable offers across merchants.",
        },
        {
          href: "/policies/editorial",
          label: "Editorial policy",
          description: "How comparison presentation stays independent from merchant checkout.",
        },
        {
          href: "/policies/feeds",
          label: "Feed policy",
          description: "What Production feed, Sample, and Demo labels mean on the platform.",
        },
        {
          href: "/policies/merchants",
          label: "Merchant and stores policy",
          description: "How merchants appear in the directory and when live programs are activated.",
        },
        {
          href: "/policies/notifications",
          label: "Platform notices policy",
          description: "How operator and service notices are published for users and partners.",
        },
      ],
    },
    {
      id: "support",
      title: "Support and directory",
      items: [
        {
          href: "/help",
          label: "Help and FAQ",
          description: "Common questions including price comparison, feeds, and privacy.",
        },
        {
          href: "/status",
          label: "Platform status",
          description: "Operational status of feeds and known platform limitations.",
        },
        {
          href: "/stores",
          label: "Merchant directory",
          description: "Stores and markets currently covered or planned.",
        },
        {
          href: "/categories",
          label: "Categories",
          description: "Browse the taxonomy used for comparison navigation.",
        },
      ],
    },
  ],
  de: [
    {
      id: "company",
      title: "Unternehmen und Registrierung",
      items: [
        {
          href: "/impressum",
          label: "Impressum / Rechtliche Hinweise",
          description: "Betreiberidentität, Adresse, UID, HR, SHAB-Publikation und Unternehmenszweck.",
        },
        {
          href: "/transparency",
          label: "Plattformhinweise und Transparenz",
          description: "Betreiberhinweis, Affiliate-Nullaufschlag und Preisverifikation.",
        },
        {
          href: "/about",
          label: "Über BeforeToBuy",
          description: "Positionierung des Produkts als PortanX-Plattform für intelligenteren Preisvergleich.",
        },
        {
          href: "/contact",
          label: "Kontakt und Rechtskontakt",
          description: "Kontakt für Rechts-, Datenschutz- und Partneranfragen an PortanX - Catalin Portan.",
        },
      ],
    },
    {
      id: "legal",
      title: "Rechtliches und Datenschutz",
      items: [
        {
          href: "/terms",
          label: "AGB und Nutzungsbedingungen",
          description: "Regeln für die Nutzung von BeforeToBuy.com als Vergleichs- und Weiterleitungsdienst.",
        },
        {
          href: "/privacy",
          label: "Datenschutzrichtlinie",
          description: "Personendaten, Auftragsverarbeiter, Aufbewahrung und Rechte nach nDSG und DSGVO.",
        },
        {
          href: "/cookies",
          label: "Cookie-Richtlinie",
          description: "Einwilligungskategorien für Essenziell, Affiliate und Analytics.",
        },
        {
          href: "/accessibility",
          label: "Erklärung zur Barrierefreiheit",
          description: "WCAG-Ziele, bekannte Einschränkungen und Meldung von Barrieren.",
        },
        {
          href: "/complaints",
          label: "Beschwerdeverfahren",
          description: "Wie Sie Anliegen zur Plattform statt zu Händlerbestellungen melden können.",
        },
      ],
    },
    {
      id: "commercial",
      title: "Kommerziell und Affiliate",
      items: [
        {
          href: "/affiliate-disclosure",
          label: "Affiliate-Offenlegung",
          description: "Wie Empfehlungsprovisionen funktionieren, kostenlos für Verbraucher und ohne BeforeToBuy-Aufschlag.",
        },
        {
          href: "/disclaimer",
          label: "Preis- und Service-Hinweis",
          description: "Grenzen von Sample- oder Demo-Daten, Beispiel- versus Produktionsfeeds und Händlerautorität beim Checkout.",
        },
        {
          href: "/policies/comparison",
          label: "Preisvergleichsrichtlinie",
          description: "Wie wir vergleichbare Angebote über mehrere Händler hinweg darstellen und sortieren.",
        },
        {
          href: "/policies/editorial",
          label: "Redaktionelle Richtlinie",
          description: "Wie die Vergleichsdarstellung unabhängig vom Händler-Checkout bleibt.",
        },
        {
          href: "/policies/feeds",
          label: "Feed-Richtlinie",
          description: "Bedeutung der Labels Produktionsfeed, Beispiel und Demo auf der Plattform.",
        },
        {
          href: "/policies/merchants",
          label: "Händler- und Stores-Richtlinie",
          description: "Wie Händler im Verzeichnis erscheinen und wann Live-Programme aktiviert werden.",
        },
        {
          href: "/policies/notifications",
          label: "Richtlinie zu Plattformhinweisen",
          description: "Wie Betreiber- und Diensthinweise für Nutzer und Partner veröffentlicht werden.",
        },
      ],
    },
    {
      id: "support",
      title: "Support und Verzeichnisse",
      items: [
        {
          href: "/help",
          label: "Hilfe und FAQ",
          description: "Häufige Fragen zu Preisvergleich, Feeds und Datenschutz.",
        },
        {
          href: "/status",
          label: "Plattformstatus",
          description: "Betriebsstatus der Feeds und bekannte Plattformgrenzen.",
        },
        {
          href: "/stores",
          label: "Händlerverzeichnis",
          description: "Aktuell abgedeckte oder geplante Shops und Märkte.",
        },
        {
          href: "/categories",
          label: "Kategorien",
          description: "Durchsuchen Sie die Taxonomie für die Vergleichsnavigation.",
        },
      ],
    },
  ],
  fr: [
    {
      id: "company",
      title: "Entreprise et enregistrement",
      items: [
        {
          href: "/impressum",
          label: "Impressum / Mentions légales",
          description: "Identité de l'opérateur, adresse, UID, HR, publication SHAB et objet de l'entreprise.",
        },
        {
          href: "/transparency",
          label: "Avis de plateforme et transparence",
          description: "Avis opérateur, affiliation sans surcoût et vérification des prix.",
        },
        {
          href: "/about",
          label: "À propos de BeforeToBuy",
          description: "Positionnement du produit comme plateforme PortanX pour une comparaison plus intelligente.",
        },
        {
          href: "/contact",
          label: "Contact et contact légal",
          description: "Contacter PortanX - Catalin Portan pour les demandes juridiques, privacy et partenariats.",
        },
      ],
    },
    {
      id: "legal",
      title: "Juridique et confidentialité",
      items: [
        {
          href: "/terms",
          label: "Conditions générales",
          description: "Règles d'utilisation de BeforeToBuy.com comme service de comparaison et de redirection.",
        },
        {
          href: "/privacy",
          label: "Politique de confidentialité",
          description: "Données personnelles, sous-traitants, conservation et droits selon la nLPD et le RGPD.",
        },
        {
          href: "/cookies",
          label: "Politique de cookies",
          description: "Catégories de consentement Essentiel, Affiliation et Analytics.",
        },
        {
          href: "/accessibility",
          label: "Déclaration d'accessibilité",
          description: "Objectifs WCAG, limites connues et manière de signaler les obstacles.",
        },
        {
          href: "/complaints",
          label: "Procédure de plainte",
          description: "Comment soulever un problème concernant la plateforme plutôt qu'une commande marchand.",
        },
      ],
    },
    {
      id: "commercial",
      title: "Commercial et affiliation",
      items: [
        {
          href: "/affiliate-disclosure",
          label: "Déclaration d'affiliation",
          description: "Fonctionnement des commissions de recommandation, gratuit pour les consommateurs et sans majoration BeforeToBuy.",
        },
        {
          href: "/disclaimer",
          label: "Avertissement prix et service",
          description: "Limites des données sample ou démo, flux sample versus production et autorité du marchand au checkout.",
        },
        {
          href: "/policies/comparison",
          label: "Politique de comparaison des prix",
          description: "Comment nous présentons et classons les offres comparables entre marchands.",
        },
        {
          href: "/policies/editorial",
          label: "Politique éditoriale",
          description: "Comment la présentation du comparatif reste indépendante du checkout marchand.",
        },
        {
          href: "/policies/feeds",
          label: "Politique des feeds",
          description: "Signification des libellés Production feed, Sample et Demo sur la plateforme.",
        },
        {
          href: "/policies/merchants",
          label: "Politique marchands et boutiques",
          description: "Comment les marchands apparaissent dans l'annuaire et quand les programmes live sont activés.",
        },
        {
          href: "/policies/notifications",
          label: "Politique des avis plateforme",
          description: "Comment les avis opérateur et service sont publiés pour les utilisateurs et partenaires.",
        },
      ],
    },
    {
      id: "support",
      title: "Support et annuaires",
      items: [
        {
          href: "/help",
          label: "Aide et FAQ",
          description: "Questions fréquentes sur la comparaison des prix, les feeds et la confidentialité.",
        },
        {
          href: "/status",
          label: "Statut de la plateforme",
          description: "État opérationnel des feeds et limites connues de la plateforme.",
        },
        {
          href: "/stores",
          label: "Annuaire marchands",
          description: "Boutiques et marchés actuellement couverts ou prévus.",
        },
        {
          href: "/categories",
          label: "Catégories",
          description: "Parcourir la taxonomie utilisée pour la navigation de comparaison.",
        },
      ],
    },
  ],
  it: [
    {
      id: "company",
      title: "Azienda e registrazione",
      items: [
        {
          href: "/impressum",
          label: "Impressum / Avviso legale",
          description: "Identità dell'operatore, indirizzo, UID, HR, pubblicazione SHAB e oggetto aziendale.",
        },
        {
          href: "/transparency",
          label: "Avvisi piattaforma e trasparenza",
          description: "Avviso operatore, affiliazione senza ricarico e verifica prezzi.",
        },
        {
          href: "/about",
          label: "Informazioni su BeforeToBuy",
          description: "Posizionamento del prodotto come piattaforma PortanX per un confronto prezzi più intelligente.",
        },
        {
          href: "/contact",
          label: "Contatto e contatto legale",
          description: "Contatta PortanX - Catalin Portan per richieste legali, privacy e partnership.",
        },
      ],
    },
    {
      id: "legal",
      title: "Legale e privacy",
      items: [
        {
          href: "/terms",
          label: "Termini e condizioni",
          description: "Regole per usare BeforeToBuy.com come servizio di confronto e reindirizzamento.",
        },
        {
          href: "/privacy",
          label: "Informativa privacy",
          description: "Dati personali, responsabili, conservazione e diritti secondo nLPD e GDPR dove applicabile.",
        },
        {
          href: "/cookies",
          label: "Informativa sui cookie",
          description: "Categorie di consenso Essenziale, Affiliazione e Analytics.",
        },
        {
          href: "/accessibility",
          label: "Dichiarazione di accessibilità",
          description: "Obiettivi WCAG, limiti noti e come segnalare barriere.",
        },
        {
          href: "/complaints",
          label: "Procedura di reclamo",
          description: "Come segnalare problemi relativi alla piattaforma invece che agli ordini merchant.",
        },
      ],
    },
    {
      id: "commercial",
      title: "Commerciale e affiliazione",
      items: [
        {
          href: "/affiliate-disclosure",
          label: "Dichiarazione di affiliazione",
          description: "Come funzionano le commissioni di referral, gratuite per i consumatori e senza ricarico BeforeToBuy.",
        },
        {
          href: "/disclaimer",
          label: "Dichiarazione su prezzi e servizio",
          description: "Limiti dei dati sample o demo, feed sample versus production e autorità del merchant al checkout.",
        },
        {
          href: "/policies/comparison",
          label: "Policy di confronto prezzi",
          description: "Come presentiamo e ordiniamo offerte comparabili tra merchant.",
        },
        {
          href: "/policies/editorial",
          label: "Policy editoriale",
          description: "Come la presentazione del confronto resta indipendente dal checkout merchant.",
        },
        {
          href: "/policies/feeds",
          label: "Policy dei feed",
          description: "Significato delle etichette Production feed, Sample e Demo sulla piattaforma.",
        },
        {
          href: "/policies/merchants",
          label: "Policy merchant e negozi",
          description: "Come i merchant appaiono nella directory e quando vengono attivati i programmi live.",
        },
        {
          href: "/policies/notifications",
          label: "Policy degli avvisi piattaforma",
          description: "Come pubblichiamo avvisi su operatore e servizio per utenti e partner.",
        },
      ],
    },
    {
      id: "support",
      title: "Supporto e directory",
      items: [
        {
          href: "/help",
          label: "Aiuto e FAQ",
          description: "Domande frequenti su confronto prezzi, feed e privacy.",
        },
        {
          href: "/status",
          label: "Stato piattaforma",
          description: "Stato operativo dei feed e limiti noti della piattaforma.",
        },
        {
          href: "/stores",
          label: "Directory merchant",
          description: "Negozi e mercati attualmente coperti o pianificati.",
        },
        {
          href: "/categories",
          label: "Categorie",
          description: "Sfoglia la tassonomia usata per la navigazione comparativa.",
        },
      ],
    },
  ],
  ro: [
    {
      id: "company",
      title: "Companie și înregistrare",
      items: [
        {
          href: "/impressum",
          label: "Impressum / notificare legală",
          description: "Identitatea operatorului, adresa, UID, HR, publicarea SHAB și obiectul de activitate.",
        },
        {
          href: "/transparency",
          label: "Notificări platformă și transparență",
          description: "Notificare operator, afiliere fără adaos și verificare prețuri.",
        },
        {
          href: "/about",
          label: "Despre BeforeToBuy",
          description: "Poziționarea produsului ca platformă PortanX pentru comparație de preț mai inteligentă.",
        },
        {
          href: "/contact",
          label: "Contact și contact legal",
          description: "Contactați PortanX - Catalin Portan pentru cereri legale, de confidențialitate și parteneriate.",
        },
      ],
    },
    {
      id: "legal",
      title: "Legal și confidențialitate",
      items: [
        {
          href: "/terms",
          label: "Termeni și condiții",
          description: "Regulile de utilizare a BeforeToBuy.com ca serviciu de comparație și redirecționare.",
        },
        {
          href: "/privacy",
          label: "Politica de confidențialitate",
          description: "Date personale, procesatori, retenție și drepturi conform nDSG și GDPR unde este aplicabil.",
        },
        {
          href: "/cookies",
          label: "Politica de cookie-uri",
          description: "Categoriile de consimțământ Esențial, Afiliat și Analytics.",
        },
        {
          href: "/accessibility",
          label: "Declarație de accesibilitate",
          description: "Obiective WCAG, limitări cunoscute și modul de raportare a barierelor.",
        },
        {
          href: "/complaints",
          label: "Procedura de plângeri",
          description: "Cum ridicați probleme despre platformă, nu despre comenzile plasate la comercianți.",
        },
      ],
    },
    {
      id: "commercial",
      title: "Comercial și afiliat",
      items: [
        {
          href: "/affiliate-disclosure",
          label: "Dezvăluire afiliere",
          description: "Cum funcționează comisioanele de recomandare, gratuit pentru consumatori și fără adaos BeforeToBuy.",
        },
        {
          href: "/disclaimer",
          label: "Declinare privind prețul și serviciul",
          description: "Limitările datelor sample sau demo, diferența dintre feed-uri sample și production și autoritatea checkout-ului comerciantului.",
        },
        {
          href: "/policies/comparison",
          label: "Politica de comparare a prețurilor",
          description: "Cum prezentăm și ordonăm ofertele comparabile între comercianți.",
        },
        {
          href: "/policies/editorial",
          label: "Politica editorială",
          description: "Cum rămâne prezentarea comparației independentă de checkout-ul comerciantului.",
        },
        {
          href: "/policies/feeds",
          label: "Politica feed-urilor",
          description: "Ce înseamnă etichetele Production feed, Sample și Demo pe platformă.",
        },
        {
          href: "/policies/merchants",
          label: "Politica magazinelor și comercianților",
          description: "Cum apar comercianții în director și când sunt activate programele live.",
        },
        {
          href: "/policies/notifications",
          label: "Politica notificărilor platformei",
          description: "Cum publicăm notificările despre operator și serviciu pentru utilizatori și parteneri.",
        },
      ],
    },
    {
      id: "support",
      title: "Suport și directoare",
      items: [
        {
          href: "/help",
          label: "Ajutor și FAQ",
          description: "Întrebări frecvente despre comparația de preț, feed-uri și confidențialitate.",
        },
        {
          href: "/status",
          label: "Starea platformei",
          description: "Starea operațională a feed-urilor și limitările cunoscute ale platformei.",
        },
        {
          href: "/stores",
          label: "Director comercianți",
          description: "Magazine și piețe acoperite acum sau planificate.",
        },
        {
          href: "/categories",
          label: "Categorii",
          description: "Navigați taxonomia folosită pentru comparație.",
        },
      ],
    },
  ],
};

const PROCESSING_PURPOSES: Record<SiteLocale, ProcessingPurpose[]> = {
  en: [
    {
      purpose: "Operate the website, select the initial market from Vercel's request country code, and store essential preferences",
      basis: "Overriding interest / essential operation; contract initiation where you contact us",
    },
    {
      purpose: "Optional affiliate outbound linking and partner cookies after you leave",
      basis: "Consent (Affiliate category)",
    },
    {
      purpose: "Analytics consent category reserved for a future optional tool (not currently active)",
      basis: "Consent (Analytics category) — only if/when an analytics tool is enabled",
    },
  ],
  de: [
    {
      purpose: "Betrieb der Website, Auswahl des Startmarkts anhand des Vercel-Ländercodes und Speicherung essenzieller Präferenzen",
      basis: "Überwiegendes Interesse / essenzieller Betrieb; Vertragsanbahnung bei Kontaktaufnahme",
    },
    {
      purpose: "Optionale Affiliate-Weiterleitungen und Partner-Cookies nach Verlassen der Seite",
      basis: "Einwilligung (Affiliate-Kategorie)",
    },
    {
      purpose: "Analytics-Kategorie für ein künftiges optionales Tool reserviert (derzeit nicht aktiv)",
      basis: "Einwilligung (Analytics-Kategorie) — nur falls/wenn ein Analytics-Tool aktiviert wird",
    },
  ],
  fr: [
    {
      purpose: "Exploitation du site, sélection du marché initial via le code pays Vercel et stockage des préférences essentielles",
      basis: "Intérêt prépondérant / fonctionnement essentiel ; initiation contractuelle lorsque vous nous contactez",
    },
    {
      purpose: "Liens d'affiliation optionnels et cookies partenaires après votre départ du site",
      basis: "Consentement (catégorie Affiliation)",
    },
    {
      purpose: "Catégorie Analytics réservée à un outil optionnel futur (actuellement inactive)",
      basis: "Consentement (catégorie Analytics) — uniquement si/quand un outil analytics est activé",
    },
  ],
  it: [
    {
      purpose: "Gestione del sito, selezione del mercato iniziale tramite il codice paese Vercel e salvataggio delle preferenze essenziali",
      basis: "Interesse prevalente / funzionamento essenziale; avvio del rapporto contrattuale quando ci contatti",
    },
    {
      purpose: "Link affiliati opzionali e cookie dei partner dopo l'uscita dal sito",
      basis: "Consenso (categoria Affiliazione)",
    },
    {
      purpose: "Categoria Analytics riservata a un futuro strumento opzionale (attualmente non attivo)",
      basis: "Consenso (categoria Analytics) — solo se/quando viene attivato uno strumento analytics",
    },
  ],
  ro: [
    {
      purpose: "Operarea site-ului, alegerea pieței inițiale din codul de țară Vercel și stocarea preferințelor esențiale",
      basis: "Interes legitim preponderent / funcționare esențială; inițiere contractuală când ne contactați",
    },
    {
      purpose: "Linkuri externe afiliate opționale și cookie-uri partenere după părăsirea site-ului",
      basis: "Consimțământ (categoria Afiliat)",
    },
    {
      purpose: "Categoria Analytics rezervată pentru un instrument opțional viitor (momentan inactivă)",
      basis: "Consimțământ (categoria Analytics) — doar dacă/când se activează un instrument analytics",
    },
  ],
};

const RETENTION_SCHEDULE: Record<SiteLocale, RetentionItem[]> = {
  en: [
    {
      data: "Contact form submissions",
      retention: "Until the inquiry is resolved plus 12 months",
      legalBasis: "Legitimate interest / contract initiation",
    },
    {
      data: "Server and edge logs (Vercel)",
      retention: "Per Vercel policy, typically days to weeks",
      legalBasis: "Security and stability",
    },
    {
      data: "Consent preferences",
      retention: "Up to 180 days or until you clear them",
      legalBasis: "Consent / essential preferences",
    },
    {
      data: "Optional analytics",
      retention: "Not applicable while no analytics tool is active; consent preference only up to 180 days",
      legalBasis: "Consent (Analytics) — reserved",
    },
  ],
  de: [
    {
      data: "Kontaktformular-Einreichungen",
      retention: "Bis zur Klärung der Anfrage plus 12 Monate",
      legalBasis: "Berechtigtes Interesse / Vertragsanbahnung",
    },
    {
      data: "Server- und Edge-Logs (Vercel)",
      retention: "Gemäß Vercel-Richtlinie, typischerweise Tage bis Wochen",
      legalBasis: "Sicherheit und Stabilität",
    },
    {
      data: "Consent-Präferenzen",
      retention: "Bis zu 180 Tage oder bis zur Löschung",
      legalBasis: "Einwilligung / essenzielle Präferenzen",
    },
    {
      data: "Optionale Analytics",
      retention: "Nicht anwendbar, solange kein Analytics-Tool aktiv ist; nur Consent-Präferenz bis 180 Tage",
      legalBasis: "Einwilligung (Analytics) — reserviert",
    },
  ],
  fr: [
    {
      data: "Envois du formulaire de contact",
      retention: "Jusqu'à résolution de la demande plus 12 mois",
      legalBasis: "Intérêt légitime / initiation contractuelle",
    },
    {
      data: "Logs serveur et edge (Vercel)",
      retention: "Selon la politique Vercel, généralement de quelques jours à quelques semaines",
      legalBasis: "Sécurité et stabilité",
    },
    {
      data: "Préférences de consentement",
      retention: "Jusqu'à 180 jours ou jusqu'à suppression",
      legalBasis: "Consentement / préférences essentielles",
    },
    {
      data: "Analytics optionnels",
      retention: "Sans objet tant qu'aucun outil analytics n'est actif ; préférence de consentement uniquement jusqu'à 180 jours",
      legalBasis: "Consentement (Analytics) — réservé",
    },
  ],
  it: [
    {
      data: "Invii del modulo di contatto",
      retention: "Fino alla risoluzione della richiesta più 12 mesi",
      legalBasis: "Interesse legittimo / avvio contrattuale",
    },
    {
      data: "Log server ed edge (Vercel)",
      retention: "Secondo la policy Vercel, tipicamente da giorni a settimane",
      legalBasis: "Sicurezza e stabilità",
    },
    {
      data: "Preferenze di consenso",
      retention: "Fino a 180 giorni o fino alla cancellazione",
      legalBasis: "Consenso / preferenze essenziali",
    },
    {
      data: "Analytics opzionali",
      retention: "Non applicabile finché nessuno strumento analytics è attivo; solo preferenza di consenso fino a 180 giorni",
      legalBasis: "Consenso (Analytics) — riservato",
    },
  ],
  ro: [
    {
      data: "Mesaje din formularul de contact",
      retention: "Până la rezolvarea solicitării plus 12 luni",
      legalBasis: "Interes legitim / inițiere contractuală",
    },
    {
      data: "Log-uri server și edge (Vercel)",
      retention: "Conform politicii Vercel, de regulă zile până la săptămâni",
      legalBasis: "Securitate și stabilitate",
    },
    {
      data: "Preferințe de consimțământ",
      retention: "Până la 180 de zile sau până la ștergere",
      legalBasis: "Consimțământ / preferințe esențiale",
    },
    {
      data: "Analytics opțional",
      retention: "Nu se aplică cât timp nu există instrument analytics activ; doar preferința de consimțământ până la 180 zile",
      legalBasis: "Consimțământ (Analytics) — rezervat",
    },
  ],
};

export function getLegalCopy(locale: SiteLocale): LegalCopy {
  return LEGAL_COPY[locale];
}

export function getLegalCompanySections(locale: SiteLocale): LegalIndexSection[] {
  return LEGAL_INDEX_SECTIONS[locale];
}

export function getLocalizedProcessingPurposes(locale: SiteLocale): ProcessingPurpose[] {
  return PROCESSING_PURPOSES[locale];
}

export function getLocalizedRetentionSchedule(locale: SiteLocale): RetentionItem[] {
  return RETENTION_SCHEDULE[locale];
}

export function getLocalizedDataProcessors(locale: SiteLocale): ProcessorItem[] {
  return buildLocalizedDataProcessors(locale);
}

export type { ProcessorItem };
