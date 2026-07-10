import type { HeroPositionKey, HeroSizeKey } from "@/lib/hero-text";

// Hero kapak metni Tailwind sınıf haritaları. Bu dosya src/components
// altında ÇÜNKÜ tailwind content glob'u src/lib'i taramıyor — buradaki
// literal sınıflar sayesinde utility'ler üretiliyor.

// flex: hero section'ının hizalaması; pad: kenar konumlarında nav/scroll
// göstergesi ve mobil taşma için güvenli boşluk (tam-orta'da boş → bugünkü
// görünüm birebir korunur); block: metin bloğunun iç hizalaması.
export const HERO_POSITION_CLASSES: Record<
    HeroPositionKey,
    { flex: string; pad: string; block: string; label: string }
> = {
    "sol-ust": { flex: "items-start justify-start", pad: "pt-28 md:pt-32 pl-4 md:pl-16", block: "text-left items-start", label: "Sol Üst" },
    "orta-ust": { flex: "items-start justify-center", pad: "pt-28 md:pt-32", block: "text-center items-center", label: "Orta Üst" },
    "sag-ust": { flex: "items-start justify-end", pad: "pt-28 md:pt-32 pr-4 md:pr-16", block: "text-right items-end", label: "Sağ Üst" },
    "sol-orta": { flex: "items-center justify-start", pad: "pl-4 md:pl-16", block: "text-left items-start", label: "Sol Orta" },
    "tam-orta": { flex: "items-center justify-center", pad: "", block: "text-center items-center", label: "Tam Orta" },
    "sag-orta": { flex: "items-center justify-end", pad: "pr-4 md:pr-16", block: "text-right items-end", label: "Sağ Orta" },
    "sol-alt": { flex: "items-end justify-start", pad: "pb-24 md:pb-28 pl-4 md:pl-16", block: "text-left items-start", label: "Sol Alt" },
    "orta-alt": { flex: "items-end justify-center", pad: "pb-24 md:pb-28", block: "text-center items-center", label: "Orta Alt" },
    "sag-alt": { flex: "items-end justify-end", pad: "pb-24 md:pb-28 pr-4 md:pr-16", block: "text-right items-end", label: "Sağ Alt" },
};

// "buyuk" başlık = bugünkü text-display-xl, "orta" alt metin = bugünkü
// text-xl md:text-2xl — varsayılanlar mevcut görünümle birebir aynı.
export const HERO_TITLE_SIZE_CLASSES: Record<HeroSizeKey, string> = {
    kucuk: "text-4xl md:text-5xl",
    orta: "text-5xl md:text-7xl",
    buyuk: "text-display-xl",
};

export const HERO_SUBTITLE_SIZE_CLASSES: Record<HeroSizeKey, string> = {
    kucuk: "text-base md:text-lg",
    orta: "text-xl md:text-2xl",
    buyuk: "text-2xl md:text-3xl",
};

// Admin canlı önizlemesi küçük bir kutuda çalıştığı için oransal küçük eşdeğerler.
export const PREVIEW_TITLE_SIZE_CLASSES: Record<HeroSizeKey, string> = {
    kucuk: "text-lg",
    orta: "text-2xl",
    buyuk: "text-4xl",
};

export const PREVIEW_SUBTITLE_SIZE_CLASSES: Record<HeroSizeKey, string> = {
    kucuk: "text-[10px]",
    orta: "text-xs",
    buyuk: "text-sm",
};

export const HERO_SIZE_LABELS: Record<HeroSizeKey, string> = {
    kucuk: "Küçük",
    orta: "Orta",
    buyuk: "Büyük",
};
