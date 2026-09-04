import type { SiteLocale } from "@/lib/i18n/locales";
import { COMPANY } from "@/lib/company-info";

export type PrivacySection = {
  id: string;
  title: string;
  body: string[];
};

export type PrivacyPolicyContent = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
};

export const PRIVACY_COPY: Record<SiteLocale, PrivacyPolicyContent> = {
  ro: {
    metaTitle: "Politica de Confidențialitate | BeforeToBuy.com",
    metaDescription: "Politica oficială de confidențialitate a platformei BeforeToBuy.com operată de PortanX - Catalin Portan în Berna, Elveția.",
    badge: "Protecția Datelor",
    title: "Politica de Confidențialitate",
    lastUpdated: "Ultima actualizare: 4 septembrie 2026",
    intro: "Această Politică de Confidențialitate explică modul în care BeforeToBuy.com (operat de PortanX - Catalin Portan, Berna, Elveția) colectează, prelucrează și protejează datele utilizatorilor în conformitate cu Legea Federală Elvețiană privind Protecția Datelor (nDSG / revDSG) și Regulamentul General UE privind Protecția Datelor (GDPR).",
    sections: [
      {
        id: "controller",
        title: "1. Operatorul de date (Data Controller)",
        body: [
          `Operatorul responsabil pentru prelucrarea datelor pe această platformă este ${COMPANY.legalName}, cu sediul în ${COMPANY.address.formatted}, Elveția, număr de identificare fiscală/registru UID: ${COMPANY.uid}.`,
          `Pentru orice întrebare sau solicitare legată de protecția datelor personale, ne puteți contacta direct prin email la: ${COMPANY.email}.`,
        ],
      },
      {
        id: "data-categories",
        title: "2. Ce date prelucrăm",
        body: [
          "Jurnale tehnice de server (Server Logs): La accesarea site-ului, serverele noastre înregistrează automat date tehnice standard transmise de browserul dumneavoastră (adresa IP în formă securizată, tipul și versiunea browserului, sistemul de operare, pagina accesată, data și ora accesării, precum și codul de răspuns HTTP). Aceste date sunt utilizate exclusiv pentru asigurarea stabilității și securității tehnice a site-ului.",
          "Preferințe de navigare locale: Salvăm local în browserul dumneavoastră (prin localStorage) preferințele selectate de limbă și piață/țară, pentru a vă oferi o experiență de navigare consecventă la fiecare vizită.",
          "Preferințe de consimțământ (Cookies): Stocăm opțiunile dumneavoastră de consimțământ pentru modulele cookie în stocarea locală și într-un cookie tehnic securizat.",
          "Date de contact: Dacă alegeți să ne trimiteți un mesaj prin formularul de contact sau direct pe email, prelucrăm numele, adresa de email și mesajul transmis, strict pentru a vă răspunde la solicitare.",
        ],
      },
      {
        id: "legal-basis",
        title: "3. Scopurile și temeiurile legale ale prelucrării",
        body: [
          "Furnizarea tehnică și securitatea platformei: Prelucrarea jurnalelor tehnice se bazează pe interesul nostru legitim (Art. 6 alin. 1 lit. f GDPR și dispozițiile nDSG) de a menține platforma online sigură, funcțională și protejată împotriva fraudelor și atacurilor cibernetice.",
          "Reținerea preferințelor dumneavoastră: Stocarea preferințelor de navigare și a opțiunilor de consimțământ se realizează pe baza consimțământului dumneavoastră sau pentru furnizarea serviciului solicitat.",
          "Răspunsul la mesaje: Prelucrarea mesajelor transmise voluntar de dumneavoastră se bazează pe executarea demersurilor la cererea dumneavoastră sau interesul legitim de comunicare profesională.",
        ],
      },
      {
        id: "redirection-affiliate",
        title: "4. Redirecționarea către magazinele partenere",
        body: [
          `${COMPANY.platformName} este un serviciu gratuit de căutare și comparare a ofertelor de preț. Noi nu vindem produse în mod direct și nu procesăm plăți sau comenzi pe acest site.`,
          "Atunci când dați click pe o ofertă, sunteți redirecționat către magazinul comerciantului respectiv. În cazul linkurilor afiliate, redirecționarea poate include un parametru tehnic de urmărire prin rețele afiliate partenere (precum AWIN sau 2Performant), fără a vi se percepe niciun cost suplimentar. Odată ce părăsiți site-ul nostru, prelucrarea datelor se supune politicii de confidențialitate a comerciantului respectiv.",
        ],
      },
      {
        id: "processors",
        title: "5. Furnizori de servicii tehnice (Împuterniciți)",
        body: [
          "Infrastructură web: originea aplicației este găzduită în regim propriu și administrată direct de PortanX. Cloudflare, Inc. furnizează DNS, reverse proxy, securitate și livrarea conținutului și poate prelucra adresa IP și metadate tehnice ale cererii.",
          "Bază de date securizată: Supabase Inc. (găzduiește catalogul de produse în centre de date securizate din Uniunea Europeană).",
          "Transferurile internaționale de date se realizează cu respectarea măsurilor de protecție adecvate, inclusiv Clauzele Contractuale Standard (SCC) aprobate de Comisia Europeană și legislația elvețiană.",
          "Nu comercializăm, nu închiriem și nu transmitem datele dumneavoastră cu caracter personal către terți în scopuri de marketing.",
        ],
      },
      {
        id: "retention",
        title: "6. Durata stocării datelor",
        body: [
          "Datele tehnice de jurnalizare pe server sunt păstrate temporar doar pe durata necesară securității operaționale.",
          "Preferințele de limbă și piață rămân pe dispozitiv până când le ștergeți sau cel mult un an, preferințele de consimțământ cel mult 180 de zile, iar datele de navigare din sessionStorage doar până la închiderea filei.",
          "Mesajele de asistență sunt păstrate doar pe perioada necesară soluționării definitive a solicitării dumneavoastră.",
        ],
      },
      {
        id: "rights",
        title: "7. Drepturile dumneavoastră",
        body: [
          "Dreptul de acces: Aveți dreptul de a solicita confirmarea dacă datele dumneavoastră sunt prelucrate și o copie a acestora.",
          "Dreptul la rectificare: Puteți solicita corectarea oricăror date personale inexacte.",
          "Dreptul la ștergere: Puteți solicita ștergerea datelor dumneavoastră („dreptul de a fi uitat”).",
          "Dreptul de retragere a consimțământului: Vă puteți modifica sau retrage oricând opțiunile de consimțământ direct din bannerul sau secțiunea de setări cookie din subsolul paginii.",
          "Dreptul de a depune o plângere: Aveți dreptul de a sesiza autoritatea de supraveghere competentă. În Elveția: Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB / FDPIC), Feldeggweg 1, CH-3003 Bern (www.edoeb.admin.ch). În Uniunea Europeană: autoritatea națională de protecție a datelor din țara dumneavoastră de reședință.",
        ],
      },
      {
        id: "security",
        title: "8. Securitatea datelor",
        body: [
          "Utilizăm conexiuni securizate criptate SSL/TLS (HTTPS) pe întregul site și aplicăm antete stricte de securitate pentru a proteja integritatea și confidențialitatea datelor dumneavoastră împotriva accesului neautorizat sau a modificării.",
        ],
      },
    ],
  },
  de: {
    metaTitle: "Datenschutzerklärung | BeforeToBuy.com",
    metaDescription: "Offizielle Datenschutzerklärung von BeforeToBuy.com, betrieben von PortanX - Catalin Portan in Bern, Schweiz.",
    badge: "Datenschutz",
    title: "Datenschutzerklärung",
    lastUpdated: "Letzte Aktualisierung: 4. September 2026",
    intro: "Diese Datenschutzerklärung erläutert, wie BeforeToBuy.com (betrieben von PortanX - Catalin Portan, Bern, Schweiz) personenbezogene Daten in Übereinstimmung mit dem Schweizer Datenschutzgesetz (nDSG / revDSG) und der EU-Datenschutz-Grundverordnung (DSGVO) verarbeitet.",
    sections: [
      {
        id: "controller",
        title: "1. Verantwortliche Stelle (Data Controller)",
        body: [
          `Verantwortlich für die Datenverarbeitung auf dieser Website ist ${COMPANY.legalName}, ${COMPANY.address.formattedDe}, Schweiz, UID: ${COMPANY.uid}.`,
          `Bei Fragen zum Datenschutz erreichen Sie uns per E-Mail unter: ${COMPANY.email}.`,
        ],
      },
      {
        id: "data-categories",
        title: "2. Erfasste Daten",
        body: [
          "Server-Logfiles: Beim Aufruf der Website erfassen unsere Server automatisch technische Standarddaten Ihres Browsers (IP-Adresse, Browsertyp, Betriebssystem, aufgerufene Seite, Datum/Uhrzeit, HTTP-Statuscode) zur Gewährleistung der Systemsicherheit und Stabilität.",
          "Lokale Browsereinstellungen: Wir speichern Sprach- und Ländereinstellungen lokal in Ihrem Browser (localStorage), um eine einheitliche Benutzererfahrung zu bieten.",
          "Einwilligungspräferenzen: Ihre Cookie- und Datenschutzauswahl wird lokal und in einem sicheren technischen Cookie gespeichert.",
          "Kontaktanfragen: Wenn Sie uns per Kontaktformular oder E-Mail schreiben, verarbeiten wir Ihre Angaben ausschließlich zur Beantwortung Ihrer Anfrage.",
        ],
      },
      {
        id: "legal-basis",
        title: "3. Zwecke und Rechtsgrundlagen",
        body: [
          "Technischer Betrieb und Sicherheit: Die Verarbeitung technischer Daten stützt sich auf unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO und Schweizer nDSG), einen sicheren und stabilen Dienst bereitzustellen.",
          "Speicherung von Präferenzen: Basiert auf Ihrer Einwilligung bzw. der Bereitstellung der gewünschten Funktion.",
          "Beantwortung von Anfragen: Basiert auf vorvertraglichen Maßnahmen oder unserem berechtigten Interesse an einer ordnungsgemäßen Kommunikation.",
        ],
      },
      {
        id: "redirection-affiliate",
        title: "4. Weiterleitung zu Partnershops",
        body: [
          `${COMPANY.platformName} ist ein kostenloser Preisvergleichsdienst. Wir verkaufen keine Produkte direkt und wickeln keine Zahlungen auf dieser Website ab.`,
          "Beim Klick auf ein Angebot werden Sie auf die Website des jeweiligen Händlers weitergeleitet. Bei Affiliate-Links kann die Weiterleitung technische Tracking-Parameter über Partnernetzwerke (z. B. AWIN, 2Performant) enthalten, ohne dass Ihnen Mehrkosten entstehen. Auf der Händlerseite gilt ausschließlich die Datenschutzerklärung des jeweiligen Händlers.",
        ],
      },
      {
        id: "processors",
        title: "5. Technische Dienstleister",
        body: [
          "Web-Infrastruktur: Der Anwendungsursprung wird selbst gehostet und direkt von PortanX verwaltet. Cloudflare, Inc. stellt DNS, Reverse-Proxy, Sicherheit und Inhaltsauslieferung bereit und kann IP-Adresse sowie technische Anfrage-Metadaten verarbeiten.",
          "Datenbank: Supabase Inc. (Produktkatalogdatenbank in europäischen Rechenzentren).",
          "Internationale Übermittlungen erfolgen unter Beachtung der geltenden Standardvertragsklauseln (SCC) und des Schweizer Datenschutzrechts.",
          "Wir verkaufen oder vermieten keine personenbezogenen Daten an Dritte.",
        ],
      },
      {
        id: "retention",
        title: "6. Speicherdauer",
        body: [
          "Server-Logs werden nur so lange aufbewahrt, wie es für Sicherheits- und Betriebszwecke erforderlich ist.",
          "Sprach- und Ländereinstellungen bleiben bis zur Löschung oder höchstens ein Jahr gespeichert, Einwilligungspräferenzen höchstens 180 Tage und Navigationsdaten im sessionStorage nur bis zum Schließen des Tabs.",
          "Kontaktanfragen werden nach Abschluss der Bearbeitung gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
        ],
      },
      {
        id: "rights",
        title: "7. Ihre Rechte",
        body: [
          "Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten sowie das Recht auf Widerruf erteilter Einwilligungen.",
          "Beschwerderecht: Sie haben das Recht auf Beschwerde bei der zuständigen Aufsichtsbehörde. In der Schweiz: Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB), Feldeggweg 1, CH-3003 Bern (www.edoeb.admin.ch). In der EU: die zuständige Datenschutzbehörde Ihres Wohnsitzlandes.",
        ],
      },
      {
        id: "security",
        title: "8. Datensicherheit",
        body: [
          "Wir setzen durchgehende SSL/TLS-Verschlüsselung (HTTPS) und strikte Sicherheits-Header ein, um Ihre Daten vor unbefugtem Zugriff zu schützen.",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Privacy Policy | BeforeToBuy.com",
    metaDescription: "Official privacy policy for BeforeToBuy.com operated by PortanX - Catalin Portan in Bern, Switzerland.",
    badge: "Privacy Policy",
    title: "Privacy Policy",
    lastUpdated: "Last updated: 4 September 2026",
    intro: "This Privacy Policy explains how BeforeToBuy.com (operated by PortanX - Catalin Portan, Bern, Switzerland) collects, processes, and protects personal data in compliance with the Swiss Federal Data Protection Act (nDSG / revDSG) and the EU General Data Protection Regulation (GDPR).",
    sections: [
      {
        id: "controller",
        title: "1. Data Controller",
        body: [
          `The controller responsible for data processing on this platform is ${COMPANY.legalName}, located at ${COMPANY.address.formatted}, Switzerland, enterprise UID: ${COMPANY.uid}.`,
          `For any data protection inquiries, you can contact us at: ${COMPANY.email}.`,
        ],
      },
      {
        id: "data-categories",
        title: "2. Data We Process",
        body: [
          "Technical Server Logs: When you visit our website, our hosting servers automatically record standard technical data (IP address, browser type, operating system, requested page, timestamp, HTTP status code) strictly for system security and operational integrity.",
          "Local Browser Preferences: We store your chosen language and country/market preferences locally in your browser (via localStorage) to ensure a consistent experience across sessions.",
          "Consent Preferences: Your cookie choices are stored in local storage and in a secure technical cookie.",
          "Contact Inquiries: If you send us a message via contact form or email, we process your name, email, and message content solely to answer your inquiry.",
        ],
      },
      {
        id: "legal-basis",
        title: "3. Purposes and Legal Bases",
        body: [
          "Technical Operation and Security: Processing of server logs is based on our legitimate interest (Art. 6(1)(f) GDPR and Swiss nDSG) in providing a secure and stable online service.",
          "Storing Preferences: Based on your consent or fulfilling your direct request for interface localization.",
          "Customer Inquiries: Based on taking steps at your request or our legitimate interest in providing user support.",
        ],
      },
      {
        id: "redirection-affiliate",
        title: "4. Redirection to Partner Stores",
        body: [
          `${COMPANY.platformName} is a free price comparison service. We do not sell products directly and do not process checkout or payments on this website.`,
          "When you click on an offer, you are redirected to the merchant's official website. For affiliate links, redirection may include standard referral tracking parameters via authorized affiliate networks (such as AWIN or 2Performant) at no extra cost to you. Once on the merchant website, only the merchant's privacy policy applies.",
        ],
      },
      {
        id: "processors",
        title: "5. Technical Service Providers (Processors)",
        body: [
          "Web infrastructure: the application origin is self-hosted and managed directly by PortanX. Cloudflare, Inc. provides DNS, reverse proxy, security, and content delivery and may process the IP address and technical request metadata.",
          "Database: Supabase Inc. (product catalog database located in European data centers).",
          "International data transfers comply with standard data protection safeguards, including EU Standard Contractual Clauses (SCCs) and Swiss data protection law.",
          "We do not sell or rent personal data to third parties.",
        ],
      },
      {
        id: "retention",
        title: "6. Data Retention",
        body: [
          "Server security logs are kept temporarily only for as long as needed for operational security.",
          "Language and market preferences remain until you delete them or for up to one year, consent preferences for up to 180 days, and sessionStorage navigation data only until the browser tab is closed.",
          "Support communications are retained only as long as necessary to resolve your request.",
        ],
      },
      {
        id: "rights",
        title: "7. Your Rights",
        body: [
          "You have the right to access, rectify, erase, or restrict processing of your personal data, as well as the right to withdraw consent at any time.",
          "Right to Lodge a Complaint: You have the right to file a complaint with the competent supervisory authority. In Switzerland: Federal Data Protection and Information Commissioner (FDPIC / EDÖB), Feldeggweg 1, CH-3003 Bern (www.edoeb.admin.ch). In the EU: your local national data protection authority.",
        ],
      },
      {
        id: "security",
        title: "8. Data Security",
        body: [
          "We implement SSL/TLS encryption (HTTPS) across the entire platform and enforce strict HTTP security headers to protect your data against unauthorized access.",
        ],
      },
    ],
  },
  fr: {
    metaTitle: "Politique de Confidentialité | BeforeToBuy.com",
    metaDescription: "Politique de confidentialité officielle de BeforeToBuy.com exploitée par PortanX - Catalin Portan à Berne, Suisse.",
    badge: "Protection des données",
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour : 4 septembre 2026",
    intro: "Cette politique de confidentialité explique comment BeforeToBuy.com (exploité par PortanX - Catalin Portan, Berne, Suisse) traite et protège les données personnelles conformément à la Loi fédérale suisse sur la protection des données (nLPD / revLPD) et au Règlement général sur la protection des données (RGPD).",
    sections: [
      {
        id: "controller",
        title: "1. Responsable du traitement (Data Controller)",
        body: [
          `Le responsable du traitement des données sur cette plateforme est ${COMPANY.legalName}, ${COMPANY.address.formatted}, Suisse, UID : ${COMPANY.uid}.`,
          `Pour toute question relative à la protection des données, vous pouvez nous contacter par e-mail à : ${COMPANY.email}.`,
        ],
      },
      {
        id: "data-categories",
        title: "2. Données traitées",
        body: [
          "Journaux techniques serveur (Logs) : Lors de l'accès au site, nos serveurs enregistrent automatiquement les données techniques de votre navigateur (adresse IP, type de navigateur, système d'exploitation, page consultée, date et heure) pour assurer la sécurité et la stabilité du système.",
          "Préférences locales de navigation : Nous stockons localement dans votre navigateur (via localStorage) vos préférences de langue et de pays pour vous offrir une navigation fluide.",
          "Préférences de consentement : Vos choix concernant les cookies sont enregistrés localement et dans un cookie technique sécurisé.",
          "Formulaire de contact : Si vous nous écrivez, nous traitons vos coordonnées uniquement pour répondre à votre demande.",
        ],
      },
      {
        id: "legal-basis",
        title: "3. Finalités et bases juridiques",
        body: [
          "Exploitation technique et sécurité : Le traitement des journaux techniques repose sur notre intérêt légitime (art. 6 par. 1 let. f RGPD et nLPD suisse) à maintenir un service sécurisé.",
          "Enregistrement des préférences : Repose sur votre consentement ou la fourniture de la fonctionnalité demandée.",
          "Traitement des demandes : Repose sur des mesures précontractuelles ou notre intérêt légitime de communication.",
        ],
      },
      {
        id: "redirection-affiliate",
        title: "4. Redirection vers les boutiques partenaires",
        body: [
          `${COMPANY.platformName} est un service gratuit de comparaison de prix. Nous ne vendons aucun produit directement et ne traitons aucun paiement sur ce site.`,
          "Lorsque vous cliquez sur une offre, vous êtes redirigé vers le site du marchand. Pour les liens affiliés, la redirection peut inclure des paramètres de suivi via des réseaux partenaires (ex. AWIN, 2Performant) sans aucun surcoût. Sur le site du marchand, seule la politique de confidentialité de celui-ci s'applique.",
        ],
      },
      {
        id: "processors",
        title: "5. Prestataires techniques (Sous-traitants)",
        body: [
          "Infrastructure web : l'origine de l'application est auto-hébergée et administrée directement par PortanX. Cloudflare, Inc. fournit le DNS, le proxy inverse, la sécurité et la diffusion de contenu et peut traiter l'adresse IP ainsi que les métadonnées techniques des requêtes.",
          "Base de données : Supabase Inc. (base de données du catalogue située dans l'Union européenne).",
          "Les transferts internationaux respectent les clauses contractuelles types (CCT) de l'UE et le droit suisse.",
          "Nous ne vendons ni ne louons vos données personnelles à des tiers.",
        ],
      },
      {
        id: "retention",
        title: "6. Durée de conservation",
        body: [
          "Les journaux serveur sont conservés temporairement uniquement pour des impératifs de sécurité.",
          "Les préférences de langue et de pays sont conservées jusqu'à leur suppression ou pendant un an au maximum, les choix de consentement pendant 180 jours au maximum et les données de navigation en sessionStorage seulement jusqu'à la fermeture de l'onglet.",
          "Les messages d'assistance sont conservés le temps nécessaire au traitement de votre demande.",
        ],
      },
      {
        id: "rights",
        title: "7. Vos droits",
        body: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement et de limitation du traitement de vos données, ainsi que du droit de retirer votre consentement à tout moment.",
          "Droit de réclamation : Vous avez le droit d'introduire une réclamation auprès de l'autorité compétente. En Suisse : Préposé fédéral à la protection des données et à la transparence (PFPDT), Feldeggweg 1, CH-3003 Berne (www.edoeb.admin.ch). Dans l'UE : l'autorité nationale de votre pays de résidence.",
        ],
      },
      {
        id: "security",
        title: "8. Sécurité des données",
        body: [
          "Nous utilisons un cryptage SSL/TLS (HTTPS) complet et des en-têtes de sécurité stricts pour protéger vos données contre tout accès non autorisé.",
        ],
      },
    ],
  },
  it: {
    metaTitle: "Informativa sulla Privacy | BeforeToBuy.com",
    metaDescription: "Informativa ufficiale sulla privacy di BeforeToBuy.com gestito da PortanX - Catalin Portan a Berna, Svizzera.",
    badge: "Protezione dei dati",
    title: "Informativa sulla Privacy",
    lastUpdated: "Ultimo aggiornamento: 4 settembre 2026",
    intro: "Questa informativa spiega come BeforeToBuy.com (gestito da PortanX - Catalin Portan, Berna, Svizzera) raccoglie, tratta e protegge i dati personali in conformità con la Legge federale svizzera sulla protezione dei dati (nLPD / revLPD) e il Regolamento generale UE sulla protezione dei dati (GDPR).",
    sections: [
      {
        id: "controller",
        title: "1. Titolare del trattamento (Data Controller)",
        body: [
          `Il titolare del trattamento dei dati su questa piattaforma è ${COMPANY.legalName}, ${COMPANY.address.formatted}, Svizzera, UID: ${COMPANY.uid}.`,
          `Per qualsiasi richiesta in materia di privacy, potete contattarci via email a: ${COMPANY.email}.`,
        ],
      },
      {
        id: "data-categories",
        title: "2. Dati trattati",
        body: [
          "Log tecnici di server: Durante la navigazione, i server registrano automaticamente i dati tecnici del browser (indirizzo IP, tipo di browser, sistema operativo, pagina richiesta, data e ora) esclusivamente per garantire sicurezza e stabilità.",
          "Preferenze locali del browser: Salviamo localmente nel browser (tramite localStorage) lingua e paese selezionati per offrire un'esperienza coerente.",
          "Preferenze di consenso: Le vostre scelte sui cookie sono salvate localmente e in un cookie tecnico protetto.",
          "Modulo di contatto: Se ci scrivete, trattiamo i vostri dati esclusivamente per rispondere alla richiesta.",
        ],
      },
      {
        id: "legal-basis",
        title: "3. Finalità e basi giuridiche",
        body: [
          "Funzionamento tecnico e sicurezza: Il trattamento dei log si basa sul nostro legittimo interesse (art. 6 par. 1 lett. f GDPR e nLPD svizzera) a garantire un servizio sicuro.",
          "Memorizzazione delle preferenze: Si basa sul vostro consenso o sulla fornitura della funzionalità richiesta.",
          "Gestione richieste: Si basa sull'esecuzione di misure precontrattuali o sul nostro legittimo interesse di comunicazione.",
        ],
      },
      {
        id: "redirection-affiliate",
        title: "4. Reindirizzamento ai negozi partner",
        body: [
          `${COMPANY.platformName} è un servizio gratuito di confronto prezzi. Non vendiamo prodotti direttamente e non gestiamo pagamenti su questo sito.`,
          "Cliccando su un'offerta, venite reindirizzati al sito ufficiale del negozio. Per i link affiliati, il reindirizzamento può includere parametri tecnici di tracciamento tramite reti partner (es. AWIN, 2Performant) senza alcun costo aggiuntivo. Sul sito del rivenditore si applica esclusivamente la sua informativa privacy.",
        ],
      },
      {
        id: "processors",
        title: "5. Fornitori di servizi tecnici (Responsabili)",
        body: [
          "Infrastruttura web: l'origine dell'applicazione è self-hosted e gestita direttamente da PortanX. Cloudflare, Inc. fornisce DNS, reverse proxy, sicurezza e distribuzione dei contenuti e può trattare l'indirizzo IP e i metadati tecnici delle richieste.",
          "Database: Supabase Inc. (database catalogo prodotti situato nell'Unione Europea).",
          "I trasferimenti internazionali rispettano le clausole contrattuali standard (SCC) dell'UE e la legge svizzera.",
          "Non vendiamo né cediamo dati personali a terzi.",
        ],
      },
      {
        id: "retention",
        title: "6. Periodo di conservazione",
        body: [
          "I log di server vengono conservati temporaneamente solo per motivi di sicurezza tecnica.",
          "Le preferenze di lingua e paese restano fino alla cancellazione o per un massimo di un anno, le preferenze di consenso fino a 180 giorni e i dati di navigazione in sessionStorage solo fino alla chiusura della scheda.",
          "I messaggi di contatto vengono conservati per il tempo necessario a gestire la richiesta.",
        ],
      },
      {
        id: "rights",
        title: "7. I vostri diritti",
        body: [
          "Avete il diritto di accesso, rettifica, cancellazione e limitazione del trattamento dei dati, nonché il diritto di revocare il consenso in qualsiasi momento.",
          "Diritto di reclamo: Avete il diritto di proporre reclamo all'autorità di controllo competente. In Svizzera: Incaricato federale della protezione dei dati e della trasparenza (IFPDT / EDÖB), Feldeggweg 1, CH-3003 Berna (www.edoeb.admin.ch). Nell'UE: l'autorità nazionale del vostro paese di residenza.",
        ],
      },
      {
        id: "security",
        title: "8. Sicurezza dei dati",
        body: [
          "Utilizziamo crittografia SSL/TLS (HTTPS) su tutto il sito e applichiamo rigide intestazioni di sicurezza per proteggere i vostri dati da accessi non autorizzati.",
        ],
      },
    ],
  },
};
