import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, Database, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy | BeforeToBuy.com",
  description: "How BeforeToBuy.com uses cookies, local storage, and similar technologies.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Cookie Policy
          </span>
          <h1 className="text-3xl font-extrabold">Cookie & Storage Policy</h1>
          <p className="text-slate-300 text-sm">
            Last updated: August 2026 — BeforeToBuy.com (PortanX - Catalin Portan, Switzerland)
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-600" />
              1. What we use
            </h2>
            <p className="text-xs text-slate-600">
              BeforeToBuy.com is a comparison demo. We do not run advertising cookies on our domain. We use browser local storage to display your choices and a signed, HttpOnly essential cookie so optional location APIs can verify those choices server-side.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              2. Categories
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left p-3 font-bold">Category</th>
                    <th className="text-left p-3 font-bold">Purpose</th>
                    <th className="text-left p-3 font-bold">Storage</th>
                    <th className="text-left p-3 font-bold">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold">Essential</td>
                    <td className="p-3">Consent preferences (required to remember your choices)</td>
                    <td className="p-3">localStorage (<code className="text-[10px]">b2b_consent_v3</code>) plus signed HttpOnly cookie (<code className="text-[10px]">b2b_consent</code>), up to 180 days</td>
                    <td className="p-3">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Location (optional)</td>
                    <td className="p-3">Approximate country/city via IP lookup or GPS reverse geocoding</td>
                    <td className="p-3">Session only — not persisted as a profile</td>
                    <td className="p-3">No — only with consent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Affiliate (optional)</td>
                    <td className="p-3">Enable outbound merchant links; partner stores may set their own cookies</td>
                    <td className="p-3">Third-party on merchant domains after you leave our site</td>
                    <td className="p-3">No — only with consent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Analytics (optional)</td>
                    <td className="p-3">Datadog RUM performance monitoring to improve stability (session replay off)</td>
                    <td className="p-3">Datadog browser SDK when opted in; preference stored in consent localStorage</td>
                    <td className="p-3">No — only with consent (off by default)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              3. Third-party processors (when consented)
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li><strong>Vercel</strong> — hosting, CDN, server logs</li>
              <li><strong>ipapi.co</strong> — approximate IP geolocation (Location consent)</li>
              <li><strong>OpenStreetMap Nominatim</strong> — reverse geocoding (Location consent)</li>
              <li><strong>Datadog</strong> — optional RUM / performance monitoring (Analytics consent)</li>
              <li><strong>Merchant partners</strong> — Amazon, Digitec Galaxus, MediaMarkt, eMAG, etc. (Affiliate consent, on their domains)</li>
              <li><strong>Resend</strong> — contact form email delivery (when configured)</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">4. Manage your choices</h2>
            <p className="text-xs text-slate-600">
              You can change or withdraw consent at any time using the cookie banner or the &quot;Cookie Settings&quot; link in the site footer. Withdrawing consent stops optional location lookups, analytics monitoring, and blocks affiliate outbound links until you accept again.
            </p>
            <p className="text-xs text-slate-600">
              See also our{" "}
              <Link href="/privacy" className="text-emerald-700 underline font-semibold">
                Privacy Policy
              </Link>{" "}
              for data subject rights (DSAR).
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
