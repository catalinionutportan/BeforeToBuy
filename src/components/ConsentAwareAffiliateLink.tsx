"use client";

import type { ReactNode } from "react";
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

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored nofollow"
      className={className}
      aria-label={ariaLabel}
      title={title ?? (affiliate ? undefined : "Accept affiliate cookies to open store links")}
      onClick={(event) => {
        if (!affiliate) {
          event.preventDefault();
          openConsentPreferences();
        }
      }}
    >
      {children}
    </a>
  );
}
