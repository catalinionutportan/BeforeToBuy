import {
  Headphones,
  Briefcase,
  Plane,
  Bike,
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
  Shirt,
  Hammer,
  Flower2,
  Armchair,
  BedDouble,
  Wrench,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { MARKET_HUB_LEAF_GROUPS, getMarketHubById } from "@/lib/market-hubs";
import { resolveAutoLeafFromTitle } from "@/lib/reifen-wheel-split";

export interface ShoppingSubcategory {
  id: string;
  label: string;
  labelDe?: string;
  searchKeywords: string[];
  /** Optional third menu level (e.g. Fashion → Shoes → Sneakers). */
  children?: ShoppingSubcategory[];
}

/** Flatten mid-level nodes and their descendants (includes the mid nodes themselves). */
export function walkSubcategories(subs: ShoppingSubcategory[]): ShoppingSubcategory[] {
  const out: ShoppingSubcategory[] = [];
  for (const sub of subs) {
    out.push(sub);
    if (sub.children?.length) out.push(...walkSubcategories(sub.children));
  }
  return out;
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

/** BeforeToBuy.com category tree — comparison-first, not a retailer catalog clone. */
const LEGACY_SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: "before-you-buy",
    label: "Before You Buy",
    labelDe: "Before You Buy",
    icon: Globe,
    description: "Cross-border savings, smart accessories and refurbished versus new products.",
    subcategories: [
      { id: "compare-cross-border", label: "Cross-Border Savings", labelDe: "Grenzüberschreitend sparen", searchKeywords: ["cross border", "import savings", "cheaper abroad", "ch vs de", "eu price", "international deal"] },
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
      { id: "office-home", label: "Home Office & Ergonomics", labelDe: "Homeoffice & Ergonomie", searchKeywords: ["office chair", "monitor arm", "standing desk", "home office", "office furniture", "büromöbel"] },
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
      {
        id: "mobile-smartphones",
        label: "Smartphones",
        // Keep brand-only tokens out — "xiaomi" / "pixel" match printers & cameras.
        searchKeywords: ["iphone", "samsung galaxy", "smartphone", "telefon mobil"],
      },
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

function legacySubcategory(id: string): ShoppingSubcategory {
  for (const category of LEGACY_SHOPPING_CATEGORIES) {
    const subcategory = category.subcategories.find((item) => item.id === id);
    if (subcategory) return subcategory;
  }
  throw new Error(`Missing legacy subcategory: ${id}`);
}

function legacySubcategories(ids: string[]): ShoppingSubcategory[] {
  return ids.map(legacySubcategory);
}

const subcategory = (
  id: string,
  label: string,
  labelDe: string,
  searchKeywords: string[],
  children?: ShoppingSubcategory[]
): ShoppingSubcategory => ({
  id,
  label,
  labelDe,
  searchKeywords,
  ...(children && children.length > 0 ? { children } : {}),
});

/**
 * Canonical comparison taxonomy v2.
 *
 * It is intentionally retailer-neutral: products belong to assignable product
 * types, while promotions, condition and cross-border status are offer
 * facets or curated collections.
 */
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: "electronics",
    label: "Electronics",
    labelDe: "Elektronik",
    icon: Smartphone,
    description: "Phones, tablets, computers, audio, TV, wearables and everyday consumer electronics.",
    subcategories: [
      // Usage order: phone → tablet → laptop → PC → audio → peripherals → watch/radio/TV → rest
      ...legacySubcategories(["mobile-smartphones"]),
      subcategory("mobile-feature-phones", "Feature Phones", "Mobiltelefone", ["feature phone", "senior phone", "mobile phone"]),
      subcategory("mobile-fixed-line", "Fixed-Line Phones", "Festnetztelefone", ["landline", "dect", "fixed-line phone", "festnetz"]),
      ...legacySubcategories(["mobile-tablets", "notebooks-tablets-pc", "notebooks-laptops", "notebooks-desktops"]),
      ...legacySubcategories(["pc-gpu", "pc-cpu", "pc-ram-ssd", "pc-motherboard", "pc-cooling"]),
      subcategory("pc-power-supplies", "Power Supplies", "Netzteile", ["power supply", "psu", "netzteil"]),
      subcategory("pc-cases", "PC Cases", "PC-Gehäuse", ["pc case", "computer case", "gehäuse"]),
      // Software sits with home PC / computers
      ...legacySubcategories(["software-os", "software-security", "software-creative"]),
      subcategory("software-office", "Office Software", "Office-Software", ["office software", "microsoft 365"]),
      subcategory("software-utilities", "Utilities", "Dienstprogramme", ["utility software", "backup software", "pdf software"]),
      subcategory("digital-gift-cards", "Digital Gift Cards", "Digitale Geschenkkarten", ["digital gift card", "store credit"]),
      ...legacySubcategories([
        "audio-headphones",
        "audio-speakers",
        "audio-wireless",
        "audio-hifi",
        "audio-portable",
        "audio-car",
        "audio-studio",
        "audio-accessories",
        "peripherals-keyboard-mouse",
        "peripherals-webcam",
        "peripherals-storage",
        "peripherals-accessories",
        "notebooks-monitors",
      ]),
      subcategory("computers-ereaders", "E-Readers", "E-Book-Reader", ["e-reader", "ereader", "kindle", "kobo"]),
      subcategory("computers-docks", "Docks & Computer Accessories", "Docks & Computerzubehör", ["dock", "docking station", "laptop stand", "usb hub"]),
      ...legacySubcategories(["wearables-smartwatch", "wearables-fitness", "wearables-accessories"]),
      subcategory("mobile-navigation-radio", "Navigation & Radio", "Navigation + Funk", ["navigation device", "sat nav", "walkie talkie", "funkgerät", "radio"]),
      ...legacySubcategories(["tv-televisions", "tv-projectors", "tv-streaming", "tv-mounts"]),
      subcategory("tv-screens", "Projection Screens", "Leinwände", ["projector screen", "projection screen", "leinwand"]),
      subcategory("tv-home-cinema-systems", "Home Cinema Systems", "Heimkino-Systeme", ["home cinema", "home theater", "av receiver"]),
      ...legacySubcategories([
        "gaming-consoles",
        "gaming-vr",
        "gaming-pc-handheld",
        "gaming-accessories",
        "gaming-games",
        "mobile-accessories",
        "networking-routers",
        "networking-switches",
        "networking-nas",
        "networking-cables",
        "home-smart-home",
      ]),
      subcategory("smart-home-lighting", "Smart Lighting & Plugs", "Smart Lighting + Stecker", ["smart light", "smart bulb", "smart plug", "philips hue"]),
      subcategory("smart-home-security", "Smart Security", "Smart Security", ["security camera", "video doorbell", "alarm system"]),
      subcategory("smart-home-climate", "Smart Climate Controls", "Smart Klima-Steuerung", ["smart thermostat", "climate control", "heating control"]),
      ...legacySubcategories(["office-printers", "office-ink-toner", "office-home", "office-tech"]),
      subcategory("office-conferencing", "Telephony & Conferencing", "Telefonie + Konferenzen", ["conference phone", "video conference", "speakerphone"]),
      subcategory("office-presentation", "Presentation Equipment", "Präsentationstechnik", ["presentation", "interactive display", "presenter"]),
      subcategory("gaming-simulation", "Simulation Gear", "Simulations-Zubehör", ["racing wheel", "flight stick", "sim racing"]),
      subcategory("gaming-furniture", "Gaming Furniture", "Gaming-Möbel", ["gaming chair", "gaming desk"]),
      ...legacySubcategories([
        "photo-mirrorless",
        "photo-dslr",
        "photo-compact",
        "photo-lenses",
        "photo-action",
        "photo-video-cameras",
        "photo-flashes",
        "photo-studio-lighting",
        "photo-batteries",
        "photo-memory",
        "photo-tripods",
        "photo-gimbals",
        "photo-bags",
        "photo-filters",
        "photo-microphones",
        "photo-remote",
        "photo-mounts",
        "photo-cleaning",
        "photo-cables",
        "photo-binoculars",
        "drones-quadcopters",
        "drones-accessories",
        "drones-rc",
        "drones-gadgets",
      ]),
    ],
  },
  {
    id: "fashion-lifestyle",
    label: "Fashion",
    labelDe: "Fashion",
    icon: Shirt,
    description:
      "Women / men / kids and shoes open into finer types; personal care sits further down.",
    subcategories: [
      subcategory(
        "fashion-women",
        "Women's Clothing",
        "Damenmode",
        ["women", "lady", "dama", "femei"],
        [
          subcategory("fashion-women-dresses", "Dresses", "Kleider", ["dress", "rochie", "kleid"]),
          subcategory("fashion-women-tops", "Tops & Blouses", "Tops + Blusen", ["blouse", "top", "shirt women", "bluză"]),
          subcategory("fashion-women-bottoms", "Trousers & Skirts", "Hosen + Röcke", ["skirt", "trousers women", "pantaloni damă", "fustă"]),
          subcategory("fashion-women-outerwear", "Jackets & Coats", "Jacken + Mäntel", ["coat", "jacket women", "palton", "geacă damă"]),
          subcategory("fashion-women-activewear", "Activewear", "Sportbekleidung Damen", ["leggings", "sports bra", "activewear women"]),
        ]
      ),
      subcategory(
        "fashion-men",
        "Men's Clothing",
        "Herrenmode",
        ["men's", "menswear", "barbati", "bărbați", "for men", "herren"],
        [
          subcategory("fashion-men-shirts", "Shirts & Polos", "Hemden + Polos", ["shirt men", "polo", "cămașă", "camasa"]),
          subcategory("fashion-men-pants", "Trousers & Jeans", "Hosen + Jeans", ["jeans", "trousers men", "pantaloni bărbați"]),
          subcategory("fashion-men-outerwear", "Jackets & Coats", "Jacken + Mäntel Herren", ["jacket men", "coat men", "geacă bărbați", "hanorac"]),
          subcategory("fashion-men-activewear", "Activewear", "Sportbekleidung Herren", ["tracksuit", "activewear men", "training men"]),
        ]
      ),
      subcategory(
        "fashion-kids",
        "Kids Clothing",
        "Kindermode",
        ["kids", "children", "copii"],
        [
          subcategory("fashion-kids-girls", "Girls", "Mädchen", ["girl", "fetițe", "fetite", "mädchen"]),
          subcategory("fashion-kids-boys", "Boys", "Jungen", ["boy", "băieți", "baieti", "jungen"]),
          subcategory("fashion-kids-baby", "Baby Clothes", "Babykleidung", [
            "baby clothes",
            "body bebeluși",
            "bebelus",
            "babybekleidung",
            "babykleidung",
            "strampler",
            "baby body",
          ]),
        ]
      ),
      subcategory("fashion-apparel", "Apparel", "Bekleidung", ["hoodie", "apparel", "haine"]),
      subcategory(
        "fashion-shoes",
        "Shoes",
        "Schuhe",
        ["shoe", "pantofi"],
        [
          subcategory(
            "fashion-shoes-women",
            "Women's Shoes",
            "Damenschuhe",
            ["women shoes", "pantofi damă", "pantofi dama"],
            [
              subcategory("fashion-shoes-sneakers", "Sneakers", "Sneaker", ["sneaker", "trainer", "adidași", "women sneaker"]),
              subcategory("fashion-shoes-boots", "Boots", "Stiefel", ["boot", "ghete", "cizme", "women boot"]),
              subcategory("fashion-shoes-sandals", "Sandals & Flip-Flops", "Sandalen", ["sandal", "flip flop", "sandale"]),
              subcategory("fashion-shoes-formal", "Formal Shoes", "Businessschuhe", ["oxford", "loafer", "formal shoe", "pantofi eleganți"]),
              subcategory("fashion-shoes-sport", "Sports Shoes", "Sportschuhe", ["running shoe", "pantofi sport damă"]),
              subcategory("fashion-shoes-home", "Slippers & Home", "Hausschuhe", ["slipper", "papuci casă", "papuci casa"]),
            ]
          ),
          subcategory(
            "fashion-shoes-men",
            "Men's Shoes",
            "Herrenschuhe",
            ["men shoes", "pantofi bărbați", "pantofi barbati"],
            [
              subcategory("fashion-shoes-men-sneakers", "Sneakers", "Sneaker Herren", ["men sneaker", "adidași bărbați"]),
              subcategory("fashion-shoes-men-boots", "Boots", "Stiefel Herren", ["men boot", "ghete bărbați"]),
              subcategory("fashion-shoes-men-sandals", "Sandals & Flip-Flops", "Sandalen Herren", ["men sandal", "sandale bărbați"]),
              subcategory("fashion-shoes-men-formal", "Formal Shoes", "Businessschuhe Herren", ["men oxford", "pantofi eleganti barbati"]),
              subcategory("fashion-shoes-men-sport", "Sports Shoes", "Sportschuhe Herren", ["men running", "pantofi sport bărbați"]),
              subcategory("fashion-shoes-men-home", "Slippers & Home", "Hausschuhe Herren", ["men slipper", "papuci bărbați"]),
            ]
          ),
          subcategory(
            "fashion-shoes-kids",
            "Kids Shoes",
            "Kinderschuhe",
            ["kids shoes", "pantofi copii", "children shoes"],
            [
              subcategory("fashion-shoes-kids-sneakers", "Sneakers", "Sneaker Kinder", ["kids sneaker", "adidași copii"]),
              subcategory("fashion-shoes-kids-boots", "Boots", "Stiefel Kinder", ["kids boot", "ghete copii"]),
              subcategory("fashion-shoes-kids-sandals", "Sandals", "Sandalen Kinder", ["kids sandal", "sandale copii"]),
              subcategory("fashion-shoes-kids-sport", "Sports Shoes", "Sportschuhe Kinder", ["kids sport shoe", "pantofi sport copii"]),
              subcategory("fashion-shoes-kids-school", "School Shoes", "Schuhe Schule", ["school shoes", "pantofi școală", "pantofi scoala"]),
            ]
          ),
        ]
      ),
      subcategory("fashion-socks", "Socks & Hosiery", "Socken + Strümpfe", ["sock", "socks", "tights", "ciorapi", "șosete", "sosete"]),
      subcategory("fashion-underwear", "Underwear", "Unterwäsche", ["underwear", "boxers", "briefs", "boxeri", "lenjerie intimă"]),
      subcategory("fashion-bags", "Bags", "Taschen", ["bag", "backpack", "handbag", "tote", "geantă"]),
      subcategory("fashion-accessories", "Fashion Accessories", "Fashion-Accessoires", [
        "belt",
        "scarf",
        "wallet",
        "curea",
        "fular",
        "fashion cap",
        "șapcă",
        "sapca",
      ]),
      subcategory("fashion-beauty-hair-care", "Hair Care", "Haarpflege", [
        "shampoo",
        "conditioner",
        "hair mask",
        "haarpflege",
        "haarshampoo",
        "îngrijire păr",
        "ingrijire par",
      ]),
      subcategory("fashion-beauty-cosmetics", "Cosmetics & Skincare", "Kosmetik + Hautpflege", [
        "cosmetics",
        "skincare",
        "makeup",
        "kosmetik",
        "hautpflege",
        "cosmetică",
        "cosmetica",
      ]),
      subcategory("fashion-beauty-fragrance", "Fragrance", "Düfte", [
        "fragrance",
        "perfume",
        "parfum",
        "duft",
        "eau de toilette",
      ]),
      subcategory("health-monitors-scales", "Health Monitors & Scales", "Gesundheitsmessgeräte + Waagen", ["blood pressure", "thermometer", "scale", "blutdruck"]),
      subcategory("health-massage-recovery", "Massage & Recovery", "Massage + Regeneration", ["massager", "massage gun", "recovery"]),
      subcategory("baby-monitoring-feeding", "Baby Monitoring & Feeding Tech", "Babyüberwachung + Fütterung", [
        "baby monitor",
        "breast pump",
        "bottle warmer",
        "sterilizer",
        "babyphone",
        "milchpumpe",
        "flaschenwärmer",
      ]),
      subcategory("baby-strollers-travel", "Strollers & Travel Systems", "Kinderwagen + Reisesysteme", [
        "stroller",
        "pram",
        "kinderwagen",
        "buggy",
        "kombikinderwagen",
        "sportwagen",
        "căruț",
        "carucior",
      ]),
      subcategory("baby-car-seats", "Car Seats", "Kindersitze", [
        "car seat",
        "autositz",
        "kindersitz",
        "babyschale",
        "reboarder",
        "scaune auto bebeluși",
      ]),
      subcategory("baby-nursery", "Nursery & High Chairs", "Kinderzimmer + Hochstühle", [
        "high chair",
        "hochstuhl",
        "baby bed",
        "babybett",
        "wickelkommode",
        "nursery",
        "pătuț",
        "scaun masă bebeluși",
      ]),
    ],
  },
  {
    id: "appliances",
    label: "Appliances",
    labelDe: "Haushaltsgeräte",
    icon: PackageOpen,
    description: "Large and small home appliances — fridges, washers, ovens, kitchen machines and cleaning.",
    subcategories: [
      subcategory("large-fridges-freezers", "Refrigerators & Freezers", "Kühlschränke + Gefriergeräte", ["refrigerator", "fridge", "freezer", "kühlschrank", "gefrierschrank", "frigider"]),
      subcategory("large-washers-dryers", "Washing Machines & Dryers", "Waschmaschinen + Trockner", ["washing machine", "washer", "dryer", "tumbler", "waschmaschine", "mașină de spălat", "masina de spalat"]),
      subcategory("large-dishwashers", "Dishwashers", "Geschirrspüler", ["dishwasher", "geschirrspüler", "mașină de spălat vase"]),
      subcategory("large-ovens-hobs", "Ovens & Hobs", "Backöfen + Kochfelder", ["oven", "hob", "cooktop", "backofen", "kochfeld", "aragaz", "plita"]),
      subcategory("large-built-in", "Built-In Appliances", "Einbaugeräte", ["built-in appliance", "einbaugerät"]),
      subcategory("large-wine-coolers", "Wine Coolers", "Weinkühlschränke", ["wine cooler", "wine fridge", "weinkühlschrank"]),
      subcategory("kitchen-coffee-machines", "Coffee Machines", "Kaffeemaschinen", ["coffee machine", "espresso machine", "kaffeemaschine", "nespresso"]),
      subcategory("kitchen-machines-mixers", "Kitchen Machines & Mixers", "Küchenmaschinen + Mixer", ["kitchen machine", "stand mixer", "blender", "mixer"]),
      subcategory("kitchen-cooking-appliances", "Cooking Appliances", "Kochgeräte", ["air fryer", "multicooker", "rice cooker", "fritteuse"]),
      subcategory("kitchen-microwaves", "Microwaves", "Mikrowellen", ["microwave", "mikrowelle"]),
      subcategory("kitchen-breakfast", "Breakfast Appliances", "Frühstücksgeräte", ["toaster", "kettle", "waffle maker", "wasserkocher"]),
      subcategory("kitchen-water-treatment", "Water Treatment", "Wasseraufbereitung", ["water filter", "water treatment", "wassersprudler"]),
      subcategory("cleaning-vacuums", "Vacuum Cleaners", "Staubsauger", [
        "vacuum cleaner",
        "cordless vacuum",
        "staubsauger",
        "aspirator",
      ]),
      subcategory("cleaning-stick-vacuums", "Stick & Cordless Vacuums", "Akku-Staubsauger", [
        "stick vacuum",
        "cordless vacuum",
        "aspiratoare verticale",
        "aspirator vertical",
      ]),
      subcategory("cleaning-bagless-vacuums", "Bagless Vacuums", "Beutellose Staubsauger", [
        "bagless vacuum",
        "aspiratoare fără sac",
        "aspiratoare fara sac",
      ]),
      subcategory("cleaning-bagged-vacuums", "Bagged Vacuums", "Beutelstaubsauger", [
        "bagged vacuum",
        "aspiratoare cu sac",
      ]),
      subcategory("cleaning-wet-vacuums", "Wet & Wash Vacuums", "Waschsauger", [
        "wet vacuum",
        "wash vacuum",
        "aspiratoare cu spalare",
        "aspiratoare cu spălare",
        "aspiratoare cu abur",
      ]),
      subcategory("cleaning-handheld", "Handheld Vacuums", "Handstaubsauger", [
        "handheld vacuum",
        "aspiratoare de mână",
        "aspiratoare de mana",
      ]),
      subcategory("cleaning-accessories", "Cleaning Accessories", "Reinigungszubehör", [
        "vacuum accessory",
        "vacuum filter",
        "vacuum bag",
        "accesorii aspirator",
        "filtru aspirator",
      ]),
      subcategory("cleaning-robots", "Robot Vacuums", "Saugroboter", ["robot vacuum", "roomba", "saugroboter"]),
      subcategory("cleaning-floor-care", "Steam & Floor Cleaning", "Dampf- + Bodenreinigung", ["steam cleaner", "floor cleaner", "dampfreiniger", "mopuri electrice"]),
      subcategory("climate-cooling", "Air Conditioners & Fans", "Klimageräte + Ventilatoren", ["air conditioner", "fan", "klimagerät", "ventilator"]),
      subcategory("climate-heating", "Heating", "Heizen", ["heater", "radiator", "heizlüfter"]),
      subcategory("climate-air-care", "Humidifiers & Dehumidifiers", "Luftbe- + Entfeuchter", ["humidifier", "dehumidifier", "air purifier"]),
      subcategory("laundry-ironing-sewing", "Ironing & Sewing", "Bügeln + Nähen", ["iron", "ironing", "sewing machine", "bügeleisen", "nähmaschine"]),
      // Personal care appliances (Rowenta etc.) — under Electrocasnice, not Fashion/clothes.
      subcategory("care-shaving-hair-removal", "Shaving & Hair Removal", "Rasieren + Haarentfernung", [
        "shaver",
        "epilator",
        "hair removal",
        "rasierer",
        "aparat de tuns",
        "epilator",
      ]),
      subcategory("care-hair-styling", "Hair Styling", "Haarstyling", [
        "hair dryer",
        "hair styler",
        "straightener",
        "haartrockner",
        "uscător de păr",
        "uscator de par",
        "placă de păr",
      ]),
      subcategory("care-oral", "Oral Care", "Zahnpflege", ["electric toothbrush", "oral care", "zahnbürste"]),
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    labelDe: "Möbel",
    icon: Armchair,
    description: "Kitchen, bedroom, living and dining furniture — chairs, beds, tables and storage.",
    subcategories: [
      subcategory("furniture-kitchen", "Kitchen Furniture", "Küchenmöbel", ["kitchen furniture", "kitchen cabinet", "kitchen unit", "mobilier bucătărie", "mobilier bucatarie"]),
      subcategory("furniture-bedroom", "Bedroom Furniture", "Schlafzimmermöbel", ["bedroom furniture", "wardrobe", "nightstand", "mobilier dormitor"]),
      subcategory("furniture-beds", "Beds & Mattresses", "Betten + Matratzen", ["bed", "mattress", "bed frame", "pat", "saltea"]),
      subcategory("furniture-living", "Living Room Furniture", "Wohnzimmermöbel", ["sofa", "couch", "living room", "canapea", "fotoliu"]),
      subcategory("furniture-dining", "Dining Tables & Sets", "Esszimmer", ["dining table", "dining set", "masa dining"]),
      subcategory("furniture-chairs", "Chairs & Stools", "Stühle + Hocker", ["chair", "stool", "dining chair", "scaun", "taburet"]),
      subcategory("furniture-office", "Office Furniture", "Büromöbel", ["office desk", "office chair", "standing desk", "birou", "scaun birou"]),
      subcategory("furniture-storage", "Storage & Shelving", "Aufbewahrung + Regale", ["shelf", "bookcase", "storage cabinet", "raft", "dulap"]),
      subcategory("furniture-outdoor", "Outdoor Furniture", "Gartenmöbel", ["garden furniture", "patio furniture", "outdoor table"]),
    ],
  },
  {
    id: "home-textiles",
    label: "Home Textiles",
    labelDe: "Heimtextilien",
    icon: BedDouble,
    description: "Bedding, pillows, covers, curtains and soft home textiles.",
    subcategories: [
      subcategory("textiles-curtains", "Curtains & Blinds", "Vorhänge + Rollos", ["curtain", "blind", "drape", "perdea", "draperie", "jaluzea"]),
      subcategory("textiles-table-linen", "Table Linen", "Tischwäsche", ["tablecloth", "napkin", "față de masă", "fata de masa"]),
      subcategory("textiles-towels", "Towels & Bath", "Handtücher", ["towel", "bath mat", "prosop"]),
      subcategory("textiles-pillows", "Pillows", "Kopfkissen", ["pillow", "cushion", "pernă", "perna"]),
      subcategory("textiles-pillowcases", "Pillowcases & Sheets", "Bettbezüge + Laken", ["pillowcase", "sheet", "fitted sheet", "față de pernă", "fata de perna", "lenjerie", "cearșaf", "cearsaf"]),
      subcategory("textiles-bedding", "Duvets & Blankets", "Bettwäsche + Decken", ["duvet", "quilt", "blanket", "comforter", "plapumă", "plapuma", "pilotă", "pilota", "pătură", "patura", "cuvertură", "cuvertura"]),
      subcategory("textiles-rugs", "Rugs & Carpets", "Teppiche", ["rug", "carpet", "covor"]),
    ],
  },
  {
    id: "office-stationery",
    label: "Office + Books",
    labelDe: "Büro + Bücher",
    icon: Briefcase,
    description:
      "Stationery, bookstore and media in one office aisle — papetărie first, then books, then films/music.",
    subcategories: [
      subcategory(
        "office-group-stationery",
        "Stationery",
        "Papierwaren",
        ["stationery", "papetărie", "papetarie", "rechizite"],
        [
          subcategory("office-stationery-notebooks", "Notebooks & Pads", "Notizbücher + Blöcke", ["notebook", "notepad", "exercise book", "caiet", "carnet"]),
          subcategory("office-stationery-folders", "Folders & Filing", "Ordner + Ablage", ["folder", "binder", "filing", "dosar", "biblioraft"]),
          subcategory("office-stationery-paper", "Paper & Printables", "Papier", ["printer paper", "copy paper", "a4 paper", "hârtie", "hartie"]),
          subcategory("office-stationery-writing", "Pens & Writing", "Stifte + Schreiben", ["pen", "pencil", "marker", "stilou", "creion"]),
          subcategory("office-stationery-desk", "Desk Supplies", "Schreibtischbedarf", ["stapler", "scissors", "tape", "calculator desk"]),
          subcategory("office-stationery-school", "School Supplies", "Schulbedarf", ["school supply", "geometry set", "rechizite"]),
        ]
      ),
      subcategory(
        "office-group-books",
        "Bookstore",
        "Buchhandlung",
        ["bookstore", "librărie", "librarie", "isbn"],
        [
          subcategory("media-books", "Books", "Bücher", ["book", "isbn", "bücher", "carte"]),
          subcategory("media-audiobooks", "Audiobooks", "Hörbücher", ["audiobook", "hörbuch", "audiobook"]),
        ]
      ),
      subcategory(
        "office-group-media",
        "Media",
        "Medien",
        ["media", "film", "music"],
        [
          subcategory("media-films", "Films", "Filme", ["blu-ray", "dvd", "film"]),
          subcategory("media-music", "Music", "Musik", ["vinyl record", "music cd", "audio cd"]),
        ]
      ),
    ],
  },
  {
    id: "beverages-alcohol",
    label: "Wine & Spirits",
    labelDe: "Wein + Spirituosen",
    icon: Wine,
    description:
      "Refined drinks for online comparison — wine, champagne, whisky and spirits. Everyday groceries stay out of scope.",
    subcategories: [
      subcategory("beverages-wine", "Wine", "Wein", ["wine", "vin", "rotwein", "weisswein", "rosso", "bianco"]),
      subcategory("beverages-champagne-sparkling", "Champagne & Sparkling", "Champagner + Sekt", [
        "champagne",
        "prosecco",
        "cava",
        "sparkling wine",
        "sekt",
        "spumant",
      ]),
      subcategory("beverages-whisky", "Whisky & Whiskey", "Whisky", ["whisky", "whiskey", "bourbon", "scotch", "single malt"]),
      subcategory("beverages-spirits", "Spirits", "Spirituosen", [
        "gin",
        "vodka",
        "rum",
        "cognac",
        "brandy",
        "tequila",
        "liqueur",
        "țuică",
        "tuica",
        "palincă",
      ]),
      subcategory("beverages-beer-cider", "Beer & Cider", "Bier + Cider", ["beer", "bier", "cider", "bere", "craft beer"]),
    ],
  },
  {
    id: "diy-tools",
    label: "DIY + Tools",
    labelDe: "Baumarkt + Werkzeug",
    icon: Hammer,
    description: "Power tools, hand tools, electrical supplies and workshop essentials.",
    subcategories: [
      subcategory("diy-power-tools", "Power Tools", "Elektrowerkzeuge", [
        "drill",
        "saw",
        "power tool",
        "bohrmaschine",
        "bormasina",
        "rotopercutor",
        "drujba",
        "polizor",
        "scule electrice",
        "fierastrau",
        "impact",
      ]),
      subcategory("diy-sanders", "Sanders & Polishers", "Schleifer", [
        "sander",
        "polisher",
        "slefuit",
        "slefuitoare",
        "masina de slefuit",
      ]),
      subcategory("diy-painting-tools", "Painting & Spray Guns", "Lackier- + Spritzgeräte", [
        "paint sprayer",
        "spray gun",
        "pistol de vopsit",
        "pistol electric pentru vopsit",
        "hvlp",
      ]),
      subcategory("diy-welding-soldering", "Welding & Soldering", "Schweißen + Löten", [
        "welding",
        "soldering",
        "sudura",
        "sudură",
        "lipit",
        "pistol pentru lipit",
      ]),
      subcategory("diy-hand-tools", "Hand Tools", "Handwerkzeuge", [
        "hand tool",
        "tool set",
        "werkzeug",
        "scule de mana",
        "surubelnita",
        "clește",
        "patent",
        "sfic",
      ]),
      subcategory("diy-electrical", "Electrical Supplies", "Elektromaterial", [
        "electrical supplies",
        "extension lead",
        "steckdose",
        "generator",
        "invertor",
        "compresor",
      ]),
      subcategory("diy-batteries-chargers", "Batteries & Chargers", "Batterien + Ladegeräte", [
        "battery",
        "charger",
        "akku",
        "acumulator",
        "incarcator",
      ]),
      subcategory("diy-measuring", "Measuring Equipment", "Messgeräte", [
        "laser measure",
        "multimeter",
        "messgerät",
        "dreptar",
        "nivelă",
        "nivela",
      ]),
      subcategory("diy-workwear-safety", "Workwear & Safety", "Arbeitsschutz", [
        "work gloves",
        "safety glasses",
        "workwear",
        "mănuși lucru",
        "protectie",
        "jacheta",
      ]),
      subcategory("diy-fasteners-consumables", "Fasteners & Consumables", "Befestigung + Verbrauch", [
        "screw",
        "nail",
        "anchor",
        "duct tape",
        "șuruburi",
        "disc",
        "burghie",
        "tarod",
        "filiera",
        "lama",
        "lant",
      ]),
    ],
  },
  {
    id: "garden",
    label: "Garden",
    labelDe: "Garten",
    icon: Flower2,
    description: "Lawn care, garden tools, irrigation, plants, outdoor living and grills.",
    subcategories: [
      subcategory("garden-equipment", "Garden Equipment", "Gartengeräte", [
        "lawn mower", "garden tool", "rasenmäher", "pompa", "stropit", "motocoasa",
      ]),
      subcategory("garden-lawn-care", "Lawn Care", "Rasenpflege", ["lawn", "grass trimmer", "scarifier", "gazon"]),
      subcategory("garden-irrigation", "Irrigation & Watering", "Bewässerung", ["hose", "sprinkler", "irrigation", "udare", "furtun"]),
      subcategory("garden-plants-pots", "Plants & Pots", "Pflanzen + Töpfe", ["plant pot", "planter", "garden plant", "ghiveci"]),
      subcategory("garden-outdoor-living", "Outdoor Living", "Outdoor Living", ["parasol", "hammock", "outdoor heater"]),
      subcategory("garden-storage", "Garden Storage", "Gartenlagerung", ["garden shed", "garden box", "tool shed"]),
      subcategory("garden-grills", "Grills", "Grills", ["grill", "barbecue", "grătar", "gratar"]),
    ],
  },
  {
    id: "mobility-sport-outdoor",
    label: "Bikes + Scooters",
    labelDe: "Velo + Scooter",
    icon: Bike,
    description:
      "Bikes, e-bikes, e-scooters and light electric microcars — strong in CH cities (Bern) and RO. Car parts live under Auto Parts.",
    subcategories: [
      subcategory("mobility-bicycles", "Bicycles", "Fahrräder", ["bicycle", "bike", "mountain bike", "city bike", "bicicletă", "bicicleta"]),
      subcategory("mobility-ebikes", "E-Bikes", "E-Bikes", ["e-bike", "electric bike", "pedelec"]),
      subcategory("mobility-escooters", "E-Scooters", "E-Scooter", ["e-scooter", "electric scooter", "scuter electric"]),
      subcategory("mobility-microcars", "Light Electric Cars", "Leichte Elektroautos", [
        "microcar",
        "light electric vehicle",
        "quadricycle",
        "l6e",
        "l7e",
        "mășinuță electrică",
        "masinuta electrica",
        "mașinuță",
        "masinuta",
        "minicar",
        "voiturette",
        "elektro kleinstwagen",
      ]),
      subcategory("mobility-accessories", "Bike & Scooter Accessories", "Rad- + Scooter-Zubehör", ["scooter accessory", "bike accessory", "helmet", "casca"]),
      subcategory("sport-fitness-equipment", "Fitness Equipment", "Fitnessgeräte", ["treadmill", "exercise bike", "dumbbell", "fitness equipment"]),
      subcategory("sport-electronics", "Sports Electronics", "Sportelektronik", ["bike computer", "sports watch", "heart rate monitor"]),
      subcategory("outdoor-electronics", "Outdoor Electronics", "Outdoor-Elektronik", ["power station", "headlamp", "outdoor navigation"]),
    ],
  },
  {
    id: "auto-parts",
    label: "Auto Parts",
    labelDe: "Autoteile",
    icon: Wrench,
    description:
      "Car parts and accessories only — tires, batteries, oils, lighting. Not new/used car sales.",
    subcategories: [
      subcategory("vehicle-accessories", "Auto Accessories", "Auto-Zubehör", [
        "car accessory",
        "jump starter",
        "dash cam",
        "accesorii auto",
        "phone holder car",
      ]),
      subcategory("auto-tires-wheels", "Tires", "Reifen", [
        "tire",
        "tyre",
        "anvelope",
        "cauciucuri",
        "sommerreifen",
        "winterreifen",
      ]),
      subcategory("auto-complete-wheels", "Complete Wheels", "Kompletträder", [
        "komplettrad",
        "kompletträder",
        "complete wheel",
        "wheel rim",
        "alufelge",
        "felge",
        "jante",
        "roata completa",
      ]),
      subcategory("auto-batteries", "Car Batteries", "Autobatterien", [
        "car battery",
        "autobatterie",
        "baterie auto",
        "acumulator auto",
      ]),
      subcategory("auto-oils-fluids", "Oils & Fluids", "Öle + Flüssigkeiten", [
        "engine oil",
        "motor oil",
        "brake fluid",
        "ulei motor",
        "antigel",
      ]),
      subcategory("auto-lighting", "Lighting", "Beleuchtung", [
        "headlight",
        "car bulb",
        "led auto",
        "faruri",
        "bec auto",
      ]),
      subcategory("auto-filters-brakes", "Filters & Brakes", "Filter + Bremsen", [
        "oil filter",
        "air filter",
        "brake pad",
        "placute frana",
        "filtru ulei",
      ]),
      subcategory("auto-interior-care", "Interior & Care", "Innenraum + Pflege", [
        "car mat",
        "car care",
        "covorase auto",
        "polish auto",
      ]),
      subcategory("auto-tools-chargers", "Tools & Chargers", "Werkzeug + Ladegeräte", [
        "obd",
        "car charger",
        "compressor auto",
        "compresor auto",
      ]),
    ],
  },
  {
    id: "toys-hobby-rc",
    label: "Toys + Hobby + RC",
    labelDe: "Spielzeug + Hobby + RC",
    icon: Gamepad2,
    description: "Standardized toys, hobby products and remote-controlled models.",
    subcategories: [
      subcategory("toys-rc-models", "Remote-Controlled Models", "RC-Modelle", ["rc car", "remote controlled", "rc model"]),
      subcategory("toys-building-sets", "Building Sets", "Bausets", ["lego", "building set", "construction toy"]),
      subcategory("toys-electronic", "Electronic Toys", "Elektronisches Spielzeug", ["electronic toy", "robot toy"]),
      subcategory("toys-board-games", "Board Games", "Brettspiele", ["board game", "brettspiel"]),
      subcategory("hobby-creative", "Creative Hobby", "Kreativ-Hobby", ["craft kit", "creative hobby", "model kit"]),
      subcategory("toys-accessories", "Toy Accessories", "Spielzeugzubehör", ["toy accessory", "replacement part"]),
    ],
  },
];

export interface ShoppingCollection {
  id: string;
  label: string;
  description: string;
  legacyIds: string[];
}

/** Offer-based comparison views — separate from product taxonomy. */
export interface ComparisonCollectionFilter {
  id: string;
  label: string;
  description: string;
}

/** Active offer-based comparison views. */
export const COMPARISON_COLLECTION_FILTERS: ComparisonCollectionFilter[] = [
  {
    id: "compare-cross-border",
    label: "Cross-border savings",
    description: "Offers that may be cheaper when ordered from another country.",
  },
  {
    id: "sale",
    label: "Deals & price drops",
    description: "Verified production-feed offers with merchant-supplied reductions.",
  },
  {
    id: "compare-refurb",
    label: "Refurbished & used",
    description: "Renewed, refurbished and second-hand condition offers.",
  },
];

export const RETIRED_COLLECTION_FILTER_IDS = [] as const;

export interface CategorySubcategoryGroup {
  id: string;
  label: string;
  subcategoryIds: string[];
}

/** Optional level-3 grouping for large departments in browse UI. */
export const CATEGORY_SUBCATEGORY_GROUPS: Record<string, CategorySubcategoryGroup[]> = {
  electronics: [
    {
      id: "electronics-phones-tablets",
      label: "Phones & tablets",
      subcategoryIds: [
        "mobile-smartphones",
        "mobile-feature-phones",
        "mobile-fixed-line",
        "mobile-tablets",
        "notebooks-tablets-pc",
        "mobile-accessories",
        "mobile-navigation-radio",
      ],
    },
    {
      id: "electronics-computers",
      label: "Computers & PC",
      subcategoryIds: [
        "notebooks-laptops",
        "notebooks-desktops",
        "notebooks-monitors",
        "computers-ereaders",
        "computers-docks",
        "pc-gpu",
        "pc-cpu",
        "pc-ram-ssd",
        "pc-motherboard",
        "pc-cooling",
        "pc-power-supplies",
        "pc-cases",
        "software-os",
        "software-security",
        "software-creative",
        "software-office",
        "software-utilities",
        "digital-gift-cards",
        "peripherals-keyboard-mouse",
        "peripherals-webcam",
        "peripherals-storage",
        "peripherals-accessories",
      ],
    },
    {
      id: "electronics-audio-tv",
      label: "Audio, TV & wearables",
      subcategoryIds: [
        "audio-headphones",
        "audio-speakers",
        "audio-wireless",
        "audio-hifi",
        "audio-portable",
        "audio-car",
        "audio-studio",
        "audio-accessories",
        "wearables-smartwatch",
        "wearables-fitness",
        "wearables-accessories",
        "tv-televisions",
        "tv-projectors",
        "tv-streaming",
        "tv-mounts",
        "tv-screens",
        "tv-home-cinema-systems",
      ],
    },
  ],
};

export function isCollectionFilter(categoryId: string): boolean {
  return COMPARISON_COLLECTION_FILTERS.some((item) => item.id === categoryId);
}

export const SHOPPING_COLLECTIONS: ShoppingCollection[] = [
  {
    id: "before-you-buy",
    label: "Before You Buy",
    description: "Curated comparison views for cross-border offers, accessories and condition.",
    legacyIds: ["compare-cross-border", "compare-accessories", "compare-refurb"],
  },
  {
    id: "deals",
    label: "Deals",
    description: "Verified production offers with merchant-supplied price reductions.",
    legacyIds: ["sale", "sale-flash", "sale-weekly", "clearance", "clearance-electronics", "clearance-home"],
  },
  {
    id: "preowned",
    label: "Refurbished + Used",
    description: "Offer condition collection, separate from product identity.",
    legacyIds: ["used", "used-refurbished", "used-secondhand"],
  },
];

export const UNMAPPED_CATEGORY_ID = "unmapped";

const LEGACY_PARENT_ALIASES: Record<string, string> = {
  "notebooks-pcs": "electronics",
  peripherals: "electronics",
  "pc-components": "electronics",
  "computers-tablets": "electronics",
  "pc-components-storage": "electronics",
  "smartphones-tablets": "electronics",
  "phones-wearables": "electronics",
  wearables: "electronics",
  "tv-home-cinema": "electronics",
  audio: "electronics",
  "gaming-vr": "electronics",
  "photo-video": "electronics",
  "photo-video-drones-optics": "electronics",
  "drones-electronics": "electronics",
  networking: "electronics",
  "network-smart-home-security": "electronics",
  "office-printing": "electronics",
  "large-appliances": "appliances",
  "kitchen-coffee": "appliances",
  "cleaning-laundry-climate": "appliances",
  "diy-garden-power": "diy-tools",
  software: "electronics",
  "software-digital": "electronics",
  "personal-care-health-baby": "appliances",
  "books-games-media": "office-stationery",
};

const LEGACY_LEAF_ALIASES: Record<string, string> = {
  "mobile-smartwatch-phone": "wearables-smartwatch",
  // Coarse legacy Home+Kitchen leaves → leaf-only v2 IDs (no parent/leaf id collision).
  "home-kitchen": "kitchen-coffee-machines",
  "home-appliances": "cleaning-vacuums",
  "home-personal-care": "care-shaving-hair-removal",
};

/** Old mixed Home + Kitchen parent — kept for `?category=home-kitchen` URLs only. */
const LEGACY_HOME_KITCHEN_LEAF_IDS = [
  "kitchen-coffee-machines",
  "kitchen-machines-mixers",
  "kitchen-cooking-appliances",
  "kitchen-microwaves",
  "kitchen-breakfast",
  "kitchen-water-treatment",
  "cleaning-vacuums",
  "cleaning-robots",
  "cleaning-floor-care",
  "climate-cooling",
  "climate-heating",
  "climate-air-care",
  "laundry-ironing-sewing",
  "care-shaving-hair-removal",
  "care-hair-styling",
  "care-oral",
  "health-monitors-scales",
  "health-massage-recovery",
  "baby-monitoring-feeding",
  "baby-strollers-travel",
  "baby-car-seats",
  "baby-nursery",
  "home-smart-home",
  "smart-home-lighting",
  "smart-home-security",
  "smart-home-climate",
] as const;

const LEGACY_MULTI_PARENT_GROUPS: Record<string, readonly string[]> = {
  "home-kitchen": LEGACY_HOME_KITCHEN_LEAF_IDS,
  "computers-tablets": [
    "notebooks-laptops",
    "notebooks-desktops",
    "notebooks-monitors",
    "notebooks-tablets-pc",
    "peripherals-keyboard-mouse",
    "peripherals-webcam",
    "peripherals-storage",
    "peripherals-accessories",
    "computers-ereaders",
    "computers-docks",
  ],
  audio: [
    "audio-headphones",
    "audio-speakers",
    "audio-wireless",
    "audio-hifi",
    "audio-portable",
    "audio-car",
    "audio-studio",
    "audio-accessories",
  ],
  "large-appliances": [
    "large-fridges-freezers",
    "large-washers-dryers",
    "large-dishwashers",
    "large-ovens-hobs",
    "large-built-in",
    "large-wine-coolers",
  ],
  "kitchen-coffee": [
    "kitchen-coffee-machines",
    "kitchen-machines-mixers",
    "kitchen-cooking-appliances",
    "kitchen-microwaves",
    "kitchen-breakfast",
    "kitchen-water-treatment",
  ],
  "cleaning-laundry-climate": [
    "cleaning-vacuums",
    "cleaning-stick-vacuums",
    "cleaning-bagless-vacuums",
    "cleaning-bagged-vacuums",
    "cleaning-wet-vacuums",
    "cleaning-handheld",
    "cleaning-accessories",
    "cleaning-robots",
    "cleaning-floor-care",
    "climate-cooling",
    "climate-heating",
    "climate-air-care",
    "laundry-ironing-sewing",
  ],
  "diy-garden-power": [
    "diy-power-tools",
    "diy-sanders",
    "diy-painting-tools",
    "diy-welding-soldering",
    "diy-hand-tools",
    "garden-equipment",
    "garden-grills",
    "diy-electrical",
    "diy-batteries-chargers",
    "diy-measuring",
    "diy-workwear-safety",
    "diy-fasteners-consumables",
    "vehicle-accessories",
  ],
  "personal-care-health-baby": [
    "care-shaving-hair-removal",
    "care-hair-styling",
    "care-oral",
    "health-monitors-scales",
    "health-massage-recovery",
    "baby-monitoring-feeding",
    "baby-strollers-travel",
    "baby-car-seats",
    "baby-nursery",
  ],
  "books-games-media": ["media-books", "media-films", "media-music", "media-audiobooks"],
};

export function isLegacyMultiParentGroup(categoryId: string): boolean {
  return Boolean(LEGACY_MULTI_PARENT_GROUPS[categoryId]);
}

export function getLegacyMultiParentPrimaryDepartment(categoryId: string): string | null {
  if (categoryId === "home-kitchen") return "appliances";
  if (categoryId === "computers-tablets" || categoryId === "audio") return "electronics";
  if (
    categoryId === "large-appliances" ||
    categoryId === "kitchen-coffee" ||
    categoryId === "cleaning-laundry-climate"
  ) {
    return "appliances";
  }
  if (categoryId === "diy-garden-power") return "diy-tools";
  if (categoryId === "personal-care-health-baby") return "appliances";
  if (categoryId === "books-games-media") return "office-stationery";
  return null;
}

export function resolveCategoryAlias(categoryId: string): string {
  return LEGACY_LEAF_ALIASES[categoryId] ?? LEGACY_PARENT_ALIASES[categoryId] ?? categoryId;
}

export const ALL_CATEGORIES_ID = "all";

export function getCategoryById(categoryId: string): ShoppingCategory | undefined {
  const resolvedId = resolveCategoryAlias(categoryId);
  return SHOPPING_CATEGORIES.find((c) => c.id === resolvedId);
}

export function getSubcategoryById(subcategoryId: string): ShoppingSubcategory | undefined {
  const resolvedId = resolveCategoryAlias(subcategoryId);
  for (const cat of SHOPPING_CATEGORIES) {
    const hit = walkSubcategories(cat.subcategories).find((s) => s.id === resolvedId);
    if (hit) return hit;
  }
  return undefined;
}

/** Mid-level parent id when a leaf sits under Fashion → Shoes → …, else null. */
export function getMidLevelCategoryId(categoryOrSubId: string): string | null {
  const resolvedId = resolveCategoryAlias(categoryOrSubId);
  for (const cat of SHOPPING_CATEGORIES) {
    for (const mid of cat.subcategories) {
      if (!mid.children?.length) continue;
      if (mid.children.some((child) => child.id === resolvedId)) return mid.id;
      if (walkSubcategories(mid.children).some((child) => child.id === resolvedId)) return mid.id;
    }
  }
  return null;
}

export function getParentCategoryId(categoryOrSubId: string): string | null {
  if (categoryOrSubId === ALL_CATEGORIES_ID) return null;
  const resolvedId = resolveCategoryAlias(categoryOrSubId);
  const direct = getCategoryById(resolvedId);
  if (direct) return direct.id;
  for (const cat of SHOPPING_CATEGORIES) {
    if (walkSubcategories(cat.subcategories).some((s) => s.id === resolvedId)) {
      return cat.id;
    }
  }
  return null;
}

/** Match product against category/subcategory filter — strict ID match only (no keyword bleed). */
export function productMatchesCategoryFilter(
  product: {
    title: string;
    description: string;
    brand: string;
    category: string;
    isFlashDeal?: boolean;
    offers?: Array<{
      source?: string;
      type?: string;
      originalPrice?: number;
      discountPercentage?: number;
    }>;
  },
  categoryFilter: string
): boolean {
  if (!categoryFilter || categoryFilter === ALL_CATEGORIES_ID) return true;

  const productCategory = resolveAutoLeafFromTitle(
    resolveCategoryAlias(product.category),
    product.title
  );
  const resolvedFilter = resolveCategoryAlias(categoryFilter);

  // Top market hubs (Electronics / Books / Fashion / Garden / DIY).
  // Imported lazily-safe via dynamic require pattern avoided — inline map from market-hubs.
  const hubLeaves = MARKET_HUB_LEAF_GROUPS[categoryFilter];
  if (hubLeaves) {
    return hubLeaves.includes(productCategory);
  }

  // Preserve the old mixed Home + Kitchen parent query across its v2 departments.
  const legacyGroup = LEGACY_MULTI_PARENT_GROUPS[categoryFilter];
  if (legacyGroup) {
    return legacyGroup.map(resolveCategoryAlias).includes(productCategory);
  }

  // Exact assignable product type.
  if (productCategory === resolvedFilter) return true;

  // Parent department selected → match direct subs and nested children.
  const parentCat = getCategoryById(resolvedFilter);
  if (parentCat) {
    return walkSubcategories(parentCat.subcategories).some(
      (subcategory) => subcategory.id === productCategory
    );
  }

  // Mid-level (e.g. Shoes / Women's Clothing) → match itself or any child leaf.
  const mid = getSubcategoryById(resolvedFilter);
  if (mid?.children?.length) {
    return (
      productCategory === mid.id ||
      walkSubcategories(mid.children).some((child) => child.id === productCategory)
    );
  }

  if (mid) return false;

  // Legacy collection URLs remain functional, but collections are not taxonomy.
  if (categoryFilter === "compare-cross-border") {
    return Boolean(product.offers?.some((offer) => offer.type === "cross_border"));
  }
  if (
    categoryFilter === "sale" ||
    categoryFilter.startsWith("sale-") ||
    categoryFilter === "clearance" ||
    categoryFilter.startsWith("clearance-")
  ) {
    return Boolean(
      product.offers?.some(
        (offer) =>
          offer.source === "production-live" &&
          (Boolean(offer.originalPrice) || Boolean(offer.discountPercentage))
      )
    );
  }
  if (
    categoryFilter === "compare-refurb" ||
    categoryFilter === "used" ||
    categoryFilter.startsWith("used-")
  ) {
    const text = `${product.title} ${product.description}`.toLowerCase();
    return text.includes("refurb") || text.includes("renewed") || text.includes("occasion");
  }

  return false;
}

export function getCategoryLabel(categoryId: string): string {
  if (categoryId === ALL_CATEGORIES_ID) return "All Categories";
  const hub = getMarketHubById(categoryId);
  if (hub) {
    switch (hub.id) {
      case "hub-electronics":
        return "Electronics";
      case "hub-home":
        return "Home + Appliances";
      case "hub-books":
        return "Books + Media";
      case "hub-fashion":
        return "Fashion";
      case "hub-garden":
        return "Garden";
      case "hub-diy":
        return "DIY + Tools";
      case "hub-auto":
        return "Auto";
      default:
        return hub.id;
    }
  }
  const resolvedId = resolveCategoryAlias(categoryId);
  const sub = getSubcategoryById(resolvedId);
  if (sub) return sub.label;
  const cat = getCategoryById(resolvedId);
  if (cat) return cat.label;
  const collectionFilter = COMPARISON_COLLECTION_FILTERS.find((item) => item.id === categoryId);
  if (collectionFilter) return collectionFilter.label;
  const collection = SHOPPING_COLLECTIONS.find(
    (item) => item.id === categoryId || item.legacyIds.includes(categoryId)
  );
  if (collection) return collection.label;
  const legacyCategory = LEGACY_SHOPPING_CATEGORIES.find((item) => item.id === categoryId);
  return legacyCategory?.label ?? categoryId;
}

/** Flat list for sitemap / SEO */
export function getAllCategoryPaths(): { module: string; sub?: string }[] {
  const paths: { module: string; sub?: string }[] = [];
  for (const cat of SHOPPING_CATEGORIES) {
    paths.push({ module: cat.id });
    for (const sub of walkSubcategories(cat.subcategories)) {
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
