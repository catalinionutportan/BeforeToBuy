export type IubendaMappedConsent = {
  affiliate: boolean;
  analytics: boolean;
};

type IubendaPurposeMap = Record<string | number, boolean | undefined>;

type IubendaCsApi = {
  openPreferences?: () => void;
  isConsentGiven?: () => boolean;
  isConsentRejected?: () => boolean;
  isConsentNeeded?: () => boolean;
};

type IubendaCs = {
  api?: IubendaCsApi;
  consent?:
    | boolean
    | {
        purposes?: IubendaPurposeMap;
        timestamp?: string;
      };
};

declare global {
  interface Window {
    _iub?: { cs?: IubendaCs };
  }
}

/** iubenda default purpose ids: 4 measurement, 5 targeting/ads (affiliate networks). */
export function mapIubendaPurposes(
  purposes: IubendaPurposeMap | undefined
): IubendaMappedConsent | null {
  if (!purposes) return null;
  return {
    analytics: purposes[4] === true || purposes["4"] === true,
    affiliate: purposes[5] === true || purposes["5"] === true,
  };
}

export function readIubendaConsent(): IubendaMappedConsent | null {
  if (typeof window === "undefined") return null;
  const cs = window._iub?.cs;
  if (!cs) return null;

  if (cs.api?.isConsentNeeded?.() === false) {
    return { affiliate: true, analytics: true };
  }
  if (cs.api?.isConsentRejected?.()) {
    return { affiliate: false, analytics: false };
  }
  if (cs.api?.isConsentGiven?.() === false) {
    return null;
  }

  if (cs.consent === true) {
    return { affiliate: true, analytics: true };
  }
  if (cs.consent && typeof cs.consent === "object") {
    const mapped = mapIubendaPurposes(cs.consent.purposes);
    if (mapped) return mapped;
    if (cs.consent.timestamp) return { affiliate: true, analytics: true };
  }

  return null;
}

export function openIubendaPreferences(): boolean {
  if (typeof window === "undefined") return false;
  const open = window._iub?.cs?.api?.openPreferences;
  if (typeof open !== "function") return false;
  open();
  return true;
}
