import type { ComponentPropsWithoutRef } from "react";
import { COMPANY } from "@/lib/company-info";

type CompanyEmailLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href">;

/**
 * Keeps Cloudflare email obfuscation from rewriting the server HTML and
 * causing a React hydration mismatch while preserving a working mail link.
 */
export function CompanyEmailLink({ children, ...props }: CompanyEmailLinkProps) {
  const [localPart, domain] = COMPANY.email.split("@");

  return (
    <a {...props} href={`mailto:${localPart}%40${domain}`}>
      {children}
      <span>
        <span>{localPart}</span>
        <span>@</span>
        <span>{domain}</span>
      </span>
    </a>
  );
}
