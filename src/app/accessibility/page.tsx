import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Eye, Keyboard, Monitor } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { createPageMetadata } from "@/lib/metadata";
import { COMPANY, LEGAL_CONTACT } from "@/lib/company-info";

export const metadata: Metadata = createPageMetadata({
  title: "Accessibility Statement | BeforeToBuy.com",
  description: "Accessibility statement for BeforeToBuy.com — conformance goals, known limitations, and feedback contact.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
            Accessibility
          </span>
          <h1 className="text-3xl font-extrabold">Accessibility Statement</h1>
          <p className="text-slate-300 text-sm">
            Our commitment to making {COMPANY.platformName} usable for as many people as possible.
          </p>
        </div>

        <LegalDraftNotice />

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Conformance goal
            </h2>
            <p className="text-xs text-slate-600">
              We aim to conform to <strong>WCAG 2.1 Level AA</strong> where reasonably practicable for a Beta/Demo platform.
              This is an ongoing effort, not a formal certification.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Measures implemented
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>Semantic HTML landmarks (header, main, footer, nav)</li>
              <li>Keyboard-accessible modals with Escape to close</li>
              <li>Form labels associated with inputs (contact page)</li>
              <li>Search and filter controls with accessible names</li>
              <li>Cookie consent dialog with dialog semantics</li>
              <li>Responsive layout for mobile and desktop viewports</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              Known limitations (Beta)
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li>Some merchant product images rely on third-party sources without full alt-text control</li>
              <li>Color contrast and focus indicators are being improved incrementally</li>
              <li>Live price updates may cause layout shifts during loading</li>
              <li>Third-party merchant sites linked from our platform have their own accessibility standards</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            <p className="text-xs text-slate-600">
              If you encounter accessibility barriers, please contact{" "}
              <a href={`mailto:${LEGAL_CONTACT.complaints}`} className="text-emerald-700 underline font-semibold">
                {LEGAL_CONTACT.complaints}
              </a>{" "}
              with the page URL and a description of the issue. We will endeavour to respond within 30 days.
            </p>
            <p className="text-xs text-slate-600">
              See also{" "}
              <Link href="/help" className="text-emerald-700 underline font-semibold">
                Help & FAQ
              </Link>{" "}
              and{" "}
              <Link href="/complaints" className="text-emerald-700 underline font-semibold">
                Complaints Procedure
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
