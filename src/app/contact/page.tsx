"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Building2,
  MapPin,
  Globe,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to BeforeToBuy.com
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Contact & Support
          </span>
        </div>

        {/* Header */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-block">
            Get in Touch
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Contact BeforeToBuy.com</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Have questions about price comparison, merchant API integration, affiliate partnerships, or user feedback? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Details Column */}
          <div className="space-y-6">
            
            {/* Direct Email Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Direct Email</h3>
                <p className="text-xs text-slate-500 mt-0.5">Primary contact email</p>
              </div>
              <a
                href="mailto:admin@portanx.com"
                className="text-xs font-bold text-emerald-700 hover:underline block break-all"
              >
                admin@portanx.com
              </a>
            </div>

            {/* Operating Entity Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Operating Entity</h3>
              
              <div className="space-y-2 text-slate-600">
                <p className="font-semibold text-slate-900">PortanX - Catalin Portan</p>
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Flurstrasse 24<br />CH-3014 Bern, Switzerland</span>
                </p>
                <p><strong>UID:</strong> CHE-373.501.736</p>
                <p><strong>HR-Nr:</strong> CH-036.1.108.540-6</p>
                <p className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <a href="https://portanx.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                    https://portanx.com
                  </a>
                </p>
              </div>
            </div>

            {/* Response Time Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-1 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Response Time
              </div>
              <p className="text-emerald-900 text-[11px]">
                We respond to all merchant and user inquiries within 24–48 business hours.
              </p>
            </div>

          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you for reaching out to BeforeToBuy.com. We have received your message and will get back to you shortly at <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", subject: "general", message: "" });
                  }}
                  className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Send Us a Message
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Fill in the details below to contact PortanX team.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Catalin Portan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@domain.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all cursor-pointer"
                  >
                    <option value="general">General Inquiry / User Feedback</option>
                    <option value="affiliate">Affiliate & Partner Network Inquiry (AWIN / Amazon / Galaxus)</option>
                    <option value="merchant">Merchant Feed Integration / Product Listings</option>
                    <option value="privacy">Data Privacy & Legal Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your request or question in detail..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
