import { SiteNav } from "@/components/SiteNav";

interface PageShellProps {
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function PageShell({
  children,
  maxWidthClass = "max-w-4xl",
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteNav />
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 ${maxWidthClass}`}>
        {children}
      </main>
    </div>
  );
}
