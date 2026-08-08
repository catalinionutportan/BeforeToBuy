import { SiteNav } from "@/components/SiteNav";

interface PageShellProps {
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function PageShell({
  children,
  maxWidthClass = "max-w-7xl",
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteNav />
      <main className={`mx-auto w-full flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 ${maxWidthClass}`}>
        {children}
      </main>
    </div>
  );
}
