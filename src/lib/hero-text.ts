// Hero kapak metni — paylaşılan anahtarlar/varsayılanlar.
// Hem client (admin editörü) hem server (API + public render) kullanır;
// bu dosyaya Tailwind sınıfı KOYMA (src/lib content glob'da taranmıyor) —
// sınıf haritaları src/components/hero-text-config.ts içinde.

export const HERO_FONT_KEYS = [
    "cormorant",
    "playfair",
    "cinzel",
    "jost",
    "dancing",
    "parisienne",
] as const;
export type HeroFontKey = (typeof HERO_FONT_KEYS)[number];

export const HERO_SIZE_KEYS = ["kucuk", "orta", "buyuk"] as const;
export type HeroSizeKey = (typeof HERO_SIZE_KEYS)[number];

export const HERO_POSITION_KEYS = [
    "sol-ust", "orta-ust", "sag-ust",
    "sol-orta", "tam-orta", "sag-orta",
    "sol-alt", "orta-alt", "sag-alt",
] as const;
export type HeroPositionKey = (typeof HERO_POSITION_KEYS)[number];

// DB alanları boşsa kullanılan değerler — bugünkü hardcoded görünümün aynısı,
// böylece özellik ilk açıldığında site değişmez.
export const HERO_DEFAULTS = {
    title: "Begüm Atak",
    subtitle: "Tiyatro sahnesinden ekrana uzanan bir yolculuk",
    titleFont: "cormorant" as HeroFontKey,
    subtitleFont: "cormorant" as HeroFontKey,
    titleSize: "buyuk" as HeroSizeKey,
    subtitleSize: "orta" as HeroSizeKey,
    position: "tam-orta" as HeroPositionKey,
};

export function asHeroFont(v: string | null | undefined): HeroFontKey | null {
    return HERO_FONT_KEYS.includes(v as HeroFontKey) ? (v as HeroFontKey) : null;
}

export function asHeroSize(v: string | null | undefined): HeroSizeKey | null {
    return HERO_SIZE_KEYS.includes(v as HeroSizeKey) ? (v as HeroSizeKey) : null;
}

export function asHeroPosition(v: string | null | undefined): HeroPositionKey {
    return HERO_POSITION_KEYS.includes(v as HeroPositionKey)
        ? (v as HeroPositionKey)
        : HERO_DEFAULTS.position;
}
