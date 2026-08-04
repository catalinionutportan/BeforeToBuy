import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Platform Status | BeforeToBuy.com",
  description: "Operational status and health checks for BeforeToBuy.com.",
  path: "/status",
});

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
