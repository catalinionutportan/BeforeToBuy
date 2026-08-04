import {
  Headphones,
  Briefcase,
  Plane,
  Camera,
  Gamepad2,
  Wifi,
  Laptop,
  Cpu,
  Mouse,
  Smartphone,
  Download,
  Tv,
  Watch,
  ChefHat,
  Tag,
  Percent,
  PackageOpen,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface ShoppingSubcategory {
  id: string;
  label: string;
  labelDe?: string;
  searchKeywords: string[];
}

export interface ShoppingCategory {
  id: string;
  label: string;
  labelDe?: string;
  icon: LucideIcon;
  description: string;
  subcategories: ShoppingSubcategory[];
  isPromo?: boolean; // Sale, Clearance, Used
}

/** Digitec/Galaxus-style shopping category tree for BeforeToBuy.com */
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: "audio",
    label: "Audio",
    labelDe: "Audio",
    icon: Headphones,
    description: "Headphones, speakers, Hi-Fi, home cinema audio, microphones & studio gear.",
    subcategories: [
      { id: "audio-headphones", label: "Headphones & Earphones", labelDe: "Kopfhörer & Ohrhörer", searchKeywords: ["headphone", "earphone", "airpods", "wh-1000", "bose", "sony"] },
      { id: "audio-speakers", label: "Speakers & Soundbars", labelDe: "Lautsprecher & Soundbars", searchKeywords: ["speaker", "soundbar", "sonos", "marshall", "bluetooth speaker"] },
      { id: "audio-hifi", label: "Hi-Fi & Stereo", labelDe: "Hi-Fi & Stereo", searchKeywords: ["hifi", "stereo", "amplifier", "receiver", "turntable"] },
      { id: "audio-home-cinema", label: "Home Cinema Audio", labelDe: "Heimkino Audio", searchKeywords: ["subwoofer", "surround", "home cinema audio", "av receiver"] },
      { id: "audio-microphones", label: "Microphones & Recording", labelDe: "Mikrofone & Recording", searchKeywords: ["microphone", "mic", "audio interface", "podcast"] },
      { id: "audio-dj-studio", label: "DJ & Studio Equipment", labelDe: "DJ & Studio Equipment", searchKeywords: ["dj", "mixer", "controller", "studio monitor"] },
      { id: "audio-car", label: "Car Audio", labelDe: "Car Audio", searchKeywords: ["car audio", "car speaker", "subwoofer car"] },
      { id: "audio-portable", label: "Portable Audio", labelDe: "Portable Audio", searchKeywords: ["portable speaker", "mp3", "walkman", "ipod"] },
      { id: "audio-cables", label: "Cables & Adapters", labelDe: "Kabel & Adapter", searchKeywords: ["audio cable", "jack", "xlr", "optical cable"] },
    ],
  },
  {
    id: "office-stationery",
    label: "Office + Stationery",
    labelDe: "Büro + Schreibwaren",
    icon: Briefcase,
    description: "Printers, office supplies, paper, pens, and workplace accessories.",
    subcategories: [
      { id: "office-printers", label: "Printers & Scanners", searchKeywords: ["printer", "scanner", "multifunction", "inkjet", "laser"] },
      { id: "office-supplies", label: "Office Supplies", searchKeywords: ["office", "stapler", "folder", "organizer"] },
      { id: "office-stationery", label: "Stationery & Writing", searchKeywords: ["pen", "notebook", "paper", "stationery"] },
      { id: "office-furniture", label: "Office Furniture", searchKeywords: ["desk", "chair", "office furniture", "monitor arm"] },
    ],
  },
  {
    id: "drones-electronics",
    label: "Drones + Electronics",
    labelDe: "Drohnen + Elektronik",
    icon: Plane,
    description: "Drones, RC models, action cams accessories, and smart gadgets.",
    subcategories: [
      { id: "drones-quadcopters", label: "Drones & Quadcopters", searchKeywords: ["drone", "dji", "quadcopter", "fpv"] },
      { id: "drones-accessories", label: "Drone Accessories", searchKeywords: ["drone battery", "propeller", "drone case"] },
      { id: "drones-rc", label: "RC Models & Toys", searchKeywords: ["rc car", "remote control", "rc model"] },
      { id: "drones-gadgets", label: "Smart Gadgets", searchKeywords: ["gadget", "smart home gadget", "tracker"] },
    ],
  },
  {
    id: "photo-video",
    label: "Photo + Video",
    labelDe: "Foto + Video",
    icon: Camera,
    description: "Cameras, lenses, action cams, tripods, and photography accessories.",
    subcategories: [
      { id: "photo-cameras", label: "Cameras & Lenses", searchKeywords: ["camera", "lens", "mirrorless", "dslr", "canon", "nikon"] },
      { id: "photo-action", label: "Action Cameras", searchKeywords: ["gopro", "action cam", "hero", "insta360"] },
      { id: "photo-video-cameras", label: "Video Cameras", searchKeywords: ["camcorder", "video camera", "vlog"] },
      { id: "photo-accessories", label: "Tripods & Accessories", searchKeywords: ["tripod", "gimbal", "memory card", "camera bag"] },
    ],
  },
  {
    id: "gaming-vr",
    label: "Gaming + VR",
    labelDe: "Gaming + VR",
    icon: Gamepad2,
    description: "Consoles, games, VR headsets, gaming chairs, and accessories.",
    subcategories: [
      { id: "gaming-consoles", label: "Consoles", searchKeywords: ["playstation", "ps5", "xbox", "nintendo switch", "console"] },
      { id: "gaming-vr", label: "VR Headsets", searchKeywords: ["vr", "meta quest", "virtual reality", "psvr"] },
      { id: "gaming-pc-handheld", label: "Handheld Gaming PCs", searchKeywords: ["rog ally", "steam deck", "handheld gaming"] },
      { id: "gaming-accessories", label: "Controllers & Accessories", searchKeywords: ["controller", "gaming headset", "gaming chair", "joystick"] },
      { id: "gaming-games", label: "Games & Gift Cards", searchKeywords: ["game", "gift card", "playstation store"] },
    ],
  },
  {
    id: "networking",
    label: "Networking",
    labelDe: "Netzwerk",
    icon: Wifi,
    description: "Routers, Wi-Fi mesh, switches, NAS, and network accessories.",
    subcategories: [
      { id: "networking-routers", label: "Routers & Mesh Wi-Fi", searchKeywords: ["router", "mesh", "wifi", "wi-fi 6", "wlan"] },
      { id: "networking-switches", label: "Switches & Hubs", searchKeywords: ["switch", "network switch", "hub"] },
      { id: "networking-nas", label: "NAS & Storage", searchKeywords: ["nas", "synology", "network storage"] },
      { id: "networking-cables", label: "Cables & Adapters", searchKeywords: ["ethernet", "lan cable", "patch cable", "powerline"] },
    ],
  },
  {
    id: "notebooks-pcs",
    label: "Notebooks + PCs",
    labelDe: "Notebooks + PCs",
    icon: Laptop,
    description: "Laptops, desktops, all-in-ones, monitors, and Apple Mac.",
    subcategories: [
      { id: "notebooks-laptops", label: "Laptops & Notebooks", searchKeywords: ["macbook", "laptop", "notebook", "ultrabook", "dell xps"] },
      { id: "notebooks-desktops", label: "Desktop PCs", searchKeywords: ["desktop", "pc tower", "imac", "mac mini", "mac studio"] },
      { id: "notebooks-monitors", label: "Monitors", searchKeywords: ["monitor", "display", "4k monitor", "ultrawide"] },
      { id: "notebooks-tablets-pc", label: "Tablets (PC)", searchKeywords: ["ipad", "surface", "tablet pc"] },
    ],
  },
  {
    id: "pc-components",
    label: "PC Components",
    labelDe: "PC Komponenten",
    icon: Cpu,
    description: "CPUs, GPUs, RAM, SSDs, motherboards, cases, and cooling.",
    subcategories: [
      { id: "pc-gpu", label: "Graphics Cards (GPU)", searchKeywords: ["rtx", "radeon", "graphics card", "gpu"] },
      { id: "pc-cpu", label: "Processors (CPU)", searchKeywords: ["intel core", "amd ryzen", "processor", "cpu"] },
      { id: "pc-ram-ssd", label: "RAM & SSD Storage", searchKeywords: ["ram", "ddr5", "ssd", "nvme", "hard drive"] },
      { id: "pc-motherboard", label: "Motherboards & Cases", searchKeywords: ["motherboard", "pc case", "power supply", "psu"] },
      { id: "pc-cooling", label: "Cooling & Fans", searchKeywords: ["cpu cooler", "fan", "liquid cooling", "aio"] },
    ],
  },
  {
    id: "peripherals",
    label: "Peripherals",
    labelDe: "Peripherie",
    icon: Mouse,
    description: "Keyboards, mice, webcams, printers, and PC accessories.",
    subcategories: [
      { id: "peripherals-keyboard-mouse", label: "Keyboards & Mice", searchKeywords: ["keyboard", "mouse", "mx master", "mechanical keyboard"] },
      { id: "peripherals-webcam", label: "Webcams & Streaming", searchKeywords: ["webcam", "streaming", "capture card"] },
      { id: "peripherals-storage", label: "External Storage", searchKeywords: ["external ssd", "usb drive", "hard drive external"] },
      { id: "peripherals-accessories", label: "PC Accessories", searchKeywords: ["usb hub", "dock", "laptop stand", "cable"] },
    ],
  },
  {
    id: "smartphones-tablets",
    label: "Smartphones + Tablets",
    labelDe: "Smartphones + Tablets",
    icon: Smartphone,
    description: "Mobile phones, tablets, smartwatches (phones), and mobile accessories.",
    subcategories: [
      { id: "mobile-smartphones", label: "Smartphones", searchKeywords: ["iphone", "samsung galaxy", "smartphone", "pixel", "xiaomi"] },
      { id: "mobile-tablets", label: "Tablets", searchKeywords: ["ipad", "galaxy tab", "tablet"] },
      { id: "mobile-accessories", label: "Cases & Chargers", searchKeywords: ["phone case", "charger", "power bank", "screen protector"] },
      { id: "mobile-smartwatch-phone", label: "Smartwatch (Mobile)", searchKeywords: ["apple watch", "galaxy watch", "fitbit"] },
    ],
  },
  {
    id: "software",
    label: "Software Solutions",
    labelDe: "Software",
    icon: Download,
    description: "Operating systems, antivirus, office suites, and digital licenses.",
    subcategories: [
      { id: "software-os", label: "Operating Systems", searchKeywords: ["windows", "microsoft office", "os license"] },
      { id: "software-security", label: "Antivirus & Security", searchKeywords: ["antivirus", "norton", "kaspersky", "vpn"] },
      { id: "software-creative", label: "Creative & Productivity", searchKeywords: ["adobe", "photoshop", "creative cloud"] },
    ],
  },
  {
    id: "tv-home-cinema",
    label: "TV + Home Cinema",
    labelDe: "TV + Heimkino",
    icon: Tv,
    description: "Televisions, projectors, streaming devices, and TV mounts.",
    subcategories: [
      { id: "tv-televisions", label: "Televisions", searchKeywords: ["tv", "oled", "qled", "samsung tv", "lg oled"] },
      { id: "tv-projectors", label: "Projectors", searchKeywords: ["projector", "beamer", "home cinema projector"] },
      { id: "tv-streaming", label: "Streaming Devices", searchKeywords: ["apple tv", "chromecast", "fire stick", "roku"] },
      { id: "tv-mounts", label: "TV Mounts & Accessories", searchKeywords: ["tv mount", "hdmi", "tv stand", "soundbar mount"] },
    ],
  },
  {
    id: "wearables",
    label: "Wearables",
    labelDe: "Wearables",
    icon: Watch,
    description: "Smartwatches, fitness trackers, and wearable accessories.",
    subcategories: [
      { id: "wearables-smartwatch", label: "Smartwatches", searchKeywords: ["apple watch", "garmin", "smartwatch", "galaxy watch"] },
      { id: "wearables-fitness", label: "Fitness Trackers", searchKeywords: ["fitbit", "fitness tracker", "whoop", "oura"] },
      { id: "wearables-accessories", label: "Bands & Accessories", searchKeywords: ["watch band", "watch strap", "wearable accessory"] },
    ],
  },
  {
    id: "home-kitchen",
    label: "Home + Kitchen",
    labelDe: "Haushalt + Küche",
    icon: ChefHat,
    description: "Appliances, vacuum cleaners, coffee machines, and kitchen gadgets.",
    subcategories: [
      { id: "home-appliances", label: "Home Appliances", searchKeywords: ["dyson", "vacuum", "robot vacuum", "roomba", "miele"] },
      { id: "home-kitchen", label: "Kitchen & Coffee", searchKeywords: ["coffee", "nespresso", "kitchenaid", "air fryer", "ninja"] },
      { id: "home-personal-care", label: "Personal Care", searchKeywords: ["shaver", "braun", "hair dryer", "oral-b"] },
      { id: "home-smart-home", label: "Smart Home", searchKeywords: ["smart home", "philips hue", "thermostat", "smart plug"] },
    ],
  },
  {
    id: "sale",
    label: "Sale",
    labelDe: "Sale",
    icon: Tag,
    description: "Current promotional deals and discounted offers across all stores.",
    isPromo: true,
    subcategories: [
      { id: "sale-flash", label: "Flash Deals", searchKeywords: ["deal", "sale", "discount"] },
      { id: "sale-weekly", label: "Weekly Offers", searchKeywords: ["offer", "promo", "reduced"] },
    ],
  },
  {
    id: "clearance",
    label: "Clearance",
    labelDe: "Abverkauf",
    icon: Percent,
    description: "End-of-line and clearance stock at reduced prices.",
    isPromo: true,
    subcategories: [
      { id: "clearance-electronics", label: "Clearance Electronics", searchKeywords: ["clearance", "outlet"] },
      { id: "clearance-home", label: "Clearance Home", searchKeywords: ["clearance home"] },
    ],
  },
  {
    id: "used",
    label: "Used",
    labelDe: "Occasion / Refurbished",
    icon: PackageOpen,
    description: "Refurbished and second-hand products with warranty options.",
    isPromo: true,
    subcategories: [
      { id: "used-refurbished", label: "Refurbished", searchKeywords: ["refurbished", "renewed", "grade a"] },
      { id: "used-secondhand", label: "Second-Hand", searchKeywords: ["used", "second hand", "occasion"] },
    ],
  },
];

