"use client";

import type { MouseEvent, ReactNode } from "react";
import { openConsentPreferences } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

interface ConsentAwareAffiliateLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
}

/** Outbound merchant/affiliate link that requires Affiliate consent before navigation. */
export function ConsentAwareAffiliateLink({
  href,
  className,
  children,
  ariaLabel,
  title,
}: ConsentAwareAffiliateLinkProps) {
  const { affiliate } = useConsent();
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];

  const blockWithoutConsent = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!affiliate) {
      event.preventDefault();
      openConsentPreferences();
    }
  };

  return (
    <>
      <a
        href={href}
        target={affiliate ? "_blank" : undefined}
        rel={affiliate ? "noopener noreferrer sponsored nofollow" : undefined}
        className={className}
        aria-label={ariaLabel}
        title={title ?? (affiliate ? undefined : ui.acceptAffiliateCookiesHint)}
        onClick={blockWithoutConsent}
        onAuxClick={blockWithoutConsent}
      >
        {children}
      </a>
      <span className="mt-1.5 block text-[10px] leading-snug text-slate-500">
        {ui.affiliateCommissionZeroCost}
      </span>
    </>
  );
}
