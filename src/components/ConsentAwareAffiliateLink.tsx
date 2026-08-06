"use client";

import type { MouseEvent, ReactNode } from "react";
import { openConsentPreferences } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

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

  const blockWithoutConsent = (event: MouseEvent<HTMLAnchorElement>) => {
    if (affiliate) return;
    event.preventDefault();
    openConsentPreferences();
  };

  return (
    <a
      href={affiliate ? href : "#"}
      target={affiliate ? "_blank" : undefined}
      rel={affiliate ? "noopener noreferrer sponsored nofollow" : undefined}
      className={className}
      aria-label={ariaLabel}
      title={title ?? (affiliate ? undefined : "Accept affiliate cookies to open store links")}
      onClick={blockWithoutConsent}
      onAuxClick={blockWithoutConsent}
    >
      {children}
    </a>
  );
}
