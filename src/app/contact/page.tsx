"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Building2,
  MapPin,
  Globe,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { HOME_UI } from "@/lib/i18n/ui";
import { useBrowseLocale } from "@/lib/i18n/client";
import { withLangParam } from "@/lib/seo/site-url";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
    company: "",
    privacyAccepted: false,
  });
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        delivery?: string;
        mailto?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }

      if (data.delivery === "mailto_fallback" && data.mailto) {
        window.location.href = data.mailto;
        setFeedback(homeUi.emailDeliveryFallback);
      } else {
        setFeedback(homeUi.contactMessageSent);
      }

      setSubmitState("success");
      setFormData({
        name: "",
        email: "",
        subject: "general",
        message: "",
        company: "",
        privacyAccepted: false,
      });
    } catch (error) {
      setSubmitState("error");
      setFeedback(error instanceof Error ? error.message : homeUi.somethingWentWrong);
    }
  };

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
            {homeUi.getInTouch}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">{homeUi.contactPlatformName}</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            {homeUi.contactIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{homeUi.directEmail}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{homeUi.privacyDSARRequests}</p>
              </div>
              <a
                href="mailto:admin@portanx.com"
                className="text-xs font-bold text-emerald-700 hover:underline block break-all"
              >
                admin@portanx.com
              </a>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{homeUi.operatingEntity}</h3>

              <div className="space-y-2 text-slate-600">
                <p className="font-semibold text-slate-900">{homeUi.companyLegalName}</p>
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{homeUi.companyAddress}</span>
                </p>
                <p>
                  <strong>{homeUi.uid}:</strong> CHE-373.501.736
                </p>
                <p>
                  <strong>{homeUi.hrNr}:</strong> CH-036.1.108.540-6
                </p>
                <p className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <a
                    href="https://portanx.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    https://portanx.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-1 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                {homeUi.responseTime}
              </div>
              <p className="text-emerald-900 text-[11px]">
                {homeUi.responseTimeBody}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  {homeUi.sendUsAMessage}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {homeUi.sendUsAMessageIntro}
                </p>
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`rounded-xl p-3 text-xs flex items-start gap-2 ${
                    submitState === "success"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-red-50 text-red-900 border border-red-200"
                  }`}
                >
                  {submitState === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback}</span>
                </div>
              )}

              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 mb-1">
                    {homeUi.yourName} *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={homeUi.eGCatalinPortan}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 mb-1">
                    {homeUi.emailAddress} *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={homeUi.yourEmailDomainCom}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 mb-1">
                  {homeUi.inquiryTopic}
                </label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="general">{homeUi.contactFormSubjectGeneral}</option>
                  <option value="affiliate">{homeUi.contactFormSubjectAffiliate}</option>
                  <option value="merchant">{homeUi.contactFormSubjectMerchant}</option>
                  <option value="privacy">{homeUi.contactFormSubjectPrivacy}</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 mb-1">
                  {homeUi.message} *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  minLength={10}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={homeUi.describeYourRequest}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {homeUi.iHaveReadThe}{" "}
                  <Link href={withLangParam("/privacy", browseLocale)} className="text-emerald-700 underline font-semibold">
                    {homeUi.privacyPolicy}
                  </Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitState === "loading"}
                className="w-full bg-slate-900 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {submitState === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{homeUi.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{homeUi.sendMessage}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
