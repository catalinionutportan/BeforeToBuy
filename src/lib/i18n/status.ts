import type { SiteLocale } from "@/lib/i18n/locales";

type StatusCopy = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  intro: string;
  help: string;
  checking: string;
  operational: string;
  degraded: string;
  refresh: string;
  phase: string;
  environment: string;
  commit: string;
  response: string;
  checks: string;
  lastChecked: string;
  loadError: string;
};

export const STATUS_COPY: Record<SiteLocale, StatusCopy> = {
  en: {
    metaTitle: "Platform Status | BeforeToBuy.com",
    metaDescription: "Operational status and health checks for BeforeToBuy.com.",
    badge: "Platform status",
    title: "BeforeToBuy.com Status",
    intro: "Operational health for the production platform. For consumer help, see",
    help: "Help & FAQ",
    checking: "Checking...",
    operational: "All systems operational",
    degraded: "Degraded",
    refresh: "Refresh",
    phase: "Phase",
    environment: "Environment",
    commit: "Commit",
    response: "Response",
    checks: "Checks",
    lastChecked: "Last checked",
    loadError: "Unable to load health status",
  },
  de: {
    metaTitle: "Plattformstatus | BeforeToBuy.com",
    metaDescription: "Betriebsstatus und Systemprüfungen für BeforeToBuy.com.",
    badge: "Plattformstatus",
    title: "Status von BeforeToBuy.com",
    intro: "Betriebszustand der Produktionsplattform. Hilfe für Verbraucher finden Sie unter",
    help: "Hilfe & FAQ",
    checking: "Wird geprüft...",
    operational: "Alle Systeme funktionieren",
    degraded: "Eingeschränkt",
    refresh: "Aktualisieren",
    phase: "Phase",
    environment: "Umgebung",
    commit: "Commit",
    response: "Antwortzeit",
    checks: "Prüfungen",
    lastChecked: "Zuletzt geprüft",
    loadError: "Der Systemstatus konnte nicht geladen werden",
  },
  fr: {
    metaTitle: "État de la plateforme | BeforeToBuy.com",
    metaDescription: "État opérationnel et contrôles de santé de BeforeToBuy.com.",
    badge: "État de la plateforme",
    title: "État de BeforeToBuy.com",
    intro: "État opérationnel de la plateforme de production. Pour obtenir de l'aide, consultez",
    help: "Aide et FAQ",
    checking: "Vérification...",
    operational: "Tous les systèmes sont opérationnels",
    degraded: "Dégradé",
    refresh: "Actualiser",
    phase: "Phase",
    environment: "Environnement",
    commit: "Commit",
    response: "Réponse",
    checks: "Contrôles",
    lastChecked: "Dernière vérification",
    loadError: "Impossible de charger l'état du service",
  },
  it: {
    metaTitle: "Stato della piattaforma | BeforeToBuy.com",
    metaDescription: "Stato operativo e controlli di integrità di BeforeToBuy.com.",
    badge: "Stato della piattaforma",
    title: "Stato di BeforeToBuy.com",
    intro: "Stato operativo della piattaforma di produzione. Per assistenza consulta",
    help: "Aiuto e FAQ",
    checking: "Verifica in corso...",
    operational: "Tutti i sistemi sono operativi",
    degraded: "Degradato",
    refresh: "Aggiorna",
    phase: "Fase",
    environment: "Ambiente",
    commit: "Commit",
    response: "Risposta",
    checks: "Controlli",
    lastChecked: "Ultimo controllo",
    loadError: "Impossibile caricare lo stato del servizio",
  },
  ro: {
    metaTitle: "Starea platformei | BeforeToBuy.com",
    metaDescription: "Starea operațională și verificările tehnice pentru BeforeToBuy.com.",
    badge: "Starea platformei",
    title: "Starea BeforeToBuy.com",
    intro: "Starea operațională a platformei de producție. Pentru ajutor, consultați",
    help: "Ajutor și întrebări frecvente",
    checking: "Se verifică...",
    operational: "Toate sistemele sunt operaționale",
    degraded: "Funcționare degradată",
    refresh: "Actualizează",
    phase: "Fază",
    environment: "Mediu",
    commit: "Versiune",
    response: "Răspuns",
    checks: "Verificări",
    lastChecked: "Ultima verificare",
    loadError: "Starea serviciului nu a putut fi încărcată",
  },
};
