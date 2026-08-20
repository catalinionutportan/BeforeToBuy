import type { SiteLocale } from "@/lib/i18n/locales";

export type PolicySlug =
  | "comparison"
  | "editorial"
  | "feeds"
  | "merchants"
  | "notifications";

export type PolicyDoc = {
  slug: PolicySlug;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
};

const POLICY_PAGES_BY_LOCALE: Record<SiteLocale, Record<PolicySlug, PolicyDoc>> = {
  en: {
    comparison: {
      slug: "comparison",
      title: "Price comparison policy",
      description:
        "How BeforeToBuy.com presents comparable merchant offers without operating checkout.",
      sections: [
        {
          heading: "Purpose",
          body: "BeforeToBuy.com helps users compare listed prices and offers from partner or demo merchants, then redirects them to the merchant site to buy. We do not sell products or process payments.",
        },
        {
          heading: "What we show",
          body: "We display product information, listed prices, and merchant labels available in our catalog. Totals may exclude VAT, customs, or shipping that only appear at merchant checkout.",
        },
        {
          heading: "Ranking and selection",
          body: "Default ordering prioritizes useful comparison (typically lower listed totals when sort is price-ascending). There is no paid placement that changes this default ranking. Coverage is limited to currently configured merchants and feed freshness; listed prices may exclude taxes or shipping that only appear at merchant checkout. Always confirm the feed/update timing and final totals on the merchant site.",
        },
        {
          heading: "Merchant authority",
          body: "The merchant website is authoritative for final price, stock, delivery, and contract terms. Always confirm before purchase.",
        },
      ],
    },
    editorial: {
      slug: "editorial",
      title: "Editorial policy",
      description: "Independence and labeling standards for BeforeToBuy comparison content.",
      sections: [
        {
          heading: "Independence",
          body: "Comparison presentation is operated by PortanX - Catalin Portan. Affiliate commissions may apply after consented outbound clicks, but we do not add a BeforeToBuy fee to the price you pay at the merchant.",
        },
        {
          heading: "Labeling",
          body: "Offers are labeled Production feed, Sample, or Demo so users and partners can distinguish live data from illustrative catalog rows.",
        },
        {
          heading: "Corrections",
          body: "If you find a misleading label or a broken offer link, contact admin@portanx.com with the page URL and merchant name.",
        },
      ],
    },
    feeds: {
      slug: "feeds",
      title: "Feed policy",
      description: "Meaning of production-feed, sample, and demo catalog entries.",
      sections: [
        {
          heading: "Production feed",
          body: "Data from a configured merchant product feed. It is closer to live catalog data, but it may still lag behind the merchant website.",
        },
        {
          heading: "Sample",
          body: "Illustrative test data used for demos and integration checks. It is not live merchant pricing for purchase decisions.",
        },
        {
          heading: "Demo",
          body: "Generated catalog examples for UX and partner demonstrations. Always verify on the merchant site.",
        },
        {
          heading: "Live feeds today",
          body: "Currently configured merchants include baby-walz, Belando, Reifen.com, and Acer (AWIN Switzerland), Rowenta and Scule365 (2Performant Romania), Seentat (AWIN UK), Geepas (AWIN UK), Arlo (AWIN UK), and Ottocast (AWIN US). evoMAG remains soft-paused in the catalogue (offers hidden without deletion) until image/CDN readiness is confirmed. Affiliate outbound links stay blocked until Affiliate consent is granted. Other merchants are added only after acceptance and feed wiring.",
        },
      ],
    },
    merchants: {
      slug: "merchants",
      title: "Merchant and stores policy",
      description: "How merchants appear in BeforeToBuy and when affiliate programs go live.",
      sections: [
        {
          heading: "Directory",
          body: "The merchant directory may list both current and planned stores. Presence in the directory does not always mean that a live affiliate program or production feed is active.",
        },
        {
          heading: "Going live",
          body: "A merchant becomes a live production-feed entry only after acceptance, technical feed wiring, and the correct consent categories for outbound links.",
        },
        {
          heading: "Responsibility",
          body: "Orders, shipping, returns, warranties, and payments remain solely between the user and the merchant.",
        },
      ],
    },
    notifications: {
      slug: "notifications",
      title: "Platform notices policy",
      description: "How operator and service notices are published for users and partners.",
      sections: [
        {
          heading: "Where notices live",
          body: "Operator notices, registry summaries, and commercial disclaimers are published on dedicated pages such as Transparency, Disclaimer, and Impressum, and indexed from Legal and Company.",
        },
        {
          heading: "Source transparency",
          body: "We disclose sample and demo limits instead of implying full live coverage in every market.",
        },
        {
          heading: "Updates",
          body: "When feed status or affiliate coverage changes, we update the relevant legal or commercial pages and platform status notes.",
        },
      ],
    },
  },
  de: {
    comparison: {
      slug: "comparison",
      title: "Preisvergleichsrichtlinie",
      description:
        "Wie BeforeToBuy.com vergleichbare Händlerangebote darstellt, ohne selbst einen Checkout zu betreiben.",
      sections: [
        {
          heading: "Zweck",
          body: "BeforeToBuy.com hilft Nutzern dabei, gelistete Preise und Angebote von Partner- oder Demo-Händlern zu vergleichen und leitet anschließend zum Händler weiter. Wir verkaufen keine Produkte und verarbeiten keine Zahlungen.",
        },
        {
          heading: "Was wir anzeigen",
          body: "Wir zeigen Produktinformationen, gelistete Preise und Händlerkennzeichnungen aus unserem Katalog. Gesamtsummen können Mehrwertsteuer, Zoll oder Versand ausschließen, die erst im Händler-Checkout sichtbar werden.",
        },
        {
          heading: "Ranking und Auswahl",
          body: "Die Standardsortierung priorisiert einen nützlichen Vergleich, einschließlich niedriger gelisteter Preise, soweit die aktuelle Sortierung und Filter dies zulassen. Wir garantieren nicht, dass der niedrigste gelistete Preis nach Versand oder Steuern die besten Gesamtkosten darstellt.",
        },
        {
          heading: "Maßgeblichkeit des Händlers",
          body: "Die Händler-Website ist für Endpreis, Bestand, Lieferung und Vertragsbedingungen maßgeblich. Bitte vor dem Kauf immer prüfen.",
        },
      ],
    },
    editorial: {
      slug: "editorial",
      title: "Redaktionelle Richtlinie",
      description: "Unabhängigkeits- und Kennzeichnungsstandards für Vergleichsinhalte auf BeforeToBuy.",
      sections: [
        {
          heading: "Unabhängigkeit",
          body: "Die Vergleichsdarstellung wird von PortanX - Catalin Portan betrieben. Nach einwilligungsbasierten ausgehenden Klicks können Affiliate-Provisionen anfallen, wir fügen dem Händlerpreis jedoch keine BeforeToBuy-Gebühr hinzu.",
        },
        {
          heading: "Kennzeichnung",
          body: "Angebote werden als Produktionsfeed, Beispiel oder Demo gekennzeichnet, damit Nutzer und Partner Live-Daten von illustrativen Katalogzeilen unterscheiden können.",
        },
        {
          heading: "Korrekturen",
          body: "Wenn Sie eine irreführende Kennzeichnung oder einen defekten Angebotslink finden, schreiben Sie an admin@portanx.com und nennen Sie Seiten-URL sowie Händlernamen.",
        },
      ],
    },
    feeds: {
      slug: "feeds",
      title: "Feed-Richtlinie",
      description: "Bedeutung von Produktionsfeed-, Beispiel- und Demo-Katalogeinträgen.",
      sections: [
        {
          heading: "Produktionsfeed",
          body: "Daten aus einem konfigurierten Händler-Produktfeed. Sie liegen näher an Live-Katalogdaten, können aber dennoch hinter der Händler-Website zurückliegen.",
        },
        {
          heading: "Beispiel",
          body: "Illustrative Testdaten für Demos und Integrationsprüfungen. Keine Live-Händlerpreise für Kaufentscheidungen.",
        },
        {
          heading: "Demo",
          body: "Generierte Katalogbeispiele für UX- und Partner-Demonstrationen. Immer auf der Händlerseite verifizieren.",
        },
        {
          heading: "Live-Feeds heute",
          body: "Derzeit konfigurierte Händler umfassen baby-walz, Belando, Reifen.com und Acer (AWIN Schweiz), Rowenta und Scule365 (2Performant Rumänien), Seentat (AWIN UK), Geepas (AWIN UK), Arlo (AWIN UK) und Ottocast (AWIN US). evoMAG bleibt im Katalog soft-pausiert (Angebote ausgeblendet ohne Löschung), bis Bild-/CDN-Bereitschaft bestätigt ist. Affiliate-Links bleiben gesperrt, bis Affiliate-Einwilligung erteilt wird. Weitere Händler erst nach Freigabe und Feed-Anbindung.",
        },
      ],
    },
    merchants: {
      slug: "merchants",
      title: "Händler- und Stores-Richtlinie",
      description: "Wie Händler bei BeforeToBuy erscheinen und wann Affiliate-Programme live gehen.",
      sections: [
        {
          heading: "Verzeichnis",
          body: "Das Händlerverzeichnis kann sowohl aktuelle als auch geplante Shops auflisten. Die Präsenz im Verzeichnis bedeutet nicht automatisch, dass bereits ein Live-Affiliate-Programm oder Produktionsfeed aktiv ist.",
        },
        {
          heading: "Live-Schaltung",
          body: "Ein Händler wird erst nach Freigabe, technischer Feed-Anbindung und passenden Consent-Kategorien für ausgehende Links zu einem Live-Produktionsfeed-Eintrag.",
        },
        {
          heading: "Verantwortung",
          body: "Bestellungen, Versand, Rücksendungen, Garantien und Zahlungen bleiben ausschließlich Sache von Nutzer und Händler.",
        },
      ],
    },
    notifications: {
      slug: "notifications",
      title: "Richtlinie zu Plattformhinweisen",
      description: "Wie Betreiber- und Diensthinweise für Nutzer und Partner veröffentlicht werden.",
      sections: [
        {
          heading: "Wo Hinweise veröffentlicht werden",
          body: "Betreiberhinweise, Registerzusammenfassungen und kommerzielle Disclaimer werden auf eigenen Seiten wie Transparenz, Disclaimer und Impressum veröffentlicht und von der Rechtszentrale aus verlinkt.",
        },
        {
          heading: "Quellentransparenz",
          body: "Wir legen Grenzen von Sample- und Demo-Daten offen, statt in jedem Markt vollständige Live-Abdeckung zu suggerieren.",
        },
        {
          heading: "Aktualisierungen",
          body: "Wenn sich Feed-Status oder Affiliate-Abdeckung ändern, aktualisieren wir die relevanten rechtlichen oder kommerziellen Seiten sowie die Plattform-Statushinweise.",
        },
      ],
    },
  },
  fr: {
    comparison: {
      slug: "comparison",
      title: "Politique de comparaison des prix",
      description:
        "Comment BeforeToBuy.com présente des offres marchandes comparables sans exploiter lui-même le checkout.",
      sections: [
        {
          heading: "Objectif",
          body: "BeforeToBuy.com aide les utilisateurs à comparer les prix affichés et les offres de marchands partenaires ou de démonstration, puis les redirige vers le site du marchand pour acheter. Nous ne vendons pas de produits et ne traitons pas les paiements.",
        },
        {
          heading: "Ce que nous affichons",
          body: "Nous affichons les informations produit, les prix listés et les libellés marchands disponibles dans notre catalogue. Les totaux peuvent exclure TVA, douanes ou livraison qui n'apparaissent qu'au checkout du marchand.",
        },
        {
          heading: "Classement et sélection",
          body: "Le tri par défaut privilégie une comparaison utile, y compris les prix affichés plus bas lorsque le tri et les filtres actuels le permettent. Nous ne garantissons pas que le prix affiché le plus bas constitue le meilleur coût total après livraison ou taxes.",
        },
        {
          heading: "Autorité du marchand",
          body: "Le site du marchand fait foi pour le prix final, le stock, la livraison et les conditions contractuelles. Vérifiez toujours avant l'achat.",
        },
      ],
    },
    editorial: {
      slug: "editorial",
      title: "Politique éditoriale",
      description: "Normes d'indépendance et de libellé pour les contenus comparatifs de BeforeToBuy.",
      sections: [
        {
          heading: "Indépendance",
          body: "La présentation comparative est exploitée par PortanX - Catalin Portan. Des commissions d'affiliation peuvent s'appliquer après des clics sortants consentis, mais nous n'ajoutons aucun frais BeforeToBuy au prix payé chez le marchand.",
        },
        {
          heading: "Libellés",
          body: "Les offres sont étiquetées Production feed, Sample ou Demo afin que les utilisateurs et partenaires distinguent les données live des lignes de catalogue illustratives.",
        },
        {
          heading: "Corrections",
          body: "Si vous trouvez un libellé trompeur ou un lien d'offre cassé, contactez admin@portanx.com en indiquant l'URL de la page et le nom du marchand.",
        },
      ],
    },
    feeds: {
      slug: "feeds",
      title: "Politique des feeds",
      description: "Signification des entrées catalogues production-feed, sample et demo.",
      sections: [
        {
          heading: "Production feed",
          body: "Données issues d'un flux produit marchand configuré. Elles sont plus proches des données catalogue live, mais peuvent quand même être en retard sur le site du marchand.",
        },
        {
          heading: "Sample",
          body: "Données de test illustratives utilisées pour les démos et les contrôles d'intégration. Ce ne sont pas des prix live exploitables pour une décision d'achat.",
        },
        {
          heading: "Demo",
          body: "Exemples de catalogue générés pour les démonstrations UX et partenaires. Vérifiez toujours sur le site du marchand.",
        },
        {
          heading: "Feeds live aujourd'hui",
          body: "Les marchands actuellement configurés incluent baby-walz, Belando, Reifen.com et Acer (AWIN Suisse), Rowenta et Scule365 (2Performant Roumanie), Seentat (AWIN UK), Geepas (AWIN UK), Arlo (AWIN UK) et Ottocast (AWIN US). evoMAG reste en soft-pause dans le catalogue (offres masquées sans suppression) jusqu'à confirmation de la disponibilité image/CDN. Les liens affiliés restent bloqués jusqu'au consentement Affiliation. Les autres marchands sont ajoutés uniquement après acceptation et branchement du feed.",
        },
      ],
    },
    merchants: {
      slug: "merchants",
      title: "Politique marchands et boutiques",
      description: "Comment les marchands apparaissent dans BeforeToBuy et quand les programmes d'affiliation passent en live.",
      sections: [
        {
          heading: "Annuaire",
          body: "L'annuaire des marchands peut lister des boutiques actuelles et planifiées. La présence dans l'annuaire ne signifie pas toujours qu'un programme live d'affiliation ou un flux de production est actif.",
        },
        {
          heading: "Passage en live",
          body: "Un marchand ne devient une entrée production-feed live qu'après acceptation, branchement technique du feed et catégories de consentement adaptées pour les liens sortants.",
        },
        {
          heading: "Responsabilité",
          body: "Les commandes, livraisons, retours, garanties et paiements restent exclusivement entre l'utilisateur et le marchand.",
        },
      ],
    },
    notifications: {
      slug: "notifications",
      title: "Politique des avis plateforme",
      description: "Comment les avis opérateur et service sont publiés pour les utilisateurs et partenaires.",
      sections: [
        {
          heading: "Où vivent les avis",
          body: "Les avis opérateur, résumés de registre et avertissements commerciaux sont publiés sur des pages dédiées comme Transparence, Disclaimer et Impressum, puis indexés depuis le hub juridique.",
        },
        {
          heading: "Transparence des sources",
          body: "Nous exposons les limites des données sample et demo au lieu de laisser penser qu'une couverture live complète existe sur tous les marchés.",
        },
        {
          heading: "Mises à jour",
          body: "Quand le statut d'un feed ou la couverture d'affiliation change, nous mettons à jour les pages juridiques ou commerciales concernées ainsi que les notes de statut plateforme.",
        },
      ],
    },
  },
  it: {
    comparison: {
      slug: "comparison",
      title: "Policy di confronto prezzi",
      description:
        "Come BeforeToBuy.com presenta offerte merchant comparabili senza gestire direttamente il checkout.",
      sections: [
        {
          heading: "Scopo",
          body: "BeforeToBuy.com aiuta gli utenti a confrontare prezzi elencati e offerte di merchant partner o demo, poi li reindirizza al sito del merchant per l'acquisto. Non vendiamo prodotti né trattiamo pagamenti.",
        },
        {
          heading: "Cosa mostriamo",
          body: "Mostriamo informazioni prodotto, prezzi elencati e label merchant presenti nel nostro catalogo. I totali possono escludere IVA, dazi o spedizione che appaiono solo nel checkout del merchant.",
        },
        {
          heading: "Ordinamento e selezione",
          body: "L'ordinamento predefinito privilegia un confronto utile, inclusi prezzi elencati più bassi quando l'ordinamento e i filtri correnti lo permettono. Non garantiamo che il prezzo elencato più basso rappresenti il miglior costo totale dopo spedizione o tasse.",
        },
        {
          heading: "Autorità del merchant",
          body: "Il sito del merchant fa fede per prezzo finale, stock, consegna e termini contrattuali. Verifica sempre prima dell'acquisto.",
        },
      ],
    },
    editorial: {
      slug: "editorial",
      title: "Policy editoriale",
      description: "Standard di indipendenza ed etichettatura per i contenuti comparativi di BeforeToBuy.",
      sections: [
        {
          heading: "Indipendenza",
          body: "La presentazione del confronto è gestita da PortanX - Catalin Portan. Possono applicarsi commissioni affiliate dopo clic esterni consensiti, ma non aggiungiamo alcuna fee BeforeToBuy al prezzo pagato presso il merchant.",
        },
        {
          heading: "Etichettatura",
          body: "Le offerte sono etichettate Production feed, Sample o Demo così che utenti e partner possano distinguere i dati live dalle righe illustrative di catalogo.",
        },
        {
          heading: "Correzioni",
          body: "Se trovi un'etichetta fuorviante o un link offerta non funzionante, contatta admin@portanx.com indicando URL della pagina e nome del merchant.",
        },
      ],
    },
    feeds: {
      slug: "feeds",
      title: "Policy dei feed",
      description: "Significato delle voci di catalogo production-feed, sample e demo.",
      sections: [
        {
          heading: "Production feed",
          body: "Dati provenienti da un feed prodotti merchant configurato. Sono più vicini ai dati catalogo live, ma possono comunque essere in ritardo rispetto al sito del merchant.",
        },
        {
          heading: "Sample",
          body: "Dati di test illustrativi usati per demo e controlli di integrazione. Non sono prezzi merchant live da usare per decisioni di acquisto.",
        },
        {
          heading: "Demo",
          body: "Esempi di catalogo generati per dimostrazioni UX e partner. Verifica sempre sul sito del merchant.",
        },
        {
          heading: "Feed live oggi",
          body: "I merchant attualmente configurati includono baby-walz, Belando, Reifen.com e Acer (AWIN Svizzera), Rowenta e Scule365 (2Performant Romania), Seentat (AWIN UK), Geepas (AWIN UK), Arlo (AWIN UK) e Ottocast (AWIN US). evoMAG resta in soft-pause nel catalogo (offerte nascoste senza cancellazione) finché non è confermata la disponibilità immagini/CDN. I link affiliati restano bloccati fino al consenso Affiliazione. Altri merchant solo dopo accettazione e collegamento del feed.",
        },
      ],
    },
    merchants: {
      slug: "merchants",
      title: "Policy merchant e negozi",
      description: "Come i merchant compaiono in BeforeToBuy e quando i programmi affiliate diventano live.",
      sections: [
        {
          heading: "Directory",
          body: "La directory merchant può includere negozi attuali e pianificati. La presenza nella directory non significa sempre che un programma affiliate live o un production feed siano già attivi.",
        },
        {
          heading: "Messa in live",
          body: "Un merchant diventa una voce production-feed live solo dopo accettazione, collegamento tecnico del feed e corrette categorie di consenso per i link esterni.",
        },
        {
          heading: "Responsabilità",
          body: "Ordini, spedizione, resi, garanzie e pagamenti restano esclusivamente tra utente e merchant.",
        },
      ],
    },
    notifications: {
      slug: "notifications",
      title: "Policy degli avvisi piattaforma",
      description: "Come pubblichiamo avvisi su operatore e servizio per utenti e partner.",
      sections: [
        {
          heading: "Dove vivono gli avvisi",
          body: "Avvisi operatore, riepiloghi di registro e disclaimer commerciali sono pubblicati su pagine dedicate come Trasparenza, Disclaimer e Impressum e indicizzati dall'hub legale.",
        },
        {
          heading: "Trasparenza delle fonti",
          body: "Dichiariamo i limiti dei dati sample e demo invece di far intendere una copertura live completa in ogni mercato.",
        },
        {
          heading: "Aggiornamenti",
          body: "Quando cambiano lo stato dei feed o la copertura affiliate, aggiorniamo le relative pagine legali o commerciali e le note di stato della piattaforma.",
        },
      ],
    },
  },
  ro: {
    comparison: {
      slug: "comparison",
      title: "Politica de comparare a prețurilor",
      description:
        "Cum prezintă BeforeToBuy.com oferte comparabile ale comercianților fără să opereze propriul checkout.",
      sections: [
        {
          heading: "Scop",
          body: "BeforeToBuy.com ajută utilizatorii să compare prețurile afișate și ofertele de la comercianți parteneri sau demo, apoi îi redirecționează către site-ul comerciantului pentru cumpărare. Nu vindem produse și nu procesăm plăți.",
        },
        {
          heading: "Ce afișăm",
          body: "Afișăm informații despre produse, prețuri listate și etichete ale comercianților disponibile în catalogul nostru. Totalurile pot exclude TVA, taxe vamale sau transport care apar doar în checkout-ul comerciantului.",
        },
        {
          heading: "Clasare și selecție",
          body: "Ordinea implicită prioritizează o comparație utilă, inclusiv prețuri listate mai mici acolo unde sortarea și filtrele curente permit asta. Nu garantăm că cel mai mic preț afișat reprezintă și costul total cel mai bun după transport sau taxe.",
        },
        {
          heading: "Autoritatea comerciantului",
          body: "Site-ul comerciantului este autoritar pentru prețul final, stoc, livrare și termenii contractuali. Verificați întotdeauna înainte de cumpărare.",
        },
      ],
    },
    editorial: {
      slug: "editorial",
      title: "Politica editorială",
      description: "Standardele de independență și etichetare pentru conținutul comparativ BeforeToBuy.",
      sections: [
        {
          heading: "Independență",
          body: "Prezentarea comparațiilor este operată de PortanX - Catalin Portan. Pot exista comisioane afiliate după clicuri externe consimțite, dar nu adăugăm nicio taxă BeforeToBuy la prețul pe care îl plătiți comerciantului.",
        },
        {
          heading: "Etichetare",
          body: "Ofertele sunt etichetate Production feed, Sample sau Demo pentru ca utilizatorii și partenerii să distingă datele live de rândurile ilustrative din catalog.",
        },
        {
          heading: "Corecții",
          body: "Dacă găsiți o etichetă înșelătoare sau un link de ofertă stricat, scrieți la admin@portanx.com și includeți URL-ul paginii și numele comerciantului.",
        },
      ],
    },
    feeds: {
      slug: "feeds",
      title: "Politica feed-urilor",
      description: "Semnificația intrărilor production-feed, sample și demo din catalog.",
      sections: [
        {
          heading: "Production feed",
          body: "Date provenite dintr-un feed de produse al comerciantului configurat. Sunt mai apropiate de datele live din catalog, dar tot pot rămâne în urmă față de site-ul comerciantului.",
        },
        {
          heading: "Sample",
          body: "Date de test ilustrative folosite pentru demo-uri și verificări de integrare. Nu sunt prețuri live ale comercianților pentru decizii de cumpărare.",
        },
        {
          heading: "Demo",
          body: "Exemple generate de catalog pentru demonstrații UX și pentru parteneri. Verificați întotdeauna pe site-ul comerciantului.",
        },
        {
          heading: "Feed-uri live astăzi",
          body: "Comercianții configurați momentan includ baby-walz, Belando, Reifen.com și Acer (AWIN Elveția), Rowenta și Scule365 (2Performant România), Seentat (AWIN UK), Geepas (AWIN UK), Arlo (AWIN UK) și Ottocast (AWIN US). evoMAG rămâne soft-paused în catalog (ofertele sunt ascunse fără ștergere) până la confirmarea disponibilității imaginilor/CDN. Linkurile afiliate rămân blocate până la consimțământul Afiliat. Alți comercianți doar după acceptare și conectarea feed-ului.",
        },
      ],
    },
    merchants: {
      slug: "merchants",
      title: "Politica magazinelor și comercianților",
      description: "Cum apar comercianții în BeforeToBuy și când devin live programele afiliate.",
      sections: [
        {
          heading: "Director",
          body: "Directorul comercianților poate lista magazine actuale și planificate. Prezența în director nu înseamnă întotdeauna că există deja un program afiliat live sau un production feed activ.",
        },
        {
          heading: "Trecerea în live",
          body: "Un comerciant devine o intrare live de production feed doar după acceptare, conectare tehnică a feed-ului și categoriile corecte de consimțământ pentru linkurile externe.",
        },
        {
          heading: "Responsabilitate",
          body: "Comenzile, livrarea, retururile, garanțiile și plățile rămân exclusiv între utilizator și comerciant.",
        },
      ],
    },
    notifications: {
      slug: "notifications",
      title: "Politica notificărilor platformei",
      description: "Cum publicăm notificările despre operator și serviciu pentru utilizatori și parteneri.",
      sections: [
        {
          heading: "Unde apar notificările",
          body: "Notificările despre operator, rezumatele de registru și declinările comerciale sunt publicate pe pagini dedicate precum Transparency, Disclaimer și Impressum și sunt indexate din centrul legal.",
        },
        {
          heading: "Transparența surselor",
          body: "Dezvăluim limitele datelor sample și demo în loc să sugerăm o acoperire live completă în fiecare piață.",
        },
        {
          heading: "Actualizări",
          body: "Când se schimbă starea feed-urilor sau acoperirea afiliată, actualizăm paginile legale sau comerciale relevante și notele despre starea platformei.",
        },
      ],
    },
  },
};

export const POLICY_SLUGS = Object.keys(POLICY_PAGES_BY_LOCALE.en) as PolicySlug[];

export function isPolicySlug(value: string): value is PolicySlug {
  return value in POLICY_PAGES_BY_LOCALE.en;
}

export function getPolicyPages(locale: SiteLocale): Record<PolicySlug, PolicyDoc> {
  return POLICY_PAGES_BY_LOCALE[locale];
}

export function getPolicyPage(locale: SiteLocale, slug: PolicySlug): PolicyDoc {
  return POLICY_PAGES_BY_LOCALE[locale][slug];
}
