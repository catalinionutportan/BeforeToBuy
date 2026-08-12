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
    expect(MAPPING_MERCHANT_IDS.length).toBe(13);
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