import HomePageClient from "@/components/home/HomePageClient";
import { getRequestMarketCountry } from "@/lib/request-market";

export default async function Home() {
  // Do not await the catalog here. Blocking HTML on Supabase (CH lead sort +
  // counts/covers/brands) was 2–4s TTFB. Header + skeleton go out immediately;
  // HomePageClient loads `/api/products` after paint (now cached / Acer-first).
  const marketCountry = await getRequestMarketCountry();

  return <HomePageClient initialCountry={marketCountry} />;
}