export const ALL_CATEGORIES_ID = "all";

export function getCategoryById(categoryId: string): ShoppingCategory | undefined {
  return SHOPPING_CATEGORIES.find((c) => c.id === categoryId);
}

export function getSubcategoryById(subcategoryId: string): ShoppingSubcategory | undefined {
  for (const cat of SHOPPING_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    if (sub) return sub;
  }
  return undefined;
}

export function getParentCategoryId(categoryOrSubId: string): string | null {
  if (categoryOrSubId === ALL_CATEGORIES_ID) return null;
  const direct = getCategoryById(categoryOrSubId);
  if (direct) return direct.id;
  for (const cat of SHOPPING_CATEGORIES) {
    if (cat.subcategories.some((s) => s.id === categoryOrSubId)) {
      return cat.id;
    }
  }
  return null;
}

/** Match product text against category/subcategory filter */
export function productMatchesCategoryFilter(
  product: { title: string; description: string; brand: string; category: string; isFlashDeal?: boolean },
  categoryFilter: string
): boolean {
  if (!categoryFilter || categoryFilter === ALL_CATEGORIES_ID) return true;

  // Direct product category match (exact id on product)
  if (product.category === categoryFilter) return true;

  const parentId = getParentCategoryId(categoryFilter);
  const parentCat = parentId ? getCategoryById(parentId) : getCategoryById(categoryFilter);

  // Parent module selected → match any product in that module or its subcategories
  if (parentCat && categoryFilter === parentCat.id) {
    if (product.category === parentCat.id) return true;
    if (product.category.startsWith(`${parentCat.id}-`)) return true;
    // Keyword fallback for parent module
    const allKeywords = parentCat.subcategories.flatMap((s) => s.searchKeywords);
    const text = `${product.title} ${product.description} ${product.brand}`.toLowerCase();
    return allKeywords.some((kw) => text.includes(kw.toLowerCase()));
  }

  // Subcategory selected
  const sub = getSubcategoryById(categoryFilter);
  if (sub) {
    if (product.category === sub.id) return true;
    const text = `${product.title} ${product.description} ${product.brand}`.toLowerCase();
    return sub.searchKeywords.some((kw) => text.includes(kw.toLowerCase()));
  }

  // Promo categories
  if (categoryFilter === "sale" || categoryFilter.startsWith("sale-")) {
    return Boolean(product.isFlashDeal) || product.title.toLowerCase().includes("deal");
  }
  if (categoryFilter === "clearance" || categoryFilter.startsWith("clearance-")) {
    return product.title.toLowerCase().includes("clearance") || Boolean(product.isFlashDeal);
  }
  if (categoryFilter === "used" || categoryFilter.startsWith("used-")) {
    return product.title.toLowerCase().includes("refurb") || product.description.toLowerCase().includes("refurb");
  }

  return false;
}

export function getCategoryLabel(categoryId: string): string {
  if (categoryId === ALL_CATEGORIES_ID) return "All Categories";
  const sub = getSubcategoryById(categoryId);
  if (sub) return sub.label;
  const cat = getCategoryById(categoryId);
  return cat?.label ?? categoryId;
}

/** Flat list for sitemap / SEO */
export function getAllCategoryPaths(): { module: string; sub?: string }[] {
  const paths: { module: string; sub?: string }[] = [];
  for (const cat of SHOPPING_CATEGORIES) {
    paths.push({ module: cat.id });
    for (const sub of cat.subcategories) {
      paths.push({ module: cat.id, sub: sub.id });
    }
  }
  return paths;
}

export const CATEGORY_ALL_OPTION = {
  id: ALL_CATEGORIES_ID,
  label: "All Categories",
  labelDe: "Alle Kategorien",
  icon: Layers,
};
