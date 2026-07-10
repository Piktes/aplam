import { Playfair_Display, Cinzel, Parisienne } from "next/font/google";
import { cormorant, jost, dancingScript } from "@/lib/fonts-v2";
import type { HeroFontKey } from "@/lib/hero-text";

// Hero kapak metni font seçenekleri. İlk üçü fonts-v2'den yeniden kullanılır
// (public sayfada zaten yüklüler). Yeniler preload:false — @font-face CSS'i
// çıkar ama font dosyası yalnız o aileyle metin render edilince indirilir;
// böylece public hero'da sadece SEÇİLİ font iner, sitede global font
// değişikliği olmaz. latin-ext: Türkçe karakterler (ı İ ş ğ ü ö ç) için şart.

const playfair = Playfair_Display({
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: ["500", "600"],
    style: ["normal", "italic"],
    preload: false,
});

const cinzel = Cinzel({
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: ["400", "600"],
    preload: false,
});

const parisienne = Parisienne({
    subsets: ["latin", "latin-ext"],
    display: "swap",
    weight: "400",
    preload: false,
});

// fontFamily inline style olarak uygulanır (className değil): .public-v2 h1
// gibi element+class seçicileri tek class'lı next/font seçicisini ezerdi,
// inline style ise her zaman kazanır.
export const HERO_FONTS: Record<HeroFontKey, { label: string; fontFamily: string }> = {
    cormorant: { label: "Cormorant Garamond", fontFamily: cormorant.style.fontFamily },
    playfair: { label: "Playfair Display", fontFamily: playfair.style.fontFamily },
    cinzel: { label: "Cinzel", fontFamily: cinzel.style.fontFamily },
    jost: { label: "Jost", fontFamily: jost.style.fontFamily },
    dancing: { label: "Dancing Script", fontFamily: dancingScript.style.fontFamily },
    parisienne: { label: "Parisienne", fontFamily: parisienne.style.fontFamily },
};
