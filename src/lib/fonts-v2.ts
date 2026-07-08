import { Cormorant_Garamond, Jost, Dancing_Script } from "next/font/google";

// version2 "blush & cream" fontları — YALNIZCA public sayfalarda (landing + press kit)
// kullanılır; root layout'a eklenmez ki admin panelinin fontları değişmesin.
// Türkçe karakterler (ı, İ, ş, ğ, ü, ö, ç) için latin-ext zorunlu.

// Başlıklar (h1–h3): zarif serif
export const cormorant = Cormorant_Garamond({
    subsets: ["latin", "latin-ext"],
    variable: "--font-cormorant-v2",
    display: "swap",
    weight: ["500", "600"],
    style: ["normal", "italic"],
});

// Gövde metni: hafif geometrik sans
export const jost = Jost({
    subsets: ["latin", "latin-ext"],
    variable: "--font-jost-v2",
    display: "swap",
    weight: ["300", "400", "500"],
});

// Dekoratif aksan: yalnızca kısa script vurgular için.
// preload: false — sadece footer'da geçiyor, preload uyarısı üretmesin.
export const dancingScript = Dancing_Script({
    subsets: ["latin", "latin-ext"],
    variable: "--font-dancing-v2",
    display: "swap",
    weight: ["400", "500"],
    preload: false,
});

// İki public sayfanın kök sarmalayıcısına eklenecek ortak sınıf dizisi
export const publicV2FontVars = `${cormorant.variable} ${jost.variable} ${dancingScript.variable}`;
