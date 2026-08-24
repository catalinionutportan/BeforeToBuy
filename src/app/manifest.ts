import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company-info";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY.platformName,
    short_name: "BeforeToBuy",
    description:
      "Compare prices from partner stores. Checkout stays on the merchant site. Operated in Bern by PortanX.",
    start_url: "/",
    display: "browser",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/beforetobuy-mark.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/beforetobuy-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
