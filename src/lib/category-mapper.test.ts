import { describe, it, expect } from 'vitest';
import {
  mapToBeforeToBuyCategory,
  mapToBeforeToBuyCategoryWithMetadata,
  MIN_MAPPING_CONFIDENCE,
} from './category-mapper';
import { UNMAPPED_CATEGORY_ID } from './categories';
import {
  MAPPING_MERCHANT_IDS,
  validateMerchantCategoryRules,
} from './merchant-category-rules';
import { buildMappingReport } from './mapping-log';

const BRACK_SAMPLE_ROWS = [
  {
    merchantCategory: "Smartphones",
    title: "Apple iPhone 16 Pro 256GB Natural Titanium",
    expected: "mobile-smartphones",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Laptops",
    title: "Apple MacBook Air 13 M3 256GB Midnight",
    expected: "notebooks-laptops",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Headphones",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    expected: "audio-headphones",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Computer Accessories",
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    expected: "peripherals-accessories",
    method: "merchant-exact",
  },
] as const;

describe('Category Mapper Functions', () => {
  it("merchant category rules validate without conflicts", () => {
    expect(validateMerchantCategoryRules()).toEqual([]);
    expect(MAPPING_MERCHANT_IDS.length).toBe(20);
  });

  it("Brack sample feed rows map with merchant-exact rules", () => {
    for (const row of BRACK_SAMPLE_ROWS) {
      const result = mapToBeforeToBuyCategoryWithMetadata({
        merchantId: "ch-brack",
        merchantCategory: row.merchantCategory,
        title: row.title,
      });

      expect(result.categoryId).toBe(row.expected);
      expect(result.method).toBe(row.method);
      expect(result.confidence).toBeGreaterThanOrEqual(MIN_MAPPING_CONFIDENCE);
    }
  });

  it("Digitec merchant categories resolve deterministically", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-digitec",
        merchantCategory: "Mobile & Smartphones",
        title: "Samsung Galaxy",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-digitec",
        merchantCategory: "TV & Home Cinema",
        title: "LG OLED TV",
      })
    ).toBe("tv-televisions");
  });

  it("Galaxus, Interdiscount, Fust and MediaMarkt have dedicated exact maps", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-galaxus",
        merchantCategory: "Mobile Telephony",
        title: "Phone",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-interdiscount",
        merchantCategory: "TV & Audio",
        title: "TV",
      })
    ).toBe("tv-televisions");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-fust",
        merchantCategory: "Large Household Appliances",
        title: "Washer",
      })
    ).toBe("large-fridges-freezers");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-mediamarkt",
        merchantCategory: "Smartphones & Tablets",
        title: "Phone",
      })
    ).toBe("mobile-smartphones");
  });

  it("unknown feed products are explicitly unmapped", () => {
    const result = mapToBeforeToBuyCategoryWithMetadata({
      merchantCategory: "Unknown merchant aisle",
      title: "ZXQ item without a recognized product type",
    });

    expect(result.categoryId).toBe(UNMAPPED_CATEGORY_ID);
    expect(result.method).toBe("unmapped");
    expect(result.confidence).toBe(0);
  });

  it("Scule365 maps from title when My Feeds omits category", () => {
    const sander = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Masina de slefuit rotativa 450W Epto EvoTools",
    });
    expect(sander.categoryId).toBe("diy-sanders");
    expect(sander.method).toBe("merchant-pattern");

    const drill = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Bormasina cu impact brushless 20V Ingco",
    });
    expect(drill.categoryId).toBe("diy-power-tools");

    const fallback = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "ZXQ item without a recognized product type",
    });
    expect(fallback.categoryId).toBe("diy-hand-tools");
    expect(fallback.method).toBe("merchant-default");

    const screwdrivers = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Set Surubelnite 26 bucati cu Suport, Ingco HKSD2628 – Maner Ergonomic",
    });
    expect(screwdrivers.categoryId).toBe("diy-hand-tools");
    expect(screwdrivers.method).toBe("merchant-pattern");

    const tileCutter = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Dispozitiv Taiat Gresie/Faianta Cu Perforator 450 mm Evotools",
    });
    expect(tileCutter.categoryId).toBe("diy-power-tools");

    // Kitchen / garden wording must still stay inside Bricolaj (diy-tools).
    const pots = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Set Oale cu Tigaie Capace Sticla 7 buc Totakila",
    });
    expect(pots.categoryId.startsWith("diy-")).toBe(true);

    const mower = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-scule365",
      title: "Masina Tuns Iarba 1200W INGCO LM321",
    });
    expect(mower.categoryId).toBe("diy-power-tools");
    expect(mower.categoryId.startsWith("garden-")).toBe(false);
  });

  it("Rowenta maps Romanian feed categories into fine cleaning and grooming leaves", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-rowenta",
        merchantCategory: "Aspiratoare verticale",
        title: "Aspirator vertical Rowenta X-Force",
      })
    ).toBe("cleaning-stick-vacuums");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-rowenta",
        merchantCategory: "Accesorii",
        title: "Sac de praf Rowenta",
      })
    ).toBe("cleaning-accessories");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-rowenta",
        merchantCategory: "Aparate de tuns",
        title: "Aparat de tuns parul Rowenta",
      })
    ).toBe("care-shaving-hair-removal");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-rowenta",
        merchantCategory: "Plăci de păr și perii de îndreptat părul",
        title: "Placă de păr Rowenta",
      })
    ).toBe("care-hair-styling");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-rowenta",
        merchantCategory: "Epilatoare",
        title: "Epilator Rowenta",
      })
    ).toBe("care-shaving-hair-removal");

    // Kitchen / unrelated wording must not leave the Rowenta aisle.
    const kitchenLeak = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-rowenta",
      merchantCategory: "Aparate de gatit",
      title: "Cuptor electric Rowenta",
    });
    expect(kitchenLeak.categoryId).toBe("cleaning-vacuums");
  });

  it("low-confidence keyword matches fall below threshold into unmapped", () => {
    const result = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ch-brack",
      merchantCategory: "Miscellaneous",
      title: "Generic USB cable accessory",
      description: "A simple cable",
    });

    expect(result.categoryId).toBe(UNMAPPED_CATEGORY_ID);
    expect(result.method).toBe("below-threshold");
    expect(result.proposedCategoryId).toBeTruthy();
    expect(result.confidence).toBeLessThan(MIN_MAPPING_CONFIDENCE);
  });

  it("mapping report aggregates review queue for manual checks", () => {
    const mapped = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ch-brack",
      merchantCategory: "Smartphones",
      title: "Phone",
    });
    const unmapped = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ch-brack",
      merchantCategory: "Mystery aisle",
      title: "Unknown widget",
    });

    const report = buildMappingReport([
      {
        productId: "feed-1",
        merchantId: "ch-brack",
        title: "Phone",
        rawCategory: "Smartphones",
        categoryId: mapped.categoryId,
        method: mapped.method,
        confidence: mapped.confidence,
        mappedAt: new Date().toISOString(),
      },
      {
        productId: "feed-2",
        merchantId: "ch-brack",
        title: "Unknown widget",
        rawCategory: "Mystery aisle",
        categoryId: unmapped.categoryId,
        method: unmapped.method,
        confidence: unmapped.confidence,
        mappedAt: new Date().toISOString(),
      },
    ]);

    expect(report.summary.total).toBe(2);
    expect(report.summary.mapped).toBe(1);
    expect(report.summary.unmapped).toBe(1);
    expect(report.reviewQueue.length).toBe(1);
    expect(report.reviewQueue[0]?.productId).toBe("feed-2");
  });

  it("Reifen.com maps rims and complete wheels off the tyre leaf", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        merchantCategory: "Kompletträder",
        title: "Komplettrad 17 Zoll Michelin + AEZ",
      })
    ).toBe("auto-complete-wheels");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        merchantCategory: "Felgen",
        title: "20 Ludwig 7 5x17 5x112 ET35 MB66 6",
      })
    ).toBe("auto-complete-wheels");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        title: "17 Fritz 9 0x21 5x112 ET45 MB66 6",
      })
    ).toBe("auto-complete-wheels");
  });

  it("Reifen.com keeps tyre codes out of electronics", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        title: "275/35 ZR19(100Y)Pilot Super Sport XL*Selfseal TV",
      })
    ).toBe("auto-tires-wheels");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        title: "265/60 R18 110T Shredder AT FSL",
      })
    ).toBe("auto-tires-wheels");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-reifencom",
        title: "110/90-19 62R TT Tracker Moto Rear M/C",
      })
    ).toBe("auto-tires-wheels");
  });

  it("Reifen.de maps its feed aisles to tyres, rims and oils", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "de-reifen",
        merchantCategory: "tyres",
        title: "AllSeasonContact",
      })
    ).toBe("auto-tires-wheels");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "de-reifen",
        merchantCategory: "Wheels",
        title: "SUPERTURISMO GT",
      })
    ).toBe("auto-rims");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "de-reifen",
        merchantCategory: "Car Accessories",
        title: "SUPER 3000 XE 5W-30",
      })
    ).toBe("auto-oils-fluids");
  });

  it("Belando maps haircare aisles and keeps brand folders in beauty", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Haircare Products",
        title: "Wella Performance Haarspray 500 ml",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Fragrance",
        title: "Chanel Chance Eau de Toilette",
      })
    ).toBe("fashion-beauty-fragrance");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Haircare Appliances",
        title: "BaByliss Pro Hair Dryer",
      })
    ).toBe("care-hair-styling");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        title: "Samsung Galaxy S24 Ultra 256GB",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Haircare Appliances",
        title: "Wella SP Balance Scalp Shampoo 250 ml",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Haarstyling",
        title: "Jaguar A-Line Haarschneidekamm",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Small Appliances",
        title: "Schwarzkopf Professional Paddle Brush",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        title: "Wella EIMI Perfect Setting Föhn Lotion 150 ml",
      })
    ).toBe("fashion-beauty-hair-care");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-belando",
        merchantCategory: "Haircare Appliances",
        title: "Aufsteckkamm 10mm für die Wahl Super Taper Haarschneidemaschine",
      })
    ).toBe("fashion-beauty-hair-care");
  });

  it("Acer CH maps notebooks, desktops, monitors and projectors", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Notebooks",
        title: "Acer Swift Go 14 OLED",
      })
    ).toBe("notebooks-laptops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Desktop-PCs",
        title: "Acer Aspire TC Desktop",
      })
    ).toBe("notebooks-desktops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Monitore",
        title: "Acer Nitro XV240 Y3",
      })
    ).toBe("notebooks-monitors");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Projektoren",
        title: "Acer H6546BD Beamer",
      })
    ).toBe("tv-projectors");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        title: "Samsung Galaxy S24 Ultra 256GB",
      })
    ).toBe("notebooks-laptops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        title: "Acer höhenverstellbarer Schreibtisch",
      })
    ).toBe("office-home");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Notebooks",
        title:
          "3 Jahre Einsende-/Rücksendeservice einschließlich International Travellers Warranty | Notebook Aspire, Swift & TravelMate",
      })
    ).toBe("peripherals-accessories");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Monitore",
        title: "4 Jahre Garantieverlängerung | Gaming Monitore",
      })
    ).toBe("peripherals-accessories");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Notebooks",
        title: "Acer Aspire 14 Laptop inklusive 2 Jahre Garantie",
      })
    ).toBe("notebooks-laptops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-acer",
        merchantCategory: "Notebooks",
        title: "Acer Swift Go 14 Laptop with 2 years warranty",
      })
    ).toBe("notebooks-laptops");
  });

  it("Gigasport CH maps apparel, running shoes and bike locks from titles", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-gigasport",
        title: "adidas Sportswear Hoodie Damen schwarz",
      })
    ).toBe("fashion-women-activewear");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-gigasport",
        title: "ASICS Gel-Pulse 15 Laufschuhe Herren",
      })
    ).toBe("fashion-shoes-men-sport");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-gigasport",
        title: "ABUS Fahrrad-Faltschloss BORDO 6000K/90 schwarz",
      })
    ).toBe("mobility-accessories");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-gigasport",
        title: "Brooks Ghost 16 Laufschuhe Kinder",
      })
    ).toBe("fashion-shoes-kids-sport");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-gigasport",
        title: "Samsung Galaxy S24 Ultra 256GB",
      })
    ).toBe("fashion-men-activewear");
  });

  it("baby-walz keeps strollers/clothes out of electronics", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        merchantCategory: "Kinderwagen",
        title: "Kombikinderwagen Single",
      })
    ).toBe("baby-strollers-travel");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        title: "T-Shirt Maus",
      })
    ).toBe("fashion-kids-baby");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        title: "Windeleimer Twist & Click inklusive 6er-Pack Nachfüllkassetten",
      })
    ).toBe("fashion-kids-baby");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        merchantCategory: "Autositze",
        title: "Babyschale Pebble 360",
      })
    ).toBe("baby-car-seats");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        merchantCategory: "Bekleidung",
        title: "Kinderfahrrad Petitage 14 Zoll",
      })
    ).toBe("toys-electronic");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        merchantCategory: "Bekleidung",
        title: "Kindersitzgarnitur Tisch & 2 Stühle",
      })
    ).toBe("baby-nursery");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ch-babywalz",
        title: "Hüfttrage Upsie",
      })
    ).toBe("baby-strollers-travel");
  });

  it("Seentat UK merchant aisles map to electronics leaves", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Mobile",
        title: "Apple iPhone 15 128GB",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Lens",
        title: "Canon RF 24-70mm",
      })
    ).toBe("photo-lenses");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "Kodak PIXPRO FZ55",
      })
    ).toBe("photo-compact");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "DJI Mini 3 Fly More Combo with DJI RC",
      })
    ).toBe("drones-quadcopters");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Gaming",
        title: "DJI Air 3S Drone (DJI RC-N3)",
      })
    ).toBe("drones-quadcopters");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "DJI",
        title: "DJI Osmo Action 6 Standard Combo - Black",
      })
    ).toBe("photo-action");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "GoPro HERO13 BLACK",
      })
    ).toBe("photo-action");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Accessory",
        title: "DJI Osmo Mobile 7P Gimbal",
      })
    ).toBe("photo-bags");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Apple",
        title: "Apple iPhone 17 Pro SIM Free",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Apple",
        title: "Apple AirPods Pro 3 with MagSafe Charging Case MFHP4",
      })
    ).toBe("audio-headphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Computer",
        title: "Apple MacBook Pro 14-inch M5 16+512GB - Silver MDE44ZP/A",
      })
    ).toBe("notebooks-laptops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "Canon EOS R5 II Mirrorless Camera Body Only",
      })
    ).toBe("photo-mirrorless");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "Sony ZV-E10 VLOG Camera with 16-50mm Lens",
      })
    ).toBe("photo-mirrorless");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Personal Care",
        title: "Braun Series 9 Pro Electric Shaver - 9675CC",
      })
    ).toBe("care-shaving-hair-removal");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Gaming",
        title: "Nintendo Switch 2",
      })
    ).toBe("gaming-consoles");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Apple",
        title: "Apple TV 4K 3rd Generation 2022",
      })
    ).toBe("tv-televisions");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Camera",
        title: "Nikon D850 Digital Reflex Camera Body Only",
      })
    ).toBe("photo-dslr");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Gaming",
        title: "STEAM Deck OLED",
      })
    ).toBe("gaming-consoles");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        title: "HUAWEI WATCH ULTIMATE 2 Global Version - Green",
      })
    ).toBe("wearables-smartwatch");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Men's Watches",
        title: "Casio G-Shock G-Steel GST-B1000 Series",
      })
    ).toBe("unmapped");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Smartwatch",
        title: "Samsung Galaxy Watch Ultra",
      })
    ).toBe("wearables-smartwatch");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        title: "Xiaomi Redmi Pad 2 Global Version 11inch 8+256GB 4G",
      })
    ).toBe("mobile-tablets");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Mobile",
        title: "Nothing Phone (3) 12+256GB 5G SIM Free",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-seentat",
        merchantCategory: "Headphone",
        title: "Xiaomi Redmi Buds 8 Pro True Wireless Earbuds - Black",
      })
    ).toBe("audio-headphones");
  });

  it("legacy global patterns still work without merchant id", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantCategory: "Smartphones",
        title: "Apple iPhone",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantCategory: "Laptops",
        title: "Lenovo ThinkPad notebook",
      })
    ).toBe("notebooks-laptops");
  });

  it("evoMAG does not map networking gear to smartphones via description", () => {
    const extender = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-evomag",
      merchantCategory: "Extendere Wi-Fi",
      title: "Range Extender Wireless TP-LINK RE305",
      description: "Gestioneaza reteaua din aplicatia de pe smartphone",
    });
    expect(extender.categoryId).toBe("networking-routers");
    expect(extender.method).toBe("merchant-exact");

    const camera = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-evomag",
      merchantCategory: "Camere supraveghere video pentru interior",
      title: "Camera Supraveghere Video Lanberg",
      description: "securitate si supraveghere prin smartphone 24/7",
    });
    expect(camera.categoryId).toBe("smart-home-security");

    const phone = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-evomag",
      merchantCategory: "Telefoane",
      title: "Telefon mobil Panasonic KX-TU110EXC",
    });
    expect(phone.categoryId).toBe("mobile-smartphones");
    expect(phone.method).toBe("merchant-exact");
  });

  it("evoMAG keeps laptop bags and scooter parts out of core aisles", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Genti si Huse laptop",
        title: "Geanta Laptop Targus TAR300 15.6inch",
      })
    ).toBe("peripherals-accessories");

    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Piese Trotinete Electrice",
        title: "Disc de frana pentru trotineta electrica Xiaomi",
      })
    ).toBe("mobility-accessories");

    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Trotinete electrice adulti & copii",
        title: "Trotineta electrica Xiaomi",
      })
    ).toBe("mobility-escooters");
  });

  it("Arlo security aisles stay in smart-home security", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-arlo",
        merchantCategory: "Security Equipment",
        title: "Arlo Essential Wireless Security Camera",
      })
    ).toBe("smart-home-security");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-arlo",
        merchantCategory: "Home Security",
        title: "Arlo Video Doorbell Wire-Free",
      })
    ).toBe("smart-home-security");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-arlo",
        title: "Samsung Galaxy S24 Ultra 256GB",
      })
    ).toBe("smart-home-security");
  });

  it("DJI US maps drones, action cameras and gimbals from titles", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI Mini 4 Pro Fly More Combo",
      })
    ).toBe("drones-quadcopters");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI Osmo Action 5 Pro Adventure Combo",
      })
    ).toBe("photo-action");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI Osmo Mobile 7P Gimbal",
      })
    ).toBe("photo-gimbals");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI Mic Mini",
      })
    ).toBe("photo-microphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI RS Multi-Camera Control Cable (USB-C)",
      })
    ).toBe("photo-gimbals");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI OM Magnetic Phone Clamp 5",
      })
    ).toBe("photo-gimbals");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "DJI Air 3S Intelligent Flight Battery",
      })
    ).toBe("drones-accessories");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-dji",
        title: "Samsung Galaxy S24 Ultra 256GB",
      })
    ).toBe("drones-quadcopters");
  });

  it("Ottocast Automotive aisle maps to in-car audio", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "us-ottocast",
        merchantCategory: "Automotive",
        title: "Ottocast Mini Cube Wireless CarPlay Adapter",
      })
    ).toBe("audio-car");
  });

  it("Geepas Kitchen Units aisle maps by title patterns", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "Geepas Digital Espresso Coffee Machine",
      })
    ).toBe("kitchen-coffee-machines");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "Geepas Air Fryer 4.5L",
      })
    ).toBe("kitchen-cooking-appliances");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "Geepas Electric Kettle 1.7L",
      })
    ).toBe("kitchen-breakfast");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "2400W Digital Display Smart Ceramic Steam Iron",
      })
    ).toBe("laundry-ironing-sewing");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "2000W Premium Oscillating Ceramic PTC Tower Heater",
      })
    ).toBe("climate-heating");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "2-In-1 Stick & Hand HEPA Vacuum Cleaner With Touch Display",
      })
    ).toBe("cleaning-vacuums");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "Engraved Rechargeable Vintage Beard Trimmer With LED Display",
      })
    ).toBe("care-shaving-hair-removal");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "gb-geepas",
        merchantCategory: "Kitchen Units",
        title: "Geepas Gift Card - The Perfect Gift, Every Time",
      })
    ).toBe("digital-gift-cards");
  });

  it("evoMAG Sisteme PC feed aisles map to desktop / component leaves", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Branduri",
        title: "Calculator Sistem Mini PC Asus",
      })
    ).toBe("notebooks-desktops");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "HDD Server",
        title: "HDD Server HP 1.2TB SAS",
      })
    ).toBe("pc-ram-ssd");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Procesoare Server",
        title: "Procesor server AMD EPYC",
      })
    ).toBe("pc-cpu");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Surse Server",
        title: "Sursa Server HP 800W",
      })
    ).toBe("pc-motherboard");
  });

  it("evoMAG VIDEO feed aisles map to photo / TV / security leaves", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Camere Video",
        title: "Camere video de actiune Mediacom",
      })
    ).toBe("photo-video-cameras");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Ecrane de proiectie",
        title: "Ecran de proiectie",
      })
    ).toBe("tv-screens");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Sisteme Supraveghere Video",
        title: "Sistem supraveghere",
      })
    ).toBe("smart-home-security");
    expect(
      mapToBeforeToBuyCategory({
        merchantId: "ro-evomag",
        merchantCategory: "Videoproiectoare",
        title: "Videoproiector Epson",
      })
    ).toBe("tv-projectors");
  });

  it("evoMAG skips keyword invention when aisle is unknown", () => {
    const robot = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-evomag",
      merchantCategory: "Mystery aisle xyz",
      title: "Aspirator Robot Xiaomi Wi-Fi",
      description: "controleaza de pe smartphone",
    });
    expect(robot.categoryId).toBe(UNMAPPED_CATEGORY_ID);

    const husa = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ro-evomag",
      merchantCategory: "Telefoane, Tablete & Accesorii",
      title: "Husa Book Cover OEM pentru Samsung Galaxy A5 (2017)",
    });
    expect(husa.categoryId).toBe("mobile-accessories");
  });
});
