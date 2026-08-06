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
import { MARKET_HUB_LEAF_GROUPS, getMarketHubById } from "@/lib/market-hubs";

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
const LEGACY_SHOPPING_CATEGORIES: ShoppingCategory[] = [
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
  searchKeywords: string[]
): ShoppingSubcategory => ({ id, label, labelDe, searchKeywords });

/**
 * Canonical comparison taxonomy v2.
 *
 * It is intentionally retailer-neutral: products belong to assignable product
 * types, while promotions, condition, pickup and cross-border status are offer
 * facets or curated collections.
 */
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  {
    id: "computers-tablets",
    label: "Computers + Tablets",
    labelDe: "Computer + Tablets",
    icon: Laptop,
    description: "Computers, tablets, displays, peripherals and accessories with comparable model specifications.",
    subcategories: [
      ...legacySubcategories([
        "notebooks-laptops",
        "notebooks-desktops",
        "notebooks-monitors",
        "notebooks-tablets-pc",
        "peripherals-keyboard-mouse",
        "peripherals-webcam",
        "peripherals-storage",
        "peripherals-accessories",
      ]),
      subcategory("computers-ereaders", "E-Readers", "E-Book-Reader", ["e-reader", "ereader", "kindle", "kobo"]),
      subcategory("computers-docks", "Docks & Computer Accessories", "Docks & Computerzubehör", ["dock", "docking station", "laptop stand", "usb hub"]),
    ],
  },
  {
    id: "pc-components-storage",
    label: "PC Components + Storage",
    labelDe: "PC-Komponenten + Speicher",
    icon: Cpu,
    description: "Internal components and storage organized by technical product type.",
    subcategories: [
      ...legacySubcategories(["pc-gpu", "pc-cpu", "pc-ram-ssd", "pc-motherboard", "pc-cooling"]),
      subcategory("pc-power-supplies", "Power Supplies", "Netzteile", ["power supply", "psu", "netzteil"]),
      subcategory("pc-cases", "PC Cases", "PC-Gehäuse", ["pc case", "computer case", "gehäuse"]),
    ],
  },
  {
    id: "phones-wearables",
    label: "Phones + Wearables",
    labelDe: "Telefone + Wearables",
    icon: Smartphone,
    description: "Mobile communication, wearable technology and their model-specific accessories.",
    subcategories: [
      ...legacySubcategories([
        "mobile-smartphones",
        "mobile-tablets",
        "mobile-accessories",
        "wearables-smartwatch",
        "wearables-fitness",
        "wearables-accessories",
      ]),
      subcategory("mobile-feature-phones", "Feature Phones", "Mobiltelefone", ["feature phone", "senior phone", "mobile phone"]),
      subcategory("mobile-fixed-line", "Fixed-Line Phones", "Festnetztelefone", ["landline", "dect", "fixed-line phone", "festnetz"]),
      subcategory("mobile-navigation-radio", "Navigation & Radio", "Navigation + Funk", ["gps navigation", "sat nav", "walkie talkie", "funkgerät"]),
    ],
  },
  {
    id: "tv-home-cinema",
    label: "TV + Home Cinema",
    labelDe: "TV + Heimkino",
    icon: Tv,
    description: "Televisions, projection, media players and home-cinema accessories.",
    subcategories: [
      ...legacySubcategories(["tv-televisions", "tv-projectors", "tv-streaming", "tv-mounts"]),
      subcategory("tv-screens", "Projection Screens", "Leinwände", ["projector screen", "projection screen", "leinwand"]),
      subcategory("tv-home-cinema-systems", "Home Cinema Systems", "Heimkino-Systeme", ["home cinema", "home theater", "av receiver"]),
    ],
  },
  {
    id: "audio",
    label: "Audio",
    labelDe: "Audio",
    icon: Headphones,
    description: "Personal, portable, home, vehicle and professional audio.",
    subcategories: legacySubcategories([
      "audio-headphones",
      "audio-speakers",
      "audio-wireless",
      "audio-hifi",
      "audio-portable",
      "audio-car",
      "audio-studio",
      "audio-accessories",
    ]),
  },
  {
    id: "gaming-vr",
    label: "Gaming + VR",
    labelDe: "Gaming + VR",
    icon: Gamepad2,
    description: "Gaming platforms, software, immersive hardware and accessories.",
    subcategories: [
      ...legacySubcategories(["gaming-consoles", "gaming-vr", "gaming-pc-handheld", "gaming-accessories", "gaming-games"]),
      subcategory("gaming-simulation", "Simulation Gear", "Simulations-Zubehör", ["racing wheel", "flight stick", "sim racing"]),
      subcategory("gaming-furniture", "Gaming Furniture", "Gaming-Möbel", ["gaming chair", "gaming desk"]),
    ],
  },
  {
    id: "photo-video-drones-optics",
    label: "Photo + Video + Drones",
    labelDe: "Foto + Video + Drohnen",
    icon: Camera,
    description: "Cameras, lenses, drones, optics and the complete capture accessory ecosystem.",
    subcategories: legacySubcategories([
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
  },
  {
    id: "network-smart-home-security",
    label: "Network + Smart Home",
    labelDe: "Netzwerk + Smart Home",
    icon: Wifi,
    description: "Connectivity, network storage, automation and connected security.",
    subcategories: [
      ...legacySubcategories(["networking-routers", "networking-switches", "networking-nas", "networking-cables", "home-smart-home"]),
      subcategory("smart-home-lighting", "Smart Lighting & Plugs", "Smart Lighting + Stecker", ["smart light", "smart bulb", "smart plug", "philips hue"]),
      subcategory("smart-home-security", "Smart Security", "Smart Security", ["security camera", "video doorbell", "alarm system"]),
      subcategory("smart-home-climate", "Smart Climate Controls", "Smart Klima-Steuerung", ["smart thermostat", "climate control", "heating control"]),
    ],
  },
  {
    id: "office-printing",
    label: "Office + Printing",
    labelDe: "Büro + Drucken",
    icon: Briefcase,
    description: "Printing, document handling, conferencing and ergonomic office equipment.",
    subcategories: [
      ...legacySubcategories(["office-printers", "office-ink-toner", "office-home", "office-tech"]),
      subcategory("office-conferencing", "Telephony & Conferencing", "Telefonie + Konferenzen", ["conference phone", "video conference", "speakerphone"]),
      subcategory("office-presentation", "Presentation Equipment", "Präsentationstechnik", ["presentation", "interactive display", "presenter"]),
    ],
  },
  {
    id: "large-appliances",
    label: "Large Appliances",
    labelDe: "Haushaltsgrossgeräte",
    icon: PackageOpen,
    description: "Large household appliances where model, delivery and installation costs matter.",
    subcategories: [
      subcategory("large-fridges-freezers", "Refrigerators & Freezers", "Kühlschränke + Gefriergeräte", ["refrigerator", "fridge", "freezer", "kühlschrank", "gefrierschrank"]),
      subcategory("large-washers-dryers", "Washing Machines & Dryers", "Waschmaschinen + Trockner", ["washing machine", "washer", "dryer", "tumbler", "waschmaschine"]),
      subcategory("large-dishwashers", "Dishwashers", "Geschirrspüler", ["dishwasher", "geschirrspüler"]),
      subcategory("large-ovens-hobs", "Ovens & Hobs", "Backöfen + Kochfelder", ["oven", "hob", "cooktop", "backofen", "kochfeld"]),
      subcategory("large-built-in", "Built-In Appliances", "Einbaugeräte", ["built-in appliance", "einbaugerät"]),
      subcategory("large-wine-coolers", "Wine Coolers", "Weinkühlschränke", ["wine cooler", "wine fridge", "weinkühlschrank"]),
    ],
  },
  {
    id: "kitchen-coffee",
    label: "Kitchen + Coffee",
    labelDe: "Küche + Kaffee",
    icon: ChefHat,
    description: "Small kitchen appliances and durable preparation equipment.",
    subcategories: [
      subcategory("kitchen-coffee-machines", "Coffee Machines", "Kaffeemaschinen", ["coffee machine", "espresso machine", "kaffeemaschine", "nespresso"]),
      subcategory("kitchen-machines-mixers", "Kitchen Machines & Mixers", "Küchenmaschinen + Mixer", ["kitchen machine", "stand mixer", "blender", "mixer"]),
      subcategory("kitchen-cooking-appliances", "Cooking Appliances", "Kochgeräte", ["air fryer", "multicooker", "rice cooker", "fritteuse"]),
      subcategory("kitchen-microwaves", "Microwaves", "Mikrowellen", ["microwave", "mikrowelle"]),
      subcategory("kitchen-breakfast", "Breakfast Appliances", "Frühstücksgeräte", ["toaster", "kettle", "waffle maker", "wasserkocher"]),
      subcategory("kitchen-water-treatment", "Water Treatment", "Wasseraufbereitung", ["water filter", "water treatment", "wassersprudler"]),
    ],
  },
  {
    id: "cleaning-laundry-climate",
    label: "Cleaning + Home Climate",
    labelDe: "Reinigung + Raumklima",
    icon: Layers,
    description: "Cleaning, laundry care and indoor climate equipment.",
    subcategories: [
      subcategory("cleaning-vacuums", "Vacuum Cleaners", "Staubsauger", ["vacuum cleaner", "cordless vacuum", "staubsauger"]),
      subcategory("cleaning-robots", "Robot Vacuums", "Saugroboter", ["robot vacuum", "roomba", "saugroboter"]),
      subcategory("cleaning-floor-care", "Steam & Floor Cleaning", "Dampf- + Bodenreinigung", ["steam cleaner", "floor cleaner", "dampfreiniger"]),
      subcategory("climate-cooling", "Air Conditioners & Fans", "Klimageräte + Ventilatoren", ["air conditioner", "fan", "klimagerät", "ventilator"]),
      subcategory("climate-heating", "Heating", "Heizen", ["heater", "radiator", "heizlüfter"]),
      subcategory("climate-air-care", "Humidifiers & Dehumidifiers", "Luftbe- + Entfeuchter", ["humidifier", "dehumidifier", "air purifier"]),
      subcategory("laundry-ironing-sewing", "Ironing & Sewing", "Bügeln + Nähen", ["iron", "ironing", "sewing machine", "bügeleisen", "nähmaschine"]),
    ],
  },
  {
    id: "personal-care-health-baby",
    label: "Personal Care + Health",
    labelDe: "Körperpflege + Gesundheit",
    icon: Watch,
    description: "Personal-care devices, home health measurement and durable baby technology.",
    subcategories: [
      subcategory("care-shaving-hair-removal", "Shaving & Hair Removal", "Rasieren + Haarentfernung", ["shaver", "epilator", "hair removal", "rasierer"]),
      subcategory("care-hair-styling", "Hair Styling", "Haarstyling", ["hair dryer", "hair styler", "straightener", "haartrockner"]),
      subcategory("care-oral", "Oral Care", "Zahnpflege", ["electric toothbrush", "oral care", "zahnbürste"]),
      subcategory("health-monitors-scales", "Health Monitors & Scales", "Gesundheitsmessgeräte + Waagen", ["blood pressure", "thermometer", "scale", "blutdruck"]),
      subcategory("health-massage-recovery", "Massage & Recovery", "Massage + Regeneration", ["massager", "massage gun", "recovery"]),
      subcategory("baby-monitoring-feeding", "Baby Monitoring & Feeding Tech", "Babyüberwachung + Fütterung", ["baby monitor", "breast pump", "bottle warmer", "sterilizer"]),
    ],
  },
  {
    id: "mobility-sport-outdoor",
    label: "E-Mobility + Sport",
    labelDe: "E-Mobilität + Sport",
    icon: Plane,
    description: "Electric mobility, fitness equipment and outdoor electronics.",
    subcategories: [
      subcategory("mobility-escooters", "E-Scooters", "E-Scooter", ["e-scooter", "electric scooter"]),
      subcategory("mobility-ebikes", "E-Bikes", "E-Bikes", ["e-bike", "electric bike"]),
      subcategory("sport-fitness-equipment", "Fitness Equipment", "Fitnessgeräte", ["treadmill", "exercise bike", "dumbbell", "fitness equipment"]),
      subcategory("sport-electronics", "Sports Electronics", "Sportelektronik", ["bike computer", "gps watch", "heart rate monitor"]),
      subcategory("outdoor-electronics", "Outdoor Electronics", "Outdoor-Elektronik", ["power station", "headlamp", "outdoor gps"]),
      subcategory("mobility-accessories", "Mobility Accessories", "Mobilitätszubehör", ["scooter accessory", "bike accessory", "helmet"]),
    ],
  },
  {
    id: "diy-garden-power",
    label: "DIY + Garden",
    labelDe: "Baumarkt + Garten",
    icon: Mouse,
    description: "Tools, garden equipment, power products and standardized DIY hardware.",
    subcategories: [
      subcategory("diy-power-tools", "Power Tools", "Elektrowerkzeuge", ["drill", "saw", "power tool", "bohrmaschine"]),
      subcategory("diy-hand-tools", "Hand Tools", "Handwerkzeuge", ["hand tool", "tool set", "werkzeug"]),
      subcategory("garden-equipment", "Garden Equipment", "Gartengeräte", ["lawn mower", "garden tool", "rasenmäher"]),
      subcategory("garden-grills", "Grills", "Grills", ["grill", "barbecue"]),
      subcategory("diy-electrical", "Electrical Supplies", "Elektromaterial", ["electrical supplies", "extension lead", "steckdose"]),
      subcategory("diy-batteries-chargers", "Batteries & Chargers", "Batterien + Ladegeräte", ["battery", "charger", "akku"]),
      subcategory("diy-measuring", "Measuring Equipment", "Messgeräte", ["laser measure", "multimeter", "messgerät"]),
      subcategory("vehicle-accessories", "Vehicle Accessories", "Fahrzeugzubehör", ["car accessory", "jump starter", "dash cam"]),
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
  {
    id: "software-digital",
    label: "Software + Digital",
    labelDe: "Software + Digital",
    icon: Download,
    description: "Comparable software editions, licenses and region-specific digital products.",
    subcategories: [
      ...legacySubcategories(["software-os", "software-security", "software-creative"]),
      subcategory("software-office", "Office Software", "Office-Software", ["office software", "microsoft 365"]),
      subcategory("software-utilities", "Utilities", "Dienstprogramme", ["utility software", "backup software", "pdf software"]),
      subcategory("digital-gift-cards", "Digital Gift Cards", "Digitale Geschenkkarten", ["digital gift card", "store credit"]),
    ],
  },
  {
    id: "books-games-media",
    label: "Books + Games + Media",
    labelDe: "Bücher + Games + Medien",
    icon: Globe,
    description: "Identifier-based books and physical media suitable for exact product comparison.",
    subcategories: [
      subcategory("media-books", "Books", "Bücher", ["book", "isbn", "bücher"]),
      subcategory("media-films", "Films", "Filme", ["blu-ray", "dvd", "film"]),
      subcategory("media-music", "Music", "Musik", ["vinyl record", "music cd", "audio cd"]),
      subcategory("media-audiobooks", "Audiobooks", "Hörbücher", ["audiobook", "hörbuch"]),
    ],
  },
  {
    id: "fashion-lifestyle",
    label: "Fashion + Lifestyle",
    labelDe: "Fashion + Lifestyle",
    icon: Tag,
    description: "Apparel, shoes, bags and accessories for cross-merchant style comparison.",
    subcategories: [
      subcategory("fashion-apparel", "Apparel", "Bekleidung", ["shirt", "jacket", "dress", "hoodie", "apparel"]),
      subcategory("fashion-shoes", "Shoes", "Schuhe", ["shoe", "sneaker", "boot", "trainer"]),
      subcategory("fashion-bags", "Bags", "Taschen", ["bag", "backpack", "handbag", "tote"]),
      subcategory("fashion-accessories", "Fashion Accessories", "Fashion-Accessoires", ["belt", "scarf", "cap", "wallet"]),
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

export const COMPARISON_COLLECTION_FILTERS: ComparisonCollectionFilter[] = [
  {
    id: "compare-cross-border",
    label: "Cross-border savings",
    description: "Offers that may be cheaper when ordered from another country.",
  },
  {
    id: "compare-local-pickup",
    label: "Pick up near you",
    description: "Click & Collect and local branch pickup options.",
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

export interface CategorySubcategoryGroup {
  id: string;
  label: string;
  subcategoryIds: string[];
}

/** Optional level-3 grouping for large departments in browse UI. */
export const CATEGORY_SUBCATEGORY_GROUPS: Record<string, CategorySubcategoryGroup[]> = {
  "computers-tablets": [
    {
      id: "computers-core",
      label: "Computers & displays",
      subcategoryIds: [
        "notebooks-laptops",
        "notebooks-desktops",
        "notebooks-monitors",
        "notebooks-tablets-pc",
        "computers-ereaders",
      ],
    },
    {
      id: "computers-peripherals",
      label: "Peripherals & accessories",
      subcategoryIds: [
        "peripherals-keyboard-mouse",
        "peripherals-webcam",
        "peripherals-storage",
        "peripherals-accessories",
        "computers-docks",
      ],
    },
  ],
  "photo-video-drones-optics": [
    {
      id: "photo-cameras",
      label: "Cameras",
      subcategoryIds: [
        "photo-mirrorless",
        "photo-dslr",
        "photo-compact",
        "photo-action",
        "photo-video-cameras",
      ],
    },
    {
      id: "photo-lenses-optics",
      label: "Lenses & optics",
      subcategoryIds: ["photo-lenses", "photo-binoculars", "photo-filters"],
    },
    {
      id: "photo-accessories",
      label: "Photo accessories",
      subcategoryIds: [
        "photo-flashes",
        "photo-studio-lighting",
        "photo-batteries",
        "photo-memory",
        "photo-tripods",
        "photo-gimbals",
        "photo-bags",
        "photo-microphones",
        "photo-remote",
        "photo-mounts",
        "photo-cleaning",
        "photo-cables",
      ],
    },
    {
      id: "photo-drones",
      label: "Drones & RC",
      subcategoryIds: [
        "drones-quadcopters",
        "drones-accessories",
        "drones-rc",
        "drones-gadgets",
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
    description: "Curated comparison views for cross-border, pickup, accessories and condition.",
    legacyIds: ["compare-cross-border", "compare-local-pickup", "compare-accessories", "compare-refurb"],
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
  "notebooks-pcs": "computers-tablets",
  peripherals: "computers-tablets",
  "pc-components": "pc-components-storage",
  "smartphones-tablets": "phones-wearables",
  wearables: "phones-wearables",
  "photo-video": "photo-video-drones-optics",
  "drones-electronics": "photo-video-drones-optics",
  networking: "network-smart-home-security",
  "office-stationery": "office-printing",
  software: "software-digital",
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
  "home-smart-home",
  "smart-home-lighting",
  "smart-home-security",
  "smart-home-climate",
] as const;

const LEGACY_MULTI_PARENT_GROUPS: Record<string, readonly string[]> = {
  "home-kitchen": LEGACY_HOME_KITCHEN_LEAF_IDS,
};

export function isLegacyMultiParentGroup(categoryId: string): boolean {
  return Boolean(LEGACY_MULTI_PARENT_GROUPS[categoryId]);
}

export function getLegacyMultiParentPrimaryDepartment(categoryId: string): string | null {
  if (categoryId === "home-kitchen") return "kitchen-coffee";
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
    const sub = cat.subcategories.find((s) => s.id === resolvedId);
    if (sub) return sub;
  }
  return undefined;
}

export function getParentCategoryId(categoryOrSubId: string): string | null {
  if (categoryOrSubId === ALL_CATEGORIES_ID) return null;
  const resolvedId = resolveCategoryAlias(categoryOrSubId);
  const direct = getCategoryById(resolvedId);
  if (direct) return direct.id;
  for (const cat of SHOPPING_CATEGORIES) {
    if (cat.subcategories.some((s) => s.id === resolvedId)) {
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

  const productCategory = resolveCategoryAlias(product.category);
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

  // Parent department selected → match by actual tree membership, not id prefix.
  const parentCat = getCategoryById(resolvedFilter);
  if (parentCat) {
    return parentCat.subcategories.some((subcategory) => subcategory.id === productCategory);
  }

  const sub = getSubcategoryById(resolvedFilter);
  if (sub) return false;

  // Legacy collection URLs remain functional, but collections are not taxonomy.
  if (categoryFilter === "compare-cross-border") {
    return Boolean(product.offers?.some((offer) => offer.type === "cross_border"));
  }
  if (categoryFilter === "compare-local-pickup") {
    return Boolean(product.offers?.some((offer) => offer.type === "local_pickup"));
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
      case "hub-books":
        return "Books + Media";
      case "hub-fashion":
        return "Fashion";
      case "hub-garden":
        return "Garden";
      case "hub-diy":
        return "DIY + Tools";
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
