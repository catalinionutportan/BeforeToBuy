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
  Globe,
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

/** BeforeToBuy.com category tree — comparison-first, not a retailer catalog clone.
 *  Depth where buyers compare prices (cameras + accessories, audio gear, tech).
 *  Unique "Before You Buy" modules highlight GPS, cross-border & local pickup value. */
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: "before-you-buy",
    label: "Before You Buy",
    labelDe: "Before You Buy",
    icon: Globe,
    description: "Cross-border savings, local pickup near you, smart accessories & refurb vs new — only on BeforeToBuy.",
    subcategories: [
      { id: "compare-cross-border", label: "Cross-Border Savings", labelDe: "Grenzüberschreitend sparen", searchKeywords: ["cross border", "import savings", "cheaper abroad", "ch vs de", "eu price", "international deal"] },
      { id: "compare-local-pickup", label: "Pick Up Near You", labelDe: "Abholung in der Nähe", searchKeywords: ["click collect", "pickup", "near me", "local store", "same day", "branch"] },
      { id: "compare-accessories", label: "Smart Accessory Picks", labelDe: "Sinnvolles Zubehör", searchKeywords: ["accessory", "spare battery", "case", "charger", "must have", "bundle", "replacement"] },
      { id: "compare-refurb", label: "Refurb vs New", labelDe: "Refurb vs Neu", searchKeywords: ["refurb", "refurbished", "renewed", "used", "second hand", "outlet"] },
    ],
  },
  {
    id: "audio",
    label: "Audio",
    labelDe: "Audio",
    icon: Headphones,
    description: "Compare headphones, speakers, Hi-Fi & studio gear across CH, DE, RO & EU stores.",
    subcategories: [
      { id: "audio-headphones", label: "Headphones & Headsets", labelDe: "Kopfhörer & Headsets", searchKeywords: ["headphone", "headset", "earphone", "airpods", "wh-1000", "bose", "sony", "sennheiser", "gaming headset"] },
      { id: "audio-speakers", label: "Speakers & Soundbars", labelDe: "Lautsprecher & Soundbars", searchKeywords: ["speaker", "soundbar", "subwoofer", "bookshelf speaker", "bluetooth speaker", "marshall", "jbl"] },
      { id: "audio-wireless", label: "Wireless & Multiroom", labelDe: "Wireless & Multiroom", searchKeywords: ["smart speaker", "multiroom", "sonos", "echo", "nest audio", "homepod", "bluesound", "whole home"] },
      { id: "audio-hifi", label: "Hi-Fi & Turntables", labelDe: "Hi-Fi & Plattenspieler", searchKeywords: ["hifi", "amplifier", "receiver", "turntable", "vinyl", "dac", "stereo"] },
      { id: "audio-portable", label: "Portable Players", labelDe: "Portable Player", searchKeywords: ["walkman", "mp3 player", "dap", "cd player", "digital audio player", "fiio"] },
      { id: "audio-car", label: "In-Car Audio", labelDe: "Car Audio", searchKeywords: ["car audio", "car speaker", "carplay", "android auto", "car amplifier", "dash stereo"] },
      { id: "audio-studio", label: "Studio, Podcast & DJ", labelDe: "Studio, Podcast & DJ", searchKeywords: ["studio monitor", "audio interface", "microphone", "podcast", "dj controller", "shure", "focusrite", "pioneer ddj"] },
      { id: "audio-accessories", label: "Cables & Spare Parts", labelDe: "Kabel & Ersatzteile", searchKeywords: ["xlr cable", "ear pads", "speaker cable", "phono cartridge", "audio adapter", "replacement parts"] },
    ],
  },
  {
    id: "office-stationery",
    label: "Office + Work",
    labelDe: "Büro + Arbeit",
    icon: Briefcase,
    description: "Compare printers, ink & toner, home office gear & office tech — where price differences actually matter.",
    subcategories: [
      { id: "office-printers", label: "Printers & Scanners", labelDe: "Drucker & Scanner", searchKeywords: ["printer", "scanner", "multifunction", "inkjet", "laser", "mfp", "epson", "hp laserjet", "brother"] },
      { id: "office-ink-toner", label: "Ink & Toner", labelDe: "Tinte & Toner", searchKeywords: ["ink", "toner", "cartridge", "druckerpatrone", "ink cartridge", "toner cartridge", "xl ink", "compatible toner"] },
      { id: "office-home", label: "Home Office & Ergonomics", labelDe: "Homeoffice & Ergonomie", searchKeywords: ["desk", "office chair", "ergonomic", "monitor arm", "standing desk", "home office", "office furniture", "lumbar"] },
      { id: "office-tech", label: "Office Technology", labelDe: "Bürotechnik", searchKeywords: ["shredder", "laminator", "label printer", "document scanner", "projector office", "calculator", "binding machine", "office equipment"] },
    ],
  },
  {
    id: "drones-electronics",
    label: "Drones + Electronics",
    labelDe: "Drohnen + Elektronik",
    icon: Plane,
    description: "Drones, RC models, action cams accessories, and smart gadgets.",
    subcategories: [
      { id: "drones-quadcopters", label: "Drones & Quadcopters", searchKeywords: ["drone", "dji mini", "dji mavic", "dji avata", "quadcopter", "fpv drone"] },
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
    description: "Compare camera bodies, lenses, batteries, flashes & pro accessories — full ecosystem, not just bodies.",
    subcategories: [
      { id: "photo-mirrorless", label: "Mirrorless Cameras", labelDe: "Systemkameras / Mirrorless", searchKeywords: ["mirrorless", "sony alpha", "canon eos r", "nikon z", "fujifilm x-t", "camera body"] },
      { id: "photo-dslr", label: "DSLR Cameras", labelDe: "Spiegelreflexkameras", searchKeywords: ["dslr", "canon eos 90d", "canon eos 5d", "nikon d850", "nikon d7500", "digital slr"] },
      { id: "photo-compact", label: "Compact & Instant Cameras", labelDe: "Kompakt- & Sofortbildkameras", searchKeywords: ["compact camera", "point and shoot", "instax", "polaroid", "ricoh gr"] },
      { id: "photo-lenses", label: "Lenses & Adapters", labelDe: "Objektive & Adapter", searchKeywords: ["lens", "objektiv", "prime lens", "zoom lens", "sigma", "tamron", "rf mount", "fe mount", "z mount", "lens adapter"] },
      { id: "photo-action", label: "Action Cameras", labelDe: "Actioncams", searchKeywords: ["gopro", "action cam", "hero", "insta360", "dji action", "osmo action"] },
      { id: "photo-video-cameras", label: "Video Cameras & Camcorders", labelDe: "Videokameras & Camcorder", searchKeywords: ["camcorder", "video camera", "vlog", "cinema camera", "sony fx", "panasonic gh"] },
      { id: "photo-flashes", label: "Flashes & Speedlights", labelDe: "Blitzgeräte & Speedlights", searchKeywords: ["flash", "speedlight", "blitz", "godox", "softbox flash", "ring flash", "hvl-f"] },
      { id: "photo-studio-lighting", label: "Studio Lighting & Continuous Light", labelDe: "Studiolicht & Dauerlicht", searchKeywords: ["studio light", "led panel", "softbox", "light stand", "continuous light", "video light"] },
      { id: "photo-batteries", label: "Batteries & Chargers", labelDe: "Akkus & Ladegeräte", searchKeywords: ["camera battery", "np-fz100", "lp-e6", "battery grip", "dual charger", "akku", "spare battery"] },
      { id: "photo-memory", label: "Memory Cards & Readers", labelDe: "Speicherkarten & Reader", searchKeywords: ["sd card", "microsd", "cfexpress", "memory card", "sandisk", "prograde", "card reader"] },
      { id: "photo-tripods", label: "Tripods & Monopods", labelDe: "Stative & Einbeinstative", searchKeywords: ["tripod", "monopod", "stativ", "manfrotto", "gitzo", "tripod head", "ball head"] },
      { id: "photo-gimbals", label: "Gimbals & Stabilizers", labelDe: "Gimbals & Stabilisatoren", searchKeywords: ["gimbal", "stabilizer", "dji rs", "ronin", "zhiyun", "smooth q"] },
      { id: "photo-bags", label: "Bags, Cases & Straps", labelDe: "Taschen, Cases & Riemen", searchKeywords: ["camera bag", "backpack", "peak design", "lowepro", "camera strap", "hard case", "fototasche"] },
      { id: "photo-filters", label: "Filters (UV, ND, CPL)", labelDe: "Filter (UV, ND, Pol)", searchKeywords: ["uv filter", "nd filter", "polarizer", "cpl filter", "variable nd", "nisi", "hoya", "lee filter"] },
      { id: "photo-microphones", label: "Video Microphones & Audio", labelDe: "Video-Mikrofone & Audio", searchKeywords: ["microphone", "videomic", "shotgun mic", "lavalier", "rode", "djl mic", "wireless mic"] },
      { id: "photo-remote", label: "Remotes & Intervalometers", labelDe: "Fernauslöser & Intervallometer", searchKeywords: ["remote control", "intervalometer", "wireless trigger", "shutter release", "fernauslöser"] },
      { id: "photo-mounts", label: "Cages, Mounts & Rig Accessories", labelDe: "Cages, Halterungen & Rig", searchKeywords: ["camera cage", "smallrig", "cold shoe", "monitor mount", "rig", "handle", "top handle"] },
      { id: "photo-cleaning", label: "Cleaning & Sensor Care", labelDe: "Reinigung & Sensorpflege", searchKeywords: ["lenspen", "cleaning kit", "sensor swab", "air blower", "lens cloth", "reinigung"] },
      { id: "photo-cables", label: "Cables, Adapters & Tethering", labelDe: "Kabel, Adapter & Tethering", searchKeywords: ["hdmi cable", "usb-c cable", "tether cable", "hdmi adapter", "capture tether"] },
      { id: "photo-binoculars", label: "Binoculars & Telescopes", labelDe: "Ferngläser & Teleskope", searchKeywords: ["binocular", "fernglas", "telescope", "stargazing", "nikon monarch"] },
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

/** Match product against category/subcategory filter — strict ID match only (no keyword bleed). */
export function productMatchesCategoryFilter(
  product: { title: string; description: string; brand: string; category: string; isFlashDeal?: boolean },
  categoryFilter: string
): boolean {
  if (!categoryFilter || categoryFilter === ALL_CATEGORIES_ID) return true;

  // Exact subcategory or module id stored on the product
  if (product.category === categoryFilter) return true;

  const parentId = getParentCategoryId(categoryFilter);
  const parentCat = parentId ? getCategoryById(parentId) : getCategoryById(categoryFilter);

  // Parent module selected → only products whose category belongs to that module
  if (parentCat && categoryFilter === parentCat.id) {
    if (product.category.startsWith(`${parentCat.id}-`)) return true;
    // Before You Buy uses compare-* ids under before-you-buy module
    if (parentCat.id === "before-you-buy" && product.category.startsWith("compare-")) return true;
    return false;
  }

  // Subcategory selected → strict match only (already checked above)
  const sub = getSubcategoryById(categoryFilter);
  if (sub) return false;

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
